import {
  normalizeScanValue,
  normalizeExternalIds,
  findProductByScanCode,
  validateUniqueIdentifiers,
} from "../mock-server/productLookup";

const sampleProducts = [
  {
    _id: "prod001",
    title: "Classic White T-Shirt",
    sku: "GAR-001",
    externalIds: ["EB-GAR-001"],
  },
  {
    _id: "prod002",
    title: "Blue Denim Jeans",
    sku: "GAR-002",
    externalIds: [],
  },
  {
    _id: "prod003",
    title: "Wireless Bluetooth Headphones",
    sku: "ELC-001",
    externalIds: ["EB-ELC-001"],
  },
];

describe("productLookup helpers", () => {
  it("normalizes blank scan values to empty string", () => {
    expect(normalizeScanValue(null)).toBe("");
    expect(normalizeScanValue("  gar-001  ")).toBe("GAR-001");
  });

  it("parses comma-separated external IDs and de-duplicates case-insensitively", () => {
    expect(normalizeExternalIds(" EB-1 , eb-1 ,  ")).toEqual(["EB-1"]);
    expect(normalizeExternalIds(["A-1", "a-1", "B-2"])).toEqual(["A-1", "B-2"]);
  });

  it("matches products by SKU case-insensitively", () => {
    const result = findProductByScanCode(sampleProducts, "gar-001");
    expect(result.status).toBe("matched");
    expect(result.product._id).toBe("prod001");
    expect(result.match.field).toBe("sku");
  });

  it("matches products by external ID", () => {
    const result = findProductByScanCode(sampleProducts, "eb-elc-001");
    expect(result.status).toBe("matched");
    expect(result.product._id).toBe("prod003");
    expect(result.match.field).toBe("externalIds");
  });

  it("returns not_found for unknown codes", () => {
    const result = findProductByScanCode(sampleProducts, "UNKNOWN");
    expect(result.status).toBe("not_found");
  });

  it("returns invalid for blank codes", () => {
    const result = findProductByScanCode(sampleProducts, "   ");
    expect(result.status).toBe("invalid");
  });

  it("returns duplicate when multiple products share an identifier", () => {
    const products = [
      { _id: "p1", sku: "DUP-1", externalIds: [] },
      { _id: "p2", sku: "OTHER", externalIds: ["DUP-1"] },
    ];
    const result = findProductByScanCode(products, "dup-1");
    expect(result.status).toBe("duplicate");
  });

  it("rejects duplicate identifiers during validation", () => {
    const result = validateUniqueIdentifiers(sampleProducts, {
      sku: "GAR-001",
      externalIds: [],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Product identifiers must be unique");
  });

  it("allows updating the same product identifiers", () => {
    const result = validateUniqueIdentifiers(
      sampleProducts,
      { sku: "GAR-001", externalIds: ["EB-GAR-001"] },
      "prod001"
    );
    expect(result.valid).toBe(true);
  });
});
