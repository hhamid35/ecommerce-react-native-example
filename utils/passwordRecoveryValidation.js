export function validateRecoveryEmail(email) {
  if (!email) {
    return "Please enter your email";
  }
  if (!email.includes("@")) {
    return "Email is not valid";
  }
  if (email.length < 6) {
    return "Email is too short";
  }
  return null;
}

export function validateResetForm({ email, otp, newPassword, confirmPassword }) {
  const emailError = validateRecoveryEmail(email);
  if (emailError) {
    return emailError;
  }
  if (!/^\d{6}$/.test(otp || "")) {
    return "Please enter the 6-digit code from your email";
  }
  if (
    newPassword.length < 8 ||
    !/[a-zA-Z]/.test(newPassword) ||
    !/\d/.test(newPassword)
  ) {
    return "Use at least 8 characters with a letter and a number.";
  }
  if (newPassword !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
}
