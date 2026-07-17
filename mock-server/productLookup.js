function normalizeScanValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim().toUpperCase();
}

function normalizeExternalIds(value) {
  const entries = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const seen = new Set();
  const normalized = [];

  entries.forEach((entry) => {
    const trimmed = String(entry).trim();
    if (!trimmed) {
      return;
    }
    const key = trimmed.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      normalized.push(trimmed);
    }
  });

  return normalized;
}

function getProductExternalIds(product) {
  return normalizeExternalIds(product.externalIds || []);
}

function findProductByScanCode(products, code) {
  const normalizedCode = normalizeScanValue(code);

  if (!normalizedCode) {
    return { status: "invalid" };
  }

  const matches = [];

  products.forEach((product) => {
    const normalizedSku = normalizeScanValue(product.sku);
    if (normalizedSku && normalizedSku === normalizedCode) {
      matches.push({
        product,
        match: { field: "sku", value: product.sku },
      });
      return;
    }

    getProductExternalIds(product).forEach((externalId) => {
      if (normalizeScanValue(externalId) === normalizedCode) {
        matches.push({
          product,
          match: { field: "externalIds", value: externalId },
        });
      }
    });
  });

  if (matches.length > 1) {
    return { status: "duplicate" };
  }

  if (matches.length === 1) {
    return {
      status: "matched",
      product: matches[0].product,
      match: matches[0].match,
    };
  }

  return { status: "not_found" };
}

function validateUniqueIdentifiers(products, candidate, ignoredProductId = null) {
  const normalizedSku = normalizeScanValue(candidate.sku);
  const externalIds = normalizeExternalIds(candidate.externalIds);

  for (const product of products) {
    if (ignoredProductId && product._id === ignoredProductId) {
      continue;
    }

    if (normalizedSku && normalizeScanValue(product.sku) === normalizedSku) {
      return {
        valid: false,
        message: "Product identifiers must be unique",
      };
    }

    const existingExternalIds = getProductExternalIds(product);
    for (const externalId of externalIds) {
      const normalizedExternalId = normalizeScanValue(externalId);
      if (
        existingExternalIds.some(
          (existingId) => normalizeScanValue(existingId) === normalizedExternalId
        )
      ) {
        return {
          valid: false,
          message: "Product identifiers must be unique",
        };
      }
    }
  }

  return { valid: true };
}

module.exports = {
  normalizeScanValue,
  normalizeExternalIds,
  findProductByScanCode,
  validateUniqueIdentifiers,
};
