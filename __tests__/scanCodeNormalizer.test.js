import { normalizeScannedCode } from "../utils/scanCodeNormalizer";

describe("normalizeScannedCode", () => {
  it("returns empty string for falsy input", () => {
    expect(normalizeScannedCode("")).toBe("");
    expect(normalizeScannedCode(null)).toBe("");
    expect(normalizeScannedCode(undefined)).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeScannedCode("   ")).toBe("");
  });

  it("trims whitespace", () => {
    expect(normalizeScannedCode("  GAR-001  ")).toBe("GAR-001");
  });

  it("uppercases non-URL codes for case-insensitive SKU match", () => {
    expect(normalizeScannedCode("gar-001")).toBe("GAR-001");
    expect(normalizeScannedCode("elc-001")).toBe("ELC-001");
  });

  it("extracts a code query param from a scanned URL", () => {
    expect(
      normalizeScannedCode("https://shop.example/p?code=elc-001")
    ).toBe("ELC-001");
  });

  it("extracts a sku query param when no code param is present", () => {
    expect(
      normalizeScannedCode("https://shop.example/p?ref=abc&sku=gar-002")
    ).toBe("GAR-002");
  });

  it("falls back to the last path segment when no query code is present", () => {
    expect(normalizeScannedCode("https://example.com/product/gar-001")).toBe(
      "GAR-001"
    );
    expect(normalizeScannedCode("http://shop.example/sku")).toBe("SKU");
  });

  it("uppercases the raw URL when nothing usable can be extracted", () => {
    expect(normalizeScannedCode("https://shop.example")).toBe(
      "HTTPS://SHOP.EXAMPLE"
    );
  });
});
