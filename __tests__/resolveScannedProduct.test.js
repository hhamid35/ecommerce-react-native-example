import * as api from "../api";

jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const { get } = require("../api/client");

const catalog = [
  {
    _id: "prod001",
    title: "Classic White T-Shirt",
    sku: "GAR-001",
    externalId: "0123456789012",
    price: 19.99,
    quantity: 50,
  },
];

describe("resolveScannedProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a matched product from the catalog", async () => {
    get.mockResolvedValue({ success: true, data: catalog });
    const result = await api.resolveScannedProduct("GAR-001");
    expect(result.success).toBe(true);
    expect(result.data._id).toBe("prod001");
    expect(result.match).toEqual({ field: "sku", value: "GAR-001" });
  });

  it("returns SCAN_CATALOG_UNAVAILABLE when catalog fetch fails", async () => {
    get.mockResolvedValue({ success: false, message: "Server error" });
    const result = await api.resolveScannedProduct("GAR-001");
    expect(result).toEqual({
      success: false,
      code: "SCAN_CATALOG_UNAVAILABLE",
      message: "Server error",
    });
  });

  it("returns SCAN_CATALOG_UNAVAILABLE when catalog data is malformed", async () => {
    get.mockResolvedValue({ success: true, data: null });
    const result = await api.resolveScannedProduct("GAR-001");
    expect(result).toEqual({
      success: false,
      code: "SCAN_CATALOG_UNAVAILABLE",
      message: "Unable to check the catalog right now",
    });
  });

  it("returns SCAN_CATALOG_UNAVAILABLE on network failure", async () => {
    get.mockRejectedValue(new Error("Network request failed"));
    const result = await api.resolveScannedProduct("GAR-001");
    expect(result).toEqual({
      success: false,
      code: "SCAN_CATALOG_UNAVAILABLE",
      message: "Unable to check the catalog right now",
    });
  });
});
