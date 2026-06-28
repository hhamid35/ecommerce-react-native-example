// Pure, dependency-free matching helpers for the product lookup endpoint.
// Extracted from server.js so the broadened SKU-or-external-ID filter can be
// unit-tested without booting Express (the mock-server deps are not installed
// under the app's Jest runner).

// Normalize a scanned/lookup code the same way for SKUs and external IDs:
// trim surrounding whitespace and uppercase so matching is case- and
// whitespace-insensitive.
function normalizeLookupCode(code) {
  return String(code == null ? "" : code)
    .trim()
    .toUpperCase();
}

// Coerce an externalIds value (array, comma-separated string, or absent) into a
// normalized array of trimmed, uppercased, non-blank strings.
function normalizeExternalIds(input) {
  let list = [];
  if (Array.isArray(input)) {
    list = input;
  } else if (typeof input === "string") {
    list = input.split(",");
  } else {
    return [];
  }
  return list
    .map((entry) => normalizeLookupCode(entry))
    .filter((entry) => entry.length > 0);
}

// Return every product whose SKU OR any of its externalIds matches the code.
function findProductMatches(products, code) {
  const normalized = normalizeLookupCode(code);
  if (!normalized) {
    return [];
  }
  return (products || []).filter((p) => {
    const skuMatch = (p.sku || "").trim().toUpperCase() === normalized;
    const externalIds = Array.isArray(p.externalIds) ? p.externalIds : [];
    const externalMatch = externalIds.some(
      (e) => String(e).trim().toUpperCase() === normalized
    );
    return skuMatch || externalMatch;
  });
}

module.exports = {
  normalizeLookupCode,
  normalizeExternalIds,
  findProductMatches,
};
