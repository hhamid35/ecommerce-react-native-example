export function validateEmail(email) {
  if (!email || typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "Please enter your email" };
  }
  if (!email.includes("@")) {
    return { valid: false, error: "Email is not valid" };
  }
  if (email.length < 6) {
    return { valid: false, error: "Email is too short" };
  }
  return { valid: true };
}

export function validatePasswordPair(password, confirmPassword) {
  if (!password || password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" };
  }
  return { valid: true };
}
