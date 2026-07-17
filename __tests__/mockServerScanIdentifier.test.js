const {
  normalizeScanValue,
  extractApprovedSku,
  findProductsBySku,
  hasDuplicateSku,
} = require("../mock-server/scanIdentifier");

const seededProducts = [
  { _id: "prod001", sku: "GAR-001", title: "Classic White T-Shirt" },
  { _id: "prod002", sku: "GAR-002", title: "Blue Denim Jeans" },
];

describe("mock-server scanIdentifier helpers", () => {
  it("finds exactly one product by normalized SKU", () => {
    const matches = findProductsBySku(seededProducts, "gar-001");
    expect(matches).toHaveLength(1);
    expect(matches[0]._id).toBe("prod001");
  });

  it("returns no matches for unknown SKU values", () => {
    expect(findProductsBySku(seededProducts, "UNKNOWN-999")).toHaveLength(0);
  });

  it("detects duplicate SKU values case-insensitively", () => {
    expect(hasDuplicateSku(seededProducts, "gar-001")).toBe(true);
    expect(hasDuplicateSku(seededProducts, "gar-001", "prod001")).toBe(false);
  });

  it("extracts approved SKU payloads consistently", () => {
    expect(extractApprovedSku("easybuy:sku:GAR-001")).toBe("GAR-001");
    expect(extractApprovedSku("https://shop.example.com")).toBeNull();
    expect(normalizeScanValue(" elc-001 ")).toBe("ELC-001");
  });

  it("flags ambiguous duplicate SKU fixtures", () => {
    const duplicateFixture = [
      { _id: "a", sku: "DUP-001" },
      { _id: "b", sku: "dup-001" },
    ];
    expect(findProductsBySku(duplicateFixture, "DUP-001")).toHaveLength(2);
  });
});
