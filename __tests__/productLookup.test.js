import { lookupProductByCode } from "../utils/productLookup";

const mockProduct = {
  _id: "prod001",
  title: "Classic White T-Shirt",
  sku: "GAR-001",
};

describe("lookupProductByCode", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns found when API returns 200 with product", async () => {
    global.fetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: mockProduct, matchCount: 1 }),
    });

    const result = await lookupProductByCode("gar-001");

    expect(result).toEqual({ status: "found", product: mockProduct });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products/lookup?code=GAR-001")
    );
  });

  it("returns found when resolved by an external ID (single match)", async () => {
    const headphones = {
      _id: "prod003",
      title: "Wireless Bluetooth Headphones",
      sku: "ELC-001",
      externalIds: ["0123456789012"],
    };
    global.fetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: headphones,
        matches: [headphones],
        matchCount: 1,
      }),
    });

    const result = await lookupProductByCode("0123456789012");

    expect(result).toEqual({ status: "found", product: headphones });
  });

  it("returns multiple when API returns matchCount > 1", async () => {
    const a = { _id: "prodA", title: "Product A", sku: "DUP-001" };
    const b = { _id: "prodB", title: "Product B", sku: "DUP-001" };
    global.fetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: a,
        matches: [a, b],
        matchCount: 2,
      }),
    });

    const result = await lookupProductByCode("dup-001");

    expect(result).toEqual({
      status: "multiple",
      matches: [a, b],
      scannedCode: "DUP-001",
    });
  });

  it("returns not_found when API returns 404 PRODUCT_NOT_FOUND", async () => {
    global.fetch.mockResolvedValue({
      status: 404,
      json: async () => ({
        success: false,
        code: "PRODUCT_NOT_FOUND",
        message: "No product matches the scanned code",
        scannedCode: "UNKNOWN",
      }),
    });

    const result = await lookupProductByCode("UNKNOWN");

    expect(result).toEqual({
      status: "not_found",
      scannedCode: "UNKNOWN",
    });
  });

  it("returns error on network failure", async () => {
    global.fetch.mockRejectedValue(new Error("Network request failed"));

    const result = await lookupProductByCode("GAR-001");

    expect(result).toEqual({
      status: "error",
      message: "Network request failed",
    });
  });

  it("returns error for empty scan data", async () => {
    const result = await lookupProductByCode("   ");

    expect(result).toEqual({ status: "error", message: "Invalid scan" });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
