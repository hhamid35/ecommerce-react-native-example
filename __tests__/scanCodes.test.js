import {
  normalizeScanCode,
  getProductScanIdentifiers,
  findProductsByScanCode,
  toScanResolution,
} from "../utils/scanCodes";

const sampleProducts = [
  {
    _id: "prod001",
    title: "Classic White T-Shirt",
    sku: "GAR-001",
    externalId: "0123456789012",
    price: 19.99,
    quantity: 50,
  },
  {
    _id: "prod002",
    title: "Blue Denim Jeans",
    sku: "GAR-002",
    externalId: "EASYBUY-GAR-001",
    price: 49.99,
    quantity: 30,
  },
  {
    _id: "prod003",
    title: "Wireless Headphones",
    sku: "ELC-001",
    price: 89.99,
    quantity: 20,
  },
];

describe("scanCodes", () => {
  describe("normalizeScanCode", () => {
    it("trims surrounding whitespace", () => {
      expect(normalizeScanCode("  GAR-001  ")).toBe("GAR-001");
    });

    it("returns empty string for nullish values", () => {
      expect(normalizeScanCode(null)).toBe("");
      expect(normalizeScanCode(undefined)).toBe("");
    });
  });

  describe("getProductScanIdentifiers", () => {
    it("returns sku and externalId when both are present", () => {
      expect(getProductScanIdentifiers(sampleProducts[0])).toEqual([
        { field: "sku", value: "GAR-001" },
        { field: "externalId", value: "0123456789012" },
      ]);
    });

    it("returns only sku when externalId is missing", () => {
      expect(getProductScanIdentifiers(sampleProducts[2])).toEqual([
        { field: "sku", value: "ELC-001" },
      ]);
    });
  });

  describe("findProductsByScanCode", () => {
    it("matches sku case-insensitively", () => {
      const { matches } = findProductsByScanCode(sampleProducts, "gar-001");
      expect(matches).toHaveLength(1);
      expect(matches[0].field).toBe("sku");
      expect(matches[0].product._id).toBe("prod001");
    });

    it("matches externalId", () => {
      const { matches } = findProductsByScanCode(
        sampleProducts,
        "EASYBUY-GAR-001"
      );
      expect(matches).toHaveLength(1);
      expect(matches[0].field).toBe("externalId");
      expect(matches[0].product._id).toBe("prod002");
    });

    it("returns no matches for unknown codes", () => {
      const { matches } = findProductsByScanCode(sampleProducts, "UNKNOWN");
      expect(matches).toHaveLength(0);
    });
  });

  describe("toScanResolution", () => {
    it("returns SCAN_CODE_REQUIRED for empty input", () => {
      expect(toScanResolution(sampleProducts, "   ")).toEqual({
        success: false,
        code: "SCAN_CODE_REQUIRED",
        message: "A valid product code is required",
      });
    });

    it("returns PRODUCT_SCAN_NOT_FOUND when no product matches", () => {
      const result = toScanResolution(sampleProducts, "NO-MATCH");
      expect(result.success).toBe(false);
      expect(result.code).toBe("PRODUCT_SCAN_NOT_FOUND");
      expect(result.message).toBe("No product found for this code");
      expect(result.scannedCode).toBe("NO-MATCH");
    });

    it("returns PRODUCT_SCAN_AMBIGUOUS for duplicate matches", () => {
      const duplicates = [
        { _id: "a", sku: "DUP-001", externalId: "SHARED" },
        { _id: "b", sku: "SHARED", externalId: "other" },
      ];
      const result = toScanResolution(duplicates, "SHARED");
      expect(result.success).toBe(false);
      expect(result.code).toBe("PRODUCT_SCAN_AMBIGUOUS");
      expect(result.message).toBe("Multiple products match this code");
    });

    it("returns success with product and match metadata for a single match", () => {
      const result = toScanResolution(sampleProducts, "GAR-001");
      expect(result.success).toBe(true);
      expect(result.data._id).toBe("prod001");
      expect(result.match).toEqual({ field: "sku", value: "GAR-001" });
      expect(result.scannedCode).toBe("GAR-001");
    });
  });
});
