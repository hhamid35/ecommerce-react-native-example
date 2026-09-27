// The one place the app decides what a valid email and password look like.
// Signup, password recovery and Update password all call these so the rule
// and its wording never drift apart. Login deliberately does NOT apply the
// password rule: existing accounts may still have shorter passwords.
//
// Keep in sync with mock-server/passwordReset.js#validatePasswordPolicy.

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_RULE_TEXT =
  "Password must be at least 8 characters and include a letter and a number";

const EMAIL_PATTERN = /^[^@ ]+@[^@ ]+[.][^@ ]+$/;
const EMAIL_MAX_LENGTH = 254;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Return an error message, or null when the email is acceptable.
export function validateEmail(email) {
  const normalized = normalizeEmail(email);
  if (normalized === "") return "Please enter your email";
  if (normalized.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(normalized)) {
    return "Please enter a valid email address";
  }
  return null;
}

// Return an error message, or null when the password meets the shared rule.
export function validatePassword(password) {
  const value = String(password || "");
  if (value === "") return "Please enter a password";
  if (value.length > PASSWORD_MAX_LENGTH) {
    return "Password must be at most 128 characters";
  }
  if (
    value.length < PASSWORD_MIN_LENGTH ||
    !/[A-Za-z]/.test(value) ||
    !/[0-9]/.test(value)
  ) {
    return PASSWORD_RULE_TEXT;
  }
  return null;
}

export function validatePasswordConfirmation(password, confirmPassword) {
  return password !== confirmPassword ? "Passwords do not match" : null;
}
