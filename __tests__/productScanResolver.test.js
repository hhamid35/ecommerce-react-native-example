import {
  normalizeScanCode,
  resolveProductByScanCode,
} from "../utils/productScanResolver";

const sampleProducts = [
  {
    _id: "prod001",
    title: "Classic White T-Shirt",
    sku: "GAR-001",
    price: 19.99,
    quantity: 50,
    description: "A classic tee",
    image: "tshirt.png",
    category: { _id: "cat1", title: "Garments" },
  },
  {
    _id: "prod002",
    title: "Duplicate SKU Item",
    sku: "GAR-001",
    price: 9.99,
    quantity: 10,
    description: "Duplicate",
    image: "dup.png",
    category: { _id: "cat1", title: "Garments" },
  },
  {
    _id: "prod003",
    title: "Wireless Earbuds",
    sku: "ELC-001",
    price: 49.99,
    quantity: 0,
    description: "Out of stock",
    image: "earbuds.png",
    category: { _id: "cat2", title: "Electronics" },
  },
];

describe("normalizeScanCode", () => {
  it("trims whitespace", () => {
    expect(normalizeScanCode("  GAR-001  ")).toBe("GAR-001");
  });

  it("returns empty string for null", () => {
    expect(normalizeScanCode(null)).toBe("");
  });
});

describe("resolveProductByScanCode", () => {
  it("matches SKU case-insensitively", () => {
    const result = resolveProductByScanCode("gar-001", sampleProducts);
    expect(result.status).toBe("found");
    expect(result.product._id).toBe("prod001");
  });

  it("matches product _id", () => {
    const result = resolveProductByScanCode("prod003", sampleProducts);
    expect(result.status).toBe("found");
    expect(result.product.sku).toBe("ELC-001");
  });

  it("returns not_found for unknown code", () => {
    const result = resolveProductByScanCode("UNKNOWN-999", sampleProducts);
    expect(result).toEqual({
      status: "not_found",
      scannedCode: "UNKNOWN-999",
    });
  });

  it("returns catalog_unavailable for empty catalog", () => {
    const result = resolveProductByScanCode("GAR-001", []);
    expect(result).toEqual({
      status: "catalog_unavailable",
      reason: "empty_catalog",
    });
  });

  it("returns invalid_code for empty string", () => {
    const result = resolveProductByScanCode("   ", sampleProducts);
    expect(result).toEqual({
      status: "invalid_code",
      reason: "empty_code",
    });
  });

  it("returns first match when duplicate SKUs exist", () => {
    const result = resolveProductByScanCode("GAR-001", sampleProducts);
    expect(result.status).toBe("found");
    expect(result.product._id).toBe("prod001");
  });

  it("finds out-of-stock products", () => {
    const result = resolveProductByScanCode("ELC-001", sampleProducts);
    expect(result.status).toBe("found");
    expect(result.product.quantity).toBe(0);
  });
});
