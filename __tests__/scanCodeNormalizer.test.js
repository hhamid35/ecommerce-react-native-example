import { normalizeScannedCode } from "../utils/scanCodeNormalizer";

describe("normalizeScannedCode", () => {
  it("returns empty string for falsy input", () => {
    expect(normalizeScannedCode("")).toBe("");
    expect(normalizeScannedCode(null)).toBe("");
    expect(normalizeScannedCode(undefined)).toBe("");
  });

  it("trims whitespace", () => {
    expect(normalizeScannedCode("  GAR-001  ")).toBe("GAR-001");
  });

  it("uppercases non-URL codes for case-insensitive SKU match", () => {
    expect(normalizeScannedCode("gar-001")).toBe("GAR-001");
    expect(normalizeScannedCode("elc-001")).toBe("ELC-001");
  });

  it("passes through HTTP URLs unchanged", () => {
    expect(normalizeScannedCode("https://example.com/product/1")).toBe(
      "https://example.com/product/1"
    );
    expect(normalizeScannedCode("http://shop.example/sku")).toBe(
      "http://shop.example/sku"
    );
  });
});
