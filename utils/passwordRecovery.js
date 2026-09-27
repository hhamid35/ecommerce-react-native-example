import { PASSWORD_RULE_TEXT } from "./passwordPolicy";

// Recovery constants and the single mapping from backend `err` codes to the
// wording users see, so every recovery screen says the same thing.

export const RESET_CODE_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 60;
// Used only in on-screen copy; the server owns the real expiry.
export const CODE_EXPIRY_MINUTES = 15;

export const RECOVERY_MESSAGES = Object.freeze({
  requestSent:
    "If an account exists for this email, we have sent a 6-digit code. It expires in 15 minutes.",
  throttled:
    "A code was sent recently. Check your inbox and spam folder, or wait a minute before requesting another.",
  codeFormat: "Enter the 6-digit code from your email",
  codeInvalid: "That code is incorrect. Check the code and try again.",
  codeExpired:
    "This code has expired or has already been used. Request a new code.",
  attemptsExceeded: "Too many incorrect attempts. Request a new code.",
  tokenInvalid:
    "Your reset session has expired. Request a new code to continue.",
  success: "Your password has been reset. Log in with your new password.",
  network: "We could not reach the server. Check your connection and try again.",
  server: "Something went wrong on our side. Please try again.",
});

const RESTART_CODES = [
  "RESET_CODE_EXPIRED",
  "RESET_ATTEMPTS_EXCEEDED",
  "RESET_TOKEN_INVALID",
];

// Return an error message, or null when the code is exactly 6 digits.
export function validateResetCode(code) {
  return /^[0-9]{6}$/.test(String(code || "").trim())
    ? null
    : RECOVERY_MESSAGES.codeFormat;
}

export function messageForRecoveryError(result) {
  switch (result?.err) {
    case "RESET_THROTTLED":
      return RECOVERY_MESSAGES.throttled;
    case "RESET_CODE_INVALID":
      return RECOVERY_MESSAGES.codeInvalid;
    case "RESET_CODE_EXPIRED":
      return RECOVERY_MESSAGES.codeExpired;
    case "RESET_ATTEMPTS_EXCEEDED":
      return RECOVERY_MESSAGES.attemptsExceeded;
    case "RESET_TOKEN_INVALID":
      return RECOVERY_MESSAGES.tokenInvalid;
    case "PASSWORD_POLICY":
      return result.message || PASSWORD_RULE_TEXT;
    case "INVALID_EMAIL":
      return "Please enter a valid email address";
    default:
      return result?.message || RECOVERY_MESSAGES.server;
  }
}

// True when the current code or reset token can no longer be used and the
// user has to start over with a new code.
export function isRestartRequired(err) {
  return RESTART_CODES.includes(err);
}
