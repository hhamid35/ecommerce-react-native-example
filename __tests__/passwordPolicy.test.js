import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_RULE_TEXT,
  normalizeEmail,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "../utils/passwordPolicy";

describe("passwordPolicy", () => {
  it("exposes the shared limits and rule text", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(PASSWORD_MAX_LENGTH).toBe(128);
    expect(PASSWORD_RULE_TEXT).toBe(
      "Password must be at least 8 characters and include a letter and a number"
    );
  });

  describe("normalizeEmail", () => {
    it("trims and lowercases", () => {
      expect(normalizeEmail("  User@EasyBuy.COM ")).toBe("user@easybuy.com");
    });

    it("handles empty input", () => {
      expect(normalizeEmail(undefined)).toBe("");
      expect(normalizeEmail(null)).toBe("");
    });
  });

  describe("validateEmail", () => {
    it("rejects an empty email", () => {
      expect(validateEmail("")).toBe("Please enter your email");
      expect(validateEmail("   ")).toBe("Please enter your email");
    });

    it.each(["user", "user@", "user@easybuy", "us er@easybuy.com", "a@@b.com"])(
      "rejects malformed email %p",
      (email) => {
        expect(validateEmail(email)).toBe("Please enter a valid email address");
      }
    );

    it("rejects an email longer than 254 characters", () => {
      const email = `${"a".repeat(250)}@b.com`;
      expect(validateEmail(email)).toBe("Please enter a valid email address");
    });

    it("accepts a valid email with mixed case and spaces", () => {
      expect(validateEmail("  User@EasyBuy.com  ")).toBeNull();
    });
  });

  describe("validatePassword", () => {
    it("rejects an empty password", () => {
      expect(validatePassword("")).toBe("Please enter a password");
    });

    it.each(["abcdef1", "abcdefgh", "12345678"])(
      "rejects %p with the rule text",
      (password) => {
        expect(validatePassword(password)).toBe(PASSWORD_RULE_TEXT);
      }
    );

    it("rejects a password longer than 128 characters", () => {
      expect(validatePassword(`a1${"b".repeat(127)}`)).toBe(
        "Password must be at most 128 characters"
      );
    });

    it("accepts a password that meets the rule", () => {
      expect(validatePassword("abcdefg1")).toBeNull();
      expect(validatePassword(`a1${"b".repeat(126)}`)).toBeNull();
    });
  });

  describe("validatePasswordConfirmation", () => {
    it("accepts matching passwords", () => {
      expect(validatePasswordConfirmation("abcdefg1", "abcdefg1")).toBeNull();
    });

    it("rejects mismatched passwords", () => {
      expect(validatePasswordConfirmation("abcdefg1", "abcdefg2")).toBe(
        "Passwords do not match"
      );
    });
  });
});
