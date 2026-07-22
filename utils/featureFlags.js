/**
 * Feature flags for optional shopper-facing capabilities.
 */
export function isProductScanEnabled() {
  const env = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_ENABLE_PRODUCT_SCAN;

  if (env === 'true' || env === '1') {
    return true;
  }
  if (env === 'false' || env === '0') {
    return false;
  }

  return typeof __DEV__ !== 'undefined' ? __DEV__ : false;
}
