import {
  requestRecoveryCode,
  verifyRecoveryCode,
  resetPasswordWithToken,
} from "../services/passwordRecoveryApi";

jest.mock("../constants/Network", () => ({
  __esModule: true,
  default: { serverip: "http://test.local:3002" },
}));

describe("passwordRecoveryApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("requestRecoveryCode posts to /password-recovery/request with normalized email", async () => {
    global.fetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        message: "If an account exists for this email, recovery instructions have been sent.",
        data: { devOtp: "123456" },
      }),
    });

    const result = await requestRecoveryCode("  User@EasyBuy.com  ");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test.local:3002/password-recovery/request",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@easybuy.com" }),
      })
    );
    expect(result.ok).toBe(true);
    expect(result.data.devOtp).toBe("123456");
  });

  it("requestRecoveryCode returns network error on fetch failure", async () => {
    global.fetch.mockRejectedValue(new Error("offline"));

    const result = await requestRecoveryCode("user@easybuy.com");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(result.message).toBe("Network error");
  });

  it("verifyRecoveryCode uses fallback message when absent", async () => {
    global.fetch.mockResolvedValue({
      status: 400,
      json: async () => ({ success: false }),
    });

    const result = await verifyRecoveryCode("user@easybuy.com", "000000");

    expect(result.ok).toBe(false);
    expect(result.message).toBe("Invalid or expired code. Request a new one.");
  });

  it("resetPasswordWithToken posts reset payload", async () => {
    global.fetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, message: "Password reset successfully." }),
    });

    const result = await resetPasswordWithToken({
      email: "user@easybuy.com",
      resetToken: "token-abc",
      newPassword: "newpass1",
      confirmPassword: "newpass1",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://test.local:3002/password-recovery/reset",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "user@easybuy.com",
          resetToken: "token-abc",
          newPassword: "newpass1",
          confirmPassword: "newpass1",
        }),
      })
    );
    expect(result.ok).toBe(true);
    expect(result.message).toBe("Password reset successfully.");
  });

  it("resetPasswordWithToken uses session-expired fallback", async () => {
    global.fetch.mockResolvedValue({
      status: 400,
      json: async () => ({ success: false }),
    });

    const result = await resetPasswordWithToken({
      email: "user@easybuy.com",
      resetToken: "expired",
      newPassword: "newpass1",
      confirmPassword: "newpass1",
    });

    expect(result.message).toBe("Recovery session expired. Please start again.");
  });
});
