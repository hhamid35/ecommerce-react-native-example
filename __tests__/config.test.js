import { isScanToProductEnabled } from "../api/config";

describe("isScanToProductEnabled", () => {
  const originalValue = process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT = originalValue;
    }
  });

  it("defaults to enabled when the flag is unset", () => {
    delete process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT;
    expect(isScanToProductEnabled()).toBe(true);
  });

  it("returns false only when explicitly set to false", () => {
    process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT = "false";
    expect(isScanToProductEnabled()).toBe(false);
  });
});
