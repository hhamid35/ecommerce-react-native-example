import { normalizeScannedCode } from "../utils/scanCodeNormalizer";

describe("normalizeScannedCode", () => {
  it("trims whitespace from valid codes", () => {
    expect(normalizeScannedCode("  GAR-001  ")).toEqual({
      code: "GAR-001",
      rejected: false,
    });
  });

  it("passes URL payloads through as lookup codes", () => {
    expect(normalizeScannedCode("https://example.com/sku/GAR-001")).toEqual({
      code: "https://example.com/sku/GAR-001",
      rejected: false,
    });
  });

  it("rejects empty input", () => {
    expect(normalizeScannedCode("")).toEqual({
      rejected: true,
      reason: "empty",
    });
    expect(normalizeScannedCode(null)).toEqual({
      rejected: true,
      reason: "empty",
    });
    expect(normalizeScannedCode("   ")).toEqual({
      rejected: true,
      reason: "empty",
    });
  });

  it("rejects codes longer than 128 characters", () => {
    const longCode = "A".repeat(129);
    expect(normalizeScannedCode(longCode)).toEqual({
      rejected: true,
      reason: "too_long",
    });
  });

  it("accepts codes at exactly 128 characters", () => {
    const code = "A".repeat(128);
    expect(normalizeScannedCode(code)).toEqual({
      code,
      rejected: false,
    });
  });
});
