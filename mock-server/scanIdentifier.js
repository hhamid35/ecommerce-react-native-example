function normalizeScanValue(value) {
  if (value == null) {
    return "";
  }
  return String(value).trim().toUpperCase();
}

function extractApprovedSku(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.includes("://")) {
    return null;
  }

  const normalized = normalizeScanValue(trimmed);

  const easybuyMatch = normalized.match(/^EASYBUY:SKU:(.+)$/);
  if (easybuyMatch) {
    return easybuyMatch[1];
  }

  const skuPrefixMatch = normalized.match(/^SKU:(.+)$/);
  if (skuPrefixMatch) {
    return skuPrefixMatch[1];
  }

  if (/^[A-Z0-9][A-Z0-9_-]*$/.test(normalized)) {
    return normalized;
  }

  return null;
}

function findProductsBySku(products, sku) {
  const normalizedSku = normalizeScanValue(sku);
  return products.filter(
    (product) => normalizeScanValue(product.sku) === normalizedSku
  );
}

function hasDuplicateSku(products, sku, excludeId) {
  const normalizedSku = normalizeScanValue(sku);
  if (!normalizedSku) {
    return false;
  }
  return products.some(
    (product) =>
      product._id !== excludeId &&
      normalizeScanValue(product.sku) === normalizedSku
  );
}

module.exports = {
  normalizeScanValue,
  extractApprovedSku,
  findProductsBySku,
  hasDuplicateSku,
};
