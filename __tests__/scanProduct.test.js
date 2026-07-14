import {
  normalizeScannedCode,
  buildScanLookupUrl,
} from "../utils/scanProduct";

describe("normalizeScannedCode", () => {
  it("returns unsupported for empty strings", () => {
    expect(normalizeScannedCode("")).toEqual({
      rawValue: "",
      lookupCode: "",
      isSupported: false,
      reason: "empty",
    });
  });

  it("returns plain SKU as lookup code", () => {
    expect(normalizeScannedCode("  GAR-001  ")).toEqual({
      rawValue: "GAR-001",
      lookupCode: "GAR-001",
      isSupported: true,
    });
  });

  it("returns plain barcode as lookup code", () => {
    expect(normalizeScannedCode("012345678905")).toEqual({
      rawValue: "012345678905",
      lookupCode: "012345678905",
      isSupported: true,
    });
  });

  it("extracts sku from URL query", () => {
    expect(
      normalizeScannedCode("https://easybuy.example/product?sku=GAR-001")
    ).toEqual({
      rawValue: "https://easybuy.example/product?sku=GAR-001",
      lookupCode: "GAR-001",
      isSupported: true,
    });
  });

  it("extracts externalId from URL query", () => {
    expect(
      normalizeScannedCode("https://easybuy.example/product?externalId=012345678905")
    ).toEqual({
      rawValue: "https://easybuy.example/product?externalId=012345678905",
      lookupCode: "012345678905",
      isSupported: true,
    });
  });

  it("extracts code from URL query", () => {
    expect(
      normalizeScannedCode("https://easybuy.example/product?code=GRO-002")
    ).toEqual({
      rawValue: "https://easybuy.example/product?code=GRO-002",
      lookupCode: "GRO-002",
      isSupported: true,
    });
  });

  it("returns unsupported for URL without product query keys", () => {
    expect(
      normalizeScannedCode("https://easybuy.example/about")
    ).toEqual({
      rawValue: "https://easybuy.example/about",
      lookupCode: "",
      isSupported: false,
      reason: "unsupported_url",
    });
  });

  it("returns unsupported for over-length values", () => {
    const longCode = "a".repeat(257);
    expect(normalizeScannedCode(longCode)).toEqual({
      rawValue: longCode,
      lookupCode: "",
      isSupported: false,
      reason: "too_long",
    });
  });
});

describe("buildScanLookupUrl", () => {
  it("builds encoded scan lookup URL", () => {
    expect(buildScanLookupUrl("http://localhost:3002", "GAR-001")).toBe(
      "http://localhost:3002/products/scan-lookup?code=GAR-001"
    );
  });

  it("encodes special characters", () => {
    expect(buildScanLookupUrl("http://localhost:3002", "A&B")).toBe(
      "http://localhost:3002/products/scan-lookup?code=A%26B"
    );
  });
});
