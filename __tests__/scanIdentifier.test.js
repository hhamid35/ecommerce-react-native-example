import {
  normalizeScanValue,
  extractApprovedSku,
  isSupportedScanType,
} from "../utils/scanIdentifier";

describe("scanIdentifier utilities", () => {
  describe("normalizeScanValue", () => {
    it("trims whitespace and uppercases values", () => {
      expect(normalizeScanValue("  gar-001  ")).toBe("GAR-001");
    });

    it("returns empty string for nullish values", () => {
      expect(normalizeScanValue(null)).toBe("");
      expect(normalizeScanValue(undefined)).toBe("");
    });
  });

  describe("extractApprovedSku", () => {
    it("accepts raw SKU values", () => {
      expect(extractApprovedSku("GAR-001")).toBe("GAR-001");
      expect(extractApprovedSku("gar-001")).toBe("GAR-001");
    });

    it("accepts sku: prefix payloads", () => {
      expect(extractApprovedSku("sku:GAR-001")).toBe("GAR-001");
    });

    it("accepts easybuy:sku: prefix payloads", () => {
      expect(extractApprovedSku("easybuy:sku:GAR-001")).toBe("GAR-001");
    });

    it("rejects arbitrary URLs and empty values", () => {
      expect(extractApprovedSku("https://example.com/product/1")).toBeNull();
      expect(extractApprovedSku("")).toBeNull();
      expect(extractApprovedSku("   ")).toBeNull();
    });
  });

  describe("isSupportedScanType", () => {
    it("accepts supported camera formats", () => {
      expect(isSupportedScanType("qr")).toBe(true);
      expect(isSupportedScanType("ean13")).toBe(true);
      expect(isSupportedScanType("upc_a")).toBe(true);
      expect(isSupportedScanType("code-128")).toBe(true);
    });

    it("rejects unsupported formats", () => {
      expect(isSupportedScanType("pdf417")).toBe(false);
      expect(isSupportedScanType("")).toBe(false);
    });
  });
});
