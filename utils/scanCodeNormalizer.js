const MAX_CODE_LENGTH = 128;

/**
 * @param {string} raw - Raw barcode/QR string from camera
 * @returns {{ code: string, rejected: boolean, reason?: string }}
 */
export function normalizeScannedCode(raw) {
  if (raw == null || raw === "") {
    return { rejected: true, reason: "empty" };
  }

  const trimmed = String(raw).trim();

  if (trimmed === "") {
    return { rejected: true, reason: "empty" };
  }

  if (trimmed.length > MAX_CODE_LENGTH) {
    return { rejected: true, reason: "too_long" };
  }

  return { code: trimmed, rejected: false };
}
