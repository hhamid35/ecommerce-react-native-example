jest.mock("../api/client", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

import { post } from "../api/client";
import { requestPasswordReset, resetForgottenPassword } from "../api";

describe("recovery API operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("requestPasswordReset posts to /forgot-password", async () => {
    post.mockResolvedValue({ success: true, message: "sent" });
    await requestPasswordReset("user@easybuy.com");
    expect(post).toHaveBeenCalledWith("/forgot-password", {
      email: "user@easybuy.com",
    });
  });

  test("resetForgottenPassword posts to /reset-forgotten-password", async () => {
    post.mockResolvedValue({ success: true, message: "Password reset successfully" });
    const payload = {
      email: "user@easybuy.com",
      otp: "123456",
      newPassword: "newpass1",
    };
    await resetForgottenPassword(payload);
    expect(post).toHaveBeenCalledWith("/reset-forgotten-password", payload);
  });
});
