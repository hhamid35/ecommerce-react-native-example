import {
  validateRecoveryEmail,
  validateResetForm,
} from "../utils/passwordRecoveryValidation";

describe("password recovery validation", () => {
  it("validateRecoveryEmail rejects empty and invalid emails", () => {
    expect(validateRecoveryEmail("")).toBe("Please enter your email");
    expect(validateRecoveryEmail("bad")).toBe("Email is not valid");
    expect(validateRecoveryEmail("a@b")).toBe("Email is too short");
    expect(validateRecoveryEmail("user@example.com")).toBeNull();
  });

  it("validateResetForm enforces otp and password rules", () => {
    expect(
      validateResetForm({
        email: "user@example.com",
        otp: "12",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      })
    ).toBe("Please enter the 6-digit code from your email");

    expect(
      validateResetForm({
        email: "user@example.com",
        otp: "123456",
        newPassword: "short1",
        confirmPassword: "short1",
      })
    ).toBe("Use at least 8 characters with a letter and a number.");

    expect(
      validateResetForm({
        email: "user@example.com",
        otp: "123456",
        newPassword: "newpass123",
        confirmPassword: "different1",
      })
    ).toBe("Passwords do not match");

    expect(
      validateResetForm({
        email: "user@example.com",
        otp: "123456",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      })
    ).toBeNull();
  });
});
