import { normalizeScannedValue } from "../utils/scanCodeParser";

describe("normalizeScannedValue", () => {
  it("returns empty string for empty input", () => {
    expect(normalizeScannedValue("", "qr")).toBe("");
    expect(normalizeScannedValue(null, "ean13")).toBe("");
    expect(normalizeScannedValue("   ", "code128")).toBe("");
  });

  it("returns trimmed raw SKU for linear barcodes", () => {
    expect(normalizeScannedValue("  GAR-001  ", "ean13")).toBe("GAR-001");
    expect(normalizeScannedValue("ELC-001", "upc_a")).toBe("ELC-001");
  });

  it("extracts sku from QR URL query parameter", () => {
    expect(
      normalizeScannedValue("https://shop.example.com/product?sku=GAR-001", "qr")
    ).toBe("GAR-001");
    expect(
      normalizeScannedValue("https://shop.example.com/product?code=ELC-001", "qr")
    ).toBe("ELC-001");
  });

  it("extracts last path segment from QR URL", () => {
    expect(
      normalizeScannedValue("https://shop.example.com/products/GAR-001", "qr")
    ).toBe("GAR-001");
  });

  it("returns raw value for non-URL QR payloads", () => {
    expect(normalizeScannedValue("GAR-001", "qr")).toBe("GAR-001");
  });
});
