import { validateEmail, validatePasswordPair } from "../utils/passwordValidation";

describe("validateEmail", () => {
  it("accepts a valid email", () => {
    expect(validateEmail("user@easybuy.com")).toEqual({ valid: true });
  });

  it("rejects empty email", () => {
    expect(validateEmail("")).toEqual({ valid: false, error: "Please enter your email" });
  });

  it("rejects email without @", () => {
    expect(validateEmail("notanemail")).toEqual({ valid: false, error: "Email is not valid" });
  });

  it("rejects email shorter than 6 characters", () => {
    expect(validateEmail("a@b.c")).toEqual({ valid: false, error: "Email is too short" });
  });
});

describe("validatePasswordPair", () => {
  it("accepts matching passwords of at least 6 characters", () => {
    expect(validatePasswordPair("secret1", "secret1")).toEqual({ valid: true });
  });

  it("rejects password shorter than 6 characters", () => {
    expect(validatePasswordPair("short", "short")).toEqual({
      valid: false,
      error: "Password must be at least 6 characters",
    });
  });

  it("rejects mismatched passwords", () => {
    expect(validatePasswordPair("secret1", "secret2")).toEqual({
      valid: false,
      error: "Passwords do not match",
    });
  });
});
