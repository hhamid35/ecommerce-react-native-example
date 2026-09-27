jest.mock("../utils/session", () => ({
  getToken: jest.fn().mockResolvedValue(null),
  clearSession: jest.fn(),
}));
jest.mock("../routes/navigationRef", () => ({ resetToLogin: jest.fn() }));

import * as api from "../api";
import { resetToLogin } from "../routes/navigationRef";

const ORIGINAL_API_URL = process.env.EXPO_PUBLIC_API_URL;
const ORIGINAL_FLAG = process.env.EXPO_PUBLIC_PASSWORD_RECOVERY;

// Expo's babel preset reads EXPO_PUBLIC_* from the live process.env object,
// so mutate it in place and restore afterwards.
const restoreEnv = (key, value) => {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
};

describe("password recovery api operations", () => {
  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, message: "ok" }),
    });
  });

  afterEach(() => {
    restoreEnv("EXPO_PUBLIC_API_URL", ORIGINAL_API_URL);
    restoreEnv("EXPO_PUBLIC_PASSWORD_RECOVERY", ORIGINAL_FLAG);
    delete global.fetch;
  });

  const lastRequest = () => {
    const [url, init] = global.fetch.mock.calls[0];
    return { url, method: init.method, body: JSON.parse(init.body) };
  };

  it("requestPasswordReset posts the email to /forgot-password", async () => {
    await expect(api.requestPasswordReset("user@easybuy.com")).resolves.toEqual({
      success: true,
      message: "ok",
    });
    expect(lastRequest()).toEqual({
      url: "http://localhost:3002/forgot-password",
      method: "POST",
      body: { email: "user@easybuy.com" },
    });
  });

  it("verifyResetCode posts email and code to /verify-reset-code", async () => {
    await api.verifyResetCode("user@easybuy.com", "012345");
    expect(lastRequest()).toEqual({
      url: "http://localhost:3002/verify-reset-code",
      method: "POST",
      body: { email: "user@easybuy.com", code: "012345" },
    });
  });

  it("setNewPassword posts token and password to /set-new-password", async () => {
    await api.setNewPassword("a".repeat(64), "abcdefg1");
    expect(lastRequest()).toEqual({
      url: "http://localhost:3002/set-new-password",
      method: "POST",
      body: { resetToken: "a".repeat(64), newPassword: "abcdefg1" },
    });
  });

  it("returns recovery errors without triggering the expiry redirect", async () => {
    global.fetch.mockResolvedValue({
      json: () =>
        Promise.resolve({ success: false, err: "RESET_TOKEN_INVALID", message: "x" }),
    });
    const result = await api.setNewPassword("t", "abcdefg1");
    expect(result.err).toBe("RESET_TOKEN_INVALID");
    expect(resetToLogin).not.toHaveBeenCalled();
  });

  it("rejects on network failure", async () => {
    global.fetch.mockRejectedValue(new TypeError("Network request failed"));
    await expect(api.requestPasswordReset("user@easybuy.com")).rejects.toThrow(
      "Network request failed"
    );
  });

  describe("isPasswordRecoveryEnabled", () => {
    it("is on when the flag is unset", () => {
      delete process.env.EXPO_PUBLIC_PASSWORD_RECOVERY;
      expect(api.isPasswordRecoveryEnabled()).toBe(true);
    });

    it("is on when the flag is 'true'", () => {
      process.env.EXPO_PUBLIC_PASSWORD_RECOVERY = "true";
      expect(api.isPasswordRecoveryEnabled()).toBe(true);
    });

    it("is off only when the flag is 'false'", () => {
      process.env.EXPO_PUBLIC_PASSWORD_RECOVERY = "false";
      expect(api.isPasswordRecoveryEnabled()).toBe(false);
    });
  });
});
