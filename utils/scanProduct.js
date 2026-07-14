const MAX_LOOKUP_CODE_LENGTH = 256;

const QUERY_KEYS = ["sku", "externalId", "code"];

/**
 * Extract lookup code from URL-like QR payloads.
 * @param {string} rawValue
 * @returns {string|null}
 */
function extractCodeFromUrl(rawValue) {
  try {
    const url = new URL(rawValue);
    for (const key of QUERY_KEYS) {
      const value = url.searchParams.get(key);
      if (value && value.trim()) {
        return value.trim();
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Normalize a scanned barcode or QR value for catalog lookup.
 * @param {string} rawValue
 * @returns {{ rawValue: string, lookupCode: string, isSupported: boolean, reason?: string }}
 */
export function normalizeScannedCode(rawValue) {
  const trimmed = (rawValue || "").trim();

  if (!trimmed) {
    return {
      rawValue: trimmed,
      lookupCode: "",
      isSupported: false,
      reason: "empty",
    };
  }

  let lookupCode = trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    const extracted = extractCodeFromUrl(trimmed);
    if (!extracted) {
      return {
        rawValue: trimmed,
        lookupCode: "",
        isSupported: false,
        reason: "unsupported_url",
      };
    }
    lookupCode = extracted;
  }

  if (lookupCode.length > MAX_LOOKUP_CODE_LENGTH) {
    return {
      rawValue: trimmed,
      lookupCode: "",
      isSupported: false,
      reason: "too_long",
    };
  }

  return {
    rawValue: trimmed,
    lookupCode,
    isSupported: true,
  };
}

/**
 * Build the scan lookup API URL.
 * @param {string} baseUrl
 * @param {string} code
 * @returns {string}
 */
export function buildScanLookupUrl(baseUrl, code) {
  return `${baseUrl}/products/scan-lookup?code=${encodeURIComponent(code)}`;
}
