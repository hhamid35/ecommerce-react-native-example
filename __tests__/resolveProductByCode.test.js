import * as client from "../api/client";
import {
  normalizeScanCode,
  resolveProductByCode,
} from "../api/index";

jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

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
    externalId: "0123456789013",
    price: 49.99,
    quantity: 30,
  },
];

describe("normalizeScanCode", () => {
  it("trims and lowercases scan values", () => {
    expect(normalizeScanCode("  GAR-001  ")).toBe("gar-001");
  });

  it("returns an empty string for blank values", () => {
    expect(normalizeScanCode(null)).toBe("");
  });
});

describe("resolveProductByCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns invalid-code when the scan value is empty", async () => {
    const result = await resolveProductByCode("   ");

    expect(result).toEqual({
      success: false,
      reason: "invalid-code",
      message: "No scan code was detected.",
    });
    expect(client.get).not.toHaveBeenCalled();
  });

  it("matches a product by SKU", async () => {
    client.get.mockResolvedValue({ success: true, data: sampleProducts });

    const result = await resolveProductByCode("gar-001", "qr");

    expect(result).toEqual({
      success: true,
      product: sampleProducts[0],
      code: "gar-001",
      format: "qr",
      matchedBy: "sku",
    });
    expect(client.get).toHaveBeenCalledWith("/products");
  });

  it("matches a product by external ID", async () => {
    client.get.mockResolvedValue({ success: true, data: sampleProducts });

    const result = await resolveProductByCode("0123456789013");

    expect(result).toEqual({
      success: true,
      product: sampleProducts[1],
      code: "0123456789013",
      format: undefined,
      matchedBy: "externalId",
    });
  });

  it("returns not-found when no product matches", async () => {
    client.get.mockResolvedValue({ success: true, data: sampleProducts });

    const result = await resolveProductByCode("unknown-code");

    expect(result).toEqual({
      success: false,
      reason: "not-found",
      message: "We could not find a product for this code.",
    });
  });

  it("returns duplicate-match when multiple products share the code", async () => {
    client.get.mockResolvedValue({
      success: true,
      data: [
        { _id: "a", sku: "dup-001", externalId: "shared" },
        { _id: "b", sku: "shared", externalId: "other" },
      ],
    });

    const result = await resolveProductByCode("shared");

    expect(result).toEqual({
      success: false,
      reason: "duplicate-match",
      message: "More than one product uses this scan code.",
    });
  });

  it("returns lookup-failed for malformed catalog responses", async () => {
    client.get.mockResolvedValue({ success: false, message: "Catalog unavailable" });

    const result = await resolveProductByCode("gar-001");

    expect(result).toEqual({
      success: false,
      reason: "lookup-failed",
      message: "Catalog unavailable",
    });
  });

  it("rejects when the catalog request fails", async () => {
    client.get.mockRejectedValue(new Error("Network request failed"));

    await expect(resolveProductByCode("gar-001")).rejects.toThrow(
      "Network request failed"
    );
  });
});
