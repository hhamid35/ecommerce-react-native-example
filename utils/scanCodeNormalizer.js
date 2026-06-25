/**
 * @param {string} raw - value from onBarcodeScanned
 * @returns {string} normalized lookup key
 */
export function normalizeScannedCode(raw) {
  if (!raw) {
    return "";
  }
  const trimmed = String(raw).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return trimmed.toUpperCase();
}
