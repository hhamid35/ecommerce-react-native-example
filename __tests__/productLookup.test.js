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
      json: async () => ({ success: true, data: mockProduct }),
    });

    const result = await lookupProductByCode("gar-001");

    expect(result).toEqual({ status: "found", product: mockProduct });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products/lookup?code=GAR-001")
    );
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
