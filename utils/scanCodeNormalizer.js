/**
 * @param {string} raw - value from onBarcodeScanned
 * @returns {string} normalized lookup key
 */
export function normalizeScannedCode(raw) {
  if (!raw) {
    return "";
  }
  const trimmed = String(raw).trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    const extracted = extractCodeFromUrl(trimmed);
    if (extracted) {
      return extracted.toUpperCase();
    }
    return trimmed.toUpperCase();
  }
  return trimmed.toUpperCase();
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// For a scanned QR URL, prefer an explicit `code`/`sku` query param
// (case-insensitive); otherwise fall back to the last non-empty path segment.
// Returns "" when nothing usable can be extracted.
function extractCodeFromUrl(url) {
  const noHash = url.split("#")[0];
  const queryIndex = noHash.indexOf("?");
  const pathPart = queryIndex >= 0 ? noHash.slice(0, queryIndex) : noHash;
  const queryString = queryIndex >= 0 ? noHash.slice(queryIndex + 1) : "";

  if (queryString) {
    const pairs = queryString.split("&");
    for (const key of ["code", "sku"]) {
      for (const pair of pairs) {
        const eq = pair.indexOf("=");
        const name = eq >= 0 ? pair.slice(0, eq) : pair;
        const value = eq >= 0 ? pair.slice(eq + 1) : "";
        if (name.toLowerCase() === key && value) {
          const decoded = safeDecode(value).trim();
          if (decoded) {
            return decoded;
          }
        }
      }
    }
  }

  const afterScheme = pathPart.replace(/^https?:\/\//i, "");
  const slash = afterScheme.indexOf("/");
  const path = slash >= 0 ? afterScheme.slice(slash + 1) : "";
  const segments = path.split("/").filter((segment) => segment.length > 0);
  if (segments.length > 0) {
    return safeDecode(segments[segments.length - 1]).trim();
  }

  return "";
}
