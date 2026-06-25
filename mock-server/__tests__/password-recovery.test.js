const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const {
  passwordRecoveryRequests,
  clearRecoveryRequests,
} = require("../lib/passwordRecovery");

const app = require("../server");

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path,
          method,
          headers: {
            "Content-Type": "application/json",
            ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            server.close();
            resolve({
              status: res.statusCode,
              body: data ? JSON.parse(data) : null,
            });
          });
        }
      );
      req.on("error", (err) => {
        server.close();
        reject(err);
      });
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  });
}

describe("password recovery API", () => {
  before(() => {
    clearRecoveryRequests();
  });

  after(() => {
    clearRecoveryRequests();
  });

  it("request returns neutral success for known email with devOtp", async () => {
    const res = await request("POST", "/password-recovery/request", {
      email: "user@easybuy.com",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /If an account exists/);
    assert.ok(res.body.data.devOtp);
    assert.equal(res.body.data.devOtp.length, 6);
  });

  it("request returns neutral success for unknown email without devOtp", async () => {
    const res = await request("POST", "/password-recovery/request", {
      email: "unknown@easybuy.com",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data, {});
  });

  it("happy path: request → verify → reset → login", async () => {
    clearRecoveryRequests();
    const requestRes = await request("POST", "/password-recovery/request", {
      email: "user@easybuy.com",
    });
    const otp = requestRes.body.data.devOtp;

    const verifyRes = await request("POST", "/password-recovery/verify", {
      email: "user@easybuy.com",
      otp,
    });
    assert.equal(verifyRes.status, 200);
    assert.ok(verifyRes.body.data.resetToken);

    const resetRes = await request("POST", "/password-recovery/reset", {
      email: "user@easybuy.com",
      resetToken: verifyRes.body.data.resetToken,
      newPassword: "newpass1",
      confirmPassword: "newpass1",
    });
    assert.equal(resetRes.status, 200);
    assert.equal(resetRes.body.message, "Password reset successfully.");

    const loginRes = await request("POST", "/login", {
      email: "user@easybuy.com",
      password: "newpass1",
    });
    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.success, true);
  });

  it("verify rejects invalid otp", async () => {
    clearRecoveryRequests();
    await request("POST", "/password-recovery/request", {
      email: "jane@easybuy.com",
    });
    const res = await request("POST", "/password-recovery/verify", {
      email: "jane@easybuy.com",
      otp: "000000",
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.message, "Invalid or expired code. Request a new one.");
  });

  it("request returns 429 when rate limited", async () => {
    clearRecoveryRequests();
    const email = "ratelimit@easybuy.com";
    await request("POST", "/register", {
      email,
      password: "test123",
      name: "Rate Limit User",
      userType: "USER",
    });

    for (let i = 0; i < 3; i += 1) {
      const res = await request("POST", "/password-recovery/request", { email });
      assert.equal(res.status, 200);
    }

    const limited = await request("POST", "/password-recovery/request", { email });
    assert.equal(limited.status, 429);
    assert.equal(limited.body.message, "Too many requests. Please try again later.");
  });

  it("verify returns 429 after max attempts", async () => {
    clearRecoveryRequests();
    const email = "maxattempts@easybuy.com";
    await request("POST", "/register", {
      email,
      password: "test123",
      name: "Max Attempts User",
      userType: "USER",
    });

    const requestRes = await request("POST", "/password-recovery/request", { email });
    assert.ok(requestRes.body.data.devOtp);

    let lastStatus = 400;
    for (let i = 0; i < 6; i += 1) {
      const res = await request("POST", "/password-recovery/verify", {
        email,
        otp: "000000",
      });
      lastStatus = res.status;
      if (res.status === 429) {
        assert.equal(res.body.message, "Too many attempts. Request a new code.");
        return;
      }
    }
    assert.equal(lastStatus, 429);
  });

  it("reset returns 400 for expired reset token", async () => {
    clearRecoveryRequests();
    const email = "expiredtoken@easybuy.com";
    await request("POST", "/register", {
      email,
      password: "test123",
      name: "Expired Token User",
      userType: "USER",
    });

    const requestRes = await request("POST", "/password-recovery/request", { email });
    const otp = requestRes.body.data.devOtp;
    const verifyRes = await request("POST", "/password-recovery/verify", { email, otp });
    const resetToken = verifyRes.body.data.resetToken;

    const record = passwordRecoveryRequests.find((r) => r.resetToken === resetToken);
    assert.ok(record);
    record.resetTokenExpiresAt = new Date(Date.now() - 1000).toISOString();

    const resetRes = await request("POST", "/password-recovery/reset", {
      email,
      resetToken,
      newPassword: "newpass1",
      confirmPassword: "newpass1",
    });
    assert.equal(resetRes.status, 400);
    assert.equal(resetRes.body.message, "Recovery session expired. Please start again.");
  });

  it("devOtp absent when NODE_ENV=production", async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete require.cache[require.resolve("../lib/otpDelivery")];
    delete require.cache[require.resolve("../server")];
    clearRecoveryRequests();

    const prodApp = require("../server");

    const prodRequest = (method, path, body) =>
      new Promise((resolve, reject) => {
        const server = prodApp.listen(0, "127.0.0.1", () => {
          const { port } = server.address();
          const payload = body ? JSON.stringify(body) : null;
          const req = http.request(
            {
              hostname: "127.0.0.1",
              port,
              path,
              method,
              headers: {
                "Content-Type": "application/json",
                ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
              },
            },
            (res) => {
              let data = "";
              res.on("data", (chunk) => {
                data += chunk;
              });
              res.on("end", () => {
                server.close();
                resolve({
                  status: res.statusCode,
                  body: data ? JSON.parse(data) : null,
                });
              });
            }
          );
          req.on("error", (err) => {
            server.close();
            reject(err);
          });
          if (payload) {
            req.write(payload);
          }
          req.end();
        });
      });

    const res = await prodRequest("POST", "/password-recovery/request", {
      email: "admin@easybuy.com",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data, {});

    process.env.NODE_ENV = prevEnv;
    delete require.cache[require.resolve("../lib/otpDelivery")];
    delete require.cache[require.resolve("../server")];
  });
});
