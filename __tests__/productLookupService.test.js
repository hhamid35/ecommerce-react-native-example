import { lookupProductByCode } from "../services/productLookupService";

describe("lookupProductByCode", () => {
  const mockProduct = {
    _id: "prod001",
    title: "Classic White T-Shirt",
    sku: "GAR-001",
    price: 19.99,
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns found status when product matches", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockProduct }),
    });

    const result = await lookupProductByCode("GAR-001");

    expect(result).toEqual({ status: "found", product: mockProduct });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products/lookup?code=GAR-001")
    );
  });

  it("returns not_found status on 404", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        message: "No product found for this code",
      }),
    });

    const result = await lookupProductByCode("UNKNOWN");

    expect(result).toEqual({
      status: "not_found",
      message: "No product found for this code",
    });
  });

  it("returns network_error on fetch failure", async () => {
    global.fetch.mockRejectedValue(new Error("Network request failed"));

    const result = await lookupProductByCode("GAR-001");

    expect(result).toEqual({
      status: "network_error",
      message:
        "Could not reach the store. Check your connection and try again.",
    });
  });

  it("returns network_error on server 5xx", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, message: "Internal server error" }),
    });

    const result = await lookupProductByCode("GAR-001");

    expect(result.status).toBe("network_error");
  });
});
