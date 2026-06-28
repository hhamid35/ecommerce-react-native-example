const {
  normalizeLookupCode,
  normalizeExternalIds,
  findProductMatches,
} = require("../mock-server/lookupMatcher");

const products = [
  { _id: "prod001", sku: "GAR-001", externalIds: [] },
  { _id: "prod002", sku: "GAR-002", externalIds: [] },
  { _id: "prod003", sku: "ELC-001", externalIds: ["0123456789012"] },
  { _id: "dupA", sku: "DUP-001", externalIds: [] },
  { _id: "dupB", sku: "DUP-001", externalIds: [] },
];

describe("normalizeLookupCode", () => {
  it("trims and uppercases", () => {
    expect(normalizeLookupCode("  gar-001 ")).toBe("GAR-001");
  });

  it("handles null/undefined", () => {
    expect(normalizeLookupCode(null)).toBe("");
    expect(normalizeLookupCode(undefined)).toBe("");
  });
});

describe("normalizeExternalIds", () => {
  it("coerces a comma-separated string into a normalized array", () => {
    expect(normalizeExternalIds("0123456789012, abc-1 , ")).toEqual([
      "0123456789012",
      "ABC-1",
    ]);
  });

  it("normalizes an array and drops blanks", () => {
    expect(normalizeExternalIds([" a ", "", "b"])).toEqual(["A", "B"]);
  });

  it("returns an empty array for undefined input", () => {
    expect(normalizeExternalIds(undefined)).toEqual([]);
  });
});

describe("findProductMatches", () => {
  it("matches by SKU (case- and whitespace-insensitive)", () => {
    const matches = findProductMatches(products, "  gar-001 ");
    expect(matches.map((p) => p._id)).toEqual(["prod001"]);
  });

  it("matches by an external ID", () => {
    const matches = findProductMatches(products, "0123456789012");
    expect(matches.map((p) => p._id)).toEqual(["prod003"]);
  });

  it("returns all products sharing a code (multi-match)", () => {
    const matches = findProductMatches(products, "dup-001");
    expect(matches.map((p) => p._id)).toEqual(["dupA", "dupB"]);
  });

  it("returns an empty array for an unknown code", () => {
    expect(findProductMatches(products, "NOPE")).toEqual([]);
  });

  it("returns an empty array for an empty code", () => {
    expect(findProductMatches(products, "   ")).toEqual([]);
  });
});
