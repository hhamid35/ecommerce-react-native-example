const request = require("supertest");
const {
  app,
  users,
  passwordResetTokens,
  maskEmail,
  isValidEmail,
  validatePasswordChange,
  PASSWORD_RESET_TOKEN_TTL_MS,
} = require("./server");

describe("password reset helpers", () => {
  it("validates email format", () => {
    expect(isValidEmail("user@easybuy.com")).toBe(true);
    expect(isValidEmail("bad")).toBe(false);
  });

  it("masks email addresses", () => {
    expect(maskEmail("user@easybuy.com")).toBe("u***@easybuy.com");
  });

  it("rejects reused passwords", () => {
    const user = { password: "oldpass" };
    const result = validatePasswordChange(user, "oldpass", "oldpass");
    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      "You are not allowed to set the previous used password"
    );
  });
});

describe("password reset endpoints", () => {
  beforeEach(() => {
    passwordResetTokens.length = 0;
    const user = users.find((u) => u.email === "user@easybuy.com");
    if (user) {
      user.password = "user123";
    }
  });

  it("returns generic success for unknown emails", async () => {
    const response = await request(app)
      .post("/password-reset/request")
      .send({ email: "missing@easybuy.com" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "If an account exists for that email, reset instructions have been sent."
    );
    expect(response.body.data).toBeNull();
  });

  it("returns dev reset token for known emails", async () => {
    const response = await request(app)
      .post("/password-reset/request")
      .send({ email: "user@easybuy.com" });

    expect(response.status).toBe(200);
    expect(response.body.data.devResetToken).toBeTruthy();
    expect(response.body.data.devResetUrl).toContain("easybuy://reset-password");
  });

  it("rejects malformed email requests", async () => {
    const response = await request(app)
      .post("/password-reset/request")
      .send({ email: "bad" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("A valid email is required");
  });

  it("verifies a valid token", async () => {
    const requestResponse = await request(app)
      .post("/password-reset/request")
      .send({ email: "user@easybuy.com" });
    const token = requestResponse.body.data.devResetToken;

    const verifyResponse = await request(app).get(
      `/password-reset/verify?token=${encodeURIComponent(token)}`
    );

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.data.valid).toBe(true);
    expect(verifyResponse.body.data.emailHint).toBe("u***@easybuy.com");
  });

  it("completes reset and allows login with new password", async () => {
    const requestResponse = await request(app)
      .post("/password-reset/request")
      .send({ email: "user@easybuy.com" });
    const token = requestResponse.body.data.devResetToken;

    const completeResponse = await request(app)
      .post("/password-reset/complete")
      .send({
        token,
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      });

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.message).toBe(
      "Password reset successfully. Please login with your new password."
    );

    const oldLogin = await request(app)
      .post("/login")
      .send({ email: "user@easybuy.com", password: "user123" });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/login")
      .send({ email: "user@easybuy.com", password: "newpass123" });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.success).toBe(true);
  });

  it("rejects reused tokens", async () => {
    const requestResponse = await request(app)
      .post("/password-reset/request")
      .send({ email: "user@easybuy.com" });
    const token = requestResponse.body.data.devResetToken;

    await request(app).post("/password-reset/complete").send({
      token,
      newPassword: "another123",
      confirmPassword: "another123",
    });

    const verifyResponse = await request(app).get(
      `/password-reset/verify?token=${encodeURIComponent(token)}`
    );

    expect(verifyResponse.status).toBe(410);
    expect(verifyResponse.body.code).toBe("RESET_TOKEN_USED");
  });

  it("invalidates older tokens when a new request is made", async () => {
    const first = await request(app)
      .post("/password-reset/request")
      .send({ email: "user@easybuy.com" });
    const firstToken = first.body.data.devResetToken;

    await request(app)
      .post("/password-reset/request")
      .send({ email: "user@easybuy.com" });

    const verifyResponse = await request(app).get(
      `/password-reset/verify?token=${encodeURIComponent(firstToken)}`
    );

    expect(verifyResponse.status).toBe(410);
    expect(verifyResponse.body.code).toBe("RESET_TOKEN_USED");
  });

  it("rejects expired tokens", async () => {
    jest.useFakeTimers();
    const requestResponse = await request(app)
      .post("/password-reset/request")
      .send({ email: "user@easybuy.com" });
    const token = requestResponse.body.data.devResetToken;

    jest.advanceTimersByTime(PASSWORD_RESET_TOKEN_TTL_MS + 1000);

    const verifyResponse = await request(app).get(
      `/password-reset/verify?token=${encodeURIComponent(token)}`
    );

    expect(verifyResponse.status).toBe(410);
    expect(verifyResponse.body.code).toBe("RESET_TOKEN_EXPIRED");
    jest.useRealTimers();
  });
});
