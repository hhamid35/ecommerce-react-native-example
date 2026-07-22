import * as api from "../api";
import { post } from "../api/client";

jest.mock("../api/client", () => ({
  post: jest.fn(),
  get: jest.fn(),
  getBaseUrl: jest.fn(),
  imageUrl: jest.fn(),
}));

describe("password recovery API helpers", () => {
  beforeEach(() => {
    post.mockClear();
  });

  it("requestPasswordReset posts to /forgot-password", async () => {
    post.mockResolvedValue({ success: true, message: "sent" });
    await api.requestPasswordReset("user@example.com");
    expect(post).toHaveBeenCalledWith("/forgot-password", {
      email: "user@example.com",
    });
  });

  it("completePasswordReset posts to /complete-password-reset", async () => {
    post.mockResolvedValue({ success: true, message: "done", returnTo: "login" });
    const payload = {
      email: "user@example.com",
      otp: "123456",
      newPassword: "newpass123",
    };
    await api.completePasswordReset(payload);
    expect(post).toHaveBeenCalledWith("/password-reset", payload);
  });
});
