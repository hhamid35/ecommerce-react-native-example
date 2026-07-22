jest.mock("../api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import { get } from "../api/client";
import { resolveScannedProduct } from "../api";

describe("resolveScannedProduct", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue({ success: true, data: { _id: "prod001" } });
  });

  it("builds the resolve-scan path with encoded code", async () => {
    await resolveScannedProduct("GAR-001");
    expect(get).toHaveBeenCalledWith("/products/resolve-scan?code=GAR-001");
  });

  it("includes optional format query parameter", async () => {
    await resolveScannedProduct("GAR 001", "qr");
    expect(get).toHaveBeenCalledWith(
      "/products/resolve-scan?code=GAR%20001&format=qr"
    );
  });
});
