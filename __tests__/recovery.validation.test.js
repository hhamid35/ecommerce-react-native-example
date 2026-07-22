function validateEmail(value) {
  if (!value || value.trim() === "") {
    return "Please enter your email";
  }
  if (!value.includes("@")) {
    return "Email is not valid";
  }
  if (value.length < 6) {
    return "Email is too short";
  }
  return null;
}

function validateResetForm({ otp, newPassword, confirmPassword }) {
  if (!otp || !/^\d{6}$/.test(otp)) {
    return "Please enter the 6-digit code from your email";
  }
  if (!newPassword || newPassword.length < 6) {
    return "Password must be 6 characters long";
  }
  if (newPassword !== confirmPassword) {
    return "Password does not match";
  }
  return null;
}

describe("recovery screen validation", () => {
  test("validateEmail rejects invalid input", () => {
    expect(validateEmail("")).toBe("Please enter your email");
    expect(validateEmail("bad")).toBe("Email is not valid");
    expect(validateEmail("user@example.com")).toBeNull();
  });

  test("validateResetForm enforces OTP and password rules", () => {
    expect(
      validateResetForm({ otp: "12", newPassword: "secret1", confirmPassword: "secret1" })
    ).toBe("Please enter the 6-digit code from your email");
    expect(
      validateResetForm({ otp: "123456", newPassword: "123", confirmPassword: "123" })
    ).toBe("Password must be 6 characters long");
    expect(
      validateResetForm({ otp: "123456", newPassword: "secret1", confirmPassword: "secret2" })
    ).toBe("Password does not match");
    expect(
      validateResetForm({ otp: "123456", newPassword: "secret1", confirmPassword: "secret1" })
    ).toBeNull();
  });
});
