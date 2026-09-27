import {
  RESET_CODE_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  CODE_EXPIRY_MINUTES,
  RECOVERY_MESSAGES,
  validateResetCode,
  messageForRecoveryError,
  isRestartRequired,
} from "../utils/passwordRecovery";
import { PASSWORD_RULE_TEXT } from "../utils/passwordPolicy";

describe("passwordRecovery", () => {
  it("exposes the recovery constants", () => {
    expect(RESET_CODE_LENGTH).toBe(6);
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
    expect(CODE_EXPIRY_MINUTES).toBe(15);
    expect(Object.isFrozen(RECOVERY_MESSAGES)).toBe(true);
  });

  describe("validateResetCode", () => {
    it("accepts exactly six digits", () => {
      expect(validateResetCode("012345")).toBeNull();
      expect(validateResetCode(" 012345 ")).toBeNull();
    });

    it.each(["", "12345", "1234567", "12a456"])("rejects %p", (code) => {
      expect(validateResetCode(code)).toBe(RECOVERY_MESSAGES.codeFormat);
    });
  });

  describe("messageForRecoveryError", () => {
    it.each([
      ["RESET_THROTTLED", RECOVERY_MESSAGES.throttled],
      ["RESET_CODE_INVALID", RECOVERY_MESSAGES.codeInvalid],
      ["RESET_CODE_EXPIRED", RECOVERY_MESSAGES.codeExpired],
      ["RESET_ATTEMPTS_EXCEEDED", RECOVERY_MESSAGES.attemptsExceeded],
      ["RESET_TOKEN_INVALID", RECOVERY_MESSAGES.tokenInvalid],
      ["INVALID_EMAIL", "Please enter a valid email address"],
    ])("maps %s to its message", (err, message) => {
      expect(messageForRecoveryError({ success: false, err, message: "x" })).toBe(
        message
      );
    });

    it("uses the server message for PASSWORD_POLICY, falling back to the rule", () => {
      expect(
        messageForRecoveryError({ err: "PASSWORD_POLICY", message: "Too weak" })
      ).toBe("Too weak");
      expect(messageForRecoveryError({ err: "PASSWORD_POLICY" })).toBe(
        PASSWORD_RULE_TEXT
      );
    });

    it("falls back to result.message and then the generic server message", () => {
      expect(messageForRecoveryError({ err: "OTHER", message: "Nope" })).toBe(
        "Nope"
      );
      expect(messageForRecoveryError({})).toBe(RECOVERY_MESSAGES.server);
      expect(messageForRecoveryError(undefined)).toBe(RECOVERY_MESSAGES.server);
    });
  });

  describe("isRestartRequired", () => {
    it.each(["RESET_CODE_EXPIRED", "RESET_ATTEMPTS_EXCEEDED", "RESET_TOKEN_INVALID"])(
      "is true for %s",
      (err) => {
        expect(isRestartRequired(err)).toBe(true);
      }
    );

    it.each(["RESET_CODE_INVALID", "RESET_THROTTLED", "PASSWORD_POLICY", undefined])(
      "is false for %p",
      (err) => {
        expect(isRestartRequired(err)).toBe(false);
      }
    );
  });
});
