describe("FeatureFlags", () => {
  const originalEnv = process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT;
    } else {
      process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT = originalEnv;
    }
    jest.resetModules();
  });

  it("enables scan-to-product by default", () => {
    delete process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT;
    jest.resetModules();
    const featureFlags = require("../constants/FeatureFlags").default;
    expect(featureFlags.scanToProductEnabled).toBe(true);
  });

  it("disables scan-to-product when env is false", () => {
    process.env.EXPO_PUBLIC_ENABLE_SCAN_TO_PRODUCT = "false";
    jest.resetModules();
    const featureFlags = require("../constants/FeatureFlags").default;
    expect(featureFlags.scanToProductEnabled).toBe(false);
  });
});
