/**
 * @typedef {'found'|'not_found'|'catalog_unavailable'|'invalid_code'} ScanResolveStatus
 * @typedef {{ status: 'found', product: object }} ScanFoundResult
 * @typedef {{ status: 'not_found', scannedCode: string }} ScanNotFoundResult
 * @typedef {{ status: 'catalog_unavailable', reason: string }} ScanCatalogUnavailableResult
 * @typedef {{ status: 'invalid_code', reason: string }} ScanInvalidCodeResult
 */

/**
 * Normalize a scanned code for comparison.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeScanCode(raw) {
  if (raw == null) return "";
  return String(raw).trim();
}

/**
 * @param {string} codeLower
 * @param {Array<{ _id: string, sku?: string }>} products
 * @returns {object|undefined}
 */
function findMatch(codeLower, products) {
  return products.find((p) => {
    const sku = normalizeScanCode(p.sku).toLowerCase();
    const id = normalizeScanCode(p._id).toLowerCase();
    return sku === codeLower || id === codeLower;
  });
}

/**
 * @param {string} codeLower
 * @param {Array<{ _id: string, sku?: string }>} products
 */
function logDuplicateSkuWarning(codeLower, products) {
  const skuMatches = products.filter(
    (p) => normalizeScanCode(p.sku).toLowerCase() === codeLower
  );
  if (skuMatches.length > 1) {
    console.log("scan_duplicate_sku_warning", {
      sku: codeLower,
      productIds: skuMatches.map((p) => p._id),
    });
  }
}

/**
 * Resolve a scanned code against a product list.
 * @param {string} scannedCode
 * @param {Array<{ _id: string, sku?: string, title: string, price: number, quantity: number, description: string, image: string, category: object }>} products
 * @param {{ matchKeys?: ('sku' | '_id' | 'barcode')[] }} [options]
 * @returns {ScanFoundResult|ScanNotFoundResult|ScanCatalogUnavailableResult|ScanInvalidCodeResult}
 */
export function resolveProductByScanCode(scannedCode, products, options = {}) {
  const code = normalizeScanCode(scannedCode);
  if (!code) {
    return { status: "invalid_code", reason: "empty_code" };
  }
  if (!Array.isArray(products) || products.length === 0) {
    return { status: "catalog_unavailable", reason: "empty_catalog" };
  }

  const codeLower = code.toLowerCase();
  const matchKeys = options.matchKeys || ["sku", "_id"];

  let match;
  if (matchKeys.includes("sku") || matchKeys.includes("_id")) {
    match = findMatch(codeLower, products);
  }

  if (match) {
    logDuplicateSkuWarning(codeLower, products);
    return { status: "found", product: match };
  }
  return { status: "not_found", scannedCode: code };
}
