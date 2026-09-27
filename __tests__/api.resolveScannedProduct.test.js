import * as api from "../api";
import * as client from "../api/client";

jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("resolveScannedProduct", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls GET /products/scan with encoded code", async () => {
    client.get.mockResolvedValue({ success: true, data: { _id: "prod001" } });

    await api.resolveScannedProduct("GAR-001");

    expect(client.get).toHaveBeenCalledWith("/products/scan?code=GAR-001");
  });

  it("encodes special characters in the scanned code", async () => {
    client.get.mockResolvedValue({ success: true, data: {} });

    await api.resolveScannedProduct("code with spaces");

    expect(client.get).toHaveBeenCalledWith(
      "/products/scan?code=code%20with%20spaces"
    );
  });
});
