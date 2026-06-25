const {
  normalizeLookupCode,
  resolveProductByCode,
} = require("../mock-server/productLookup");

const sampleProducts = [
  { _id: "prod001", sku: "GAR-001", externalId: "" },
  { _id: "prod003", sku: "ELC-001", externalId: "885909950805" },
  { _id: "prod002", sku: "GAR-001", externalId: "" },
];

describe("normalizeLookupCode", () => {
  it("trims whitespace", () => {
    expect(normalizeLookupCode("  GAR-001  ")).toBe("GAR-001");
  });

  it("returns empty for invalid input", () => {
    expect(normalizeLookupCode("")).toBe("");
    expect(normalizeLookupCode(null)).toBe("");
  });
});

describe("resolveProductByCode", () => {
  it("matches by sku first", () => {
    const match = resolveProductByCode("GAR-001", sampleProducts);
    expect(match.product._id).toBe("prod001");
    expect(match.matchedBy).toBe("sku");
  });

  it("matches by externalId when sku does not match", () => {
    const match = resolveProductByCode("885909950805", sampleProducts);
    expect(match.product._id).toBe("prod003");
    expect(match.matchedBy).toBe("externalId");
  });

  it("returns null when no match", () => {
    expect(resolveProductByCode("UNKNOWN-999", sampleProducts)).toBeNull();
  });

  it("returns null for empty code", () => {
    expect(resolveProductByCode("   ", sampleProducts)).toBeNull();
  });
});
