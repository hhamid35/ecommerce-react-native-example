export function normalizeScanCode(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

export function getProductScanIdentifiers(product) {
  const identifiers = [];
  if (!product) {
    return identifiers;
  }

  const sku = normalizeScanCode(product.sku);
  if (sku) {
    identifiers.push({ field: "sku", value: sku });
  }

  const externalId = normalizeScanCode(product.externalId);
  if (externalId) {
    identifiers.push({ field: "externalId", value: externalId });
  }

  return identifiers;
}

export function findProductsByScanCode(products, rawCode) {
  const normalizedCode = normalizeScanCode(rawCode);
  const matches = [];

  if (!normalizedCode || !Array.isArray(products)) {
    return { normalizedCode, matches };
  }

  const lowerCode = normalizedCode.toLowerCase();

  products.forEach((product) => {
    getProductScanIdentifiers(product).forEach((identifier) => {
      if (identifier.value.toLowerCase() === lowerCode) {
        matches.push({
          product,
          field: identifier.field,
          value: identifier.value,
        });
      }
    });
  });

  return { normalizedCode, matches };
}

export function toScanResolution(products, rawCode) {
  const { normalizedCode, matches } = findProductsByScanCode(products, rawCode);

  if (!normalizedCode) {
    return {
      success: false,
      code: "SCAN_CODE_REQUIRED",
      message: "A valid product code is required",
    };
  }

  if (matches.length === 0) {
    return {
      success: false,
      code: "PRODUCT_SCAN_NOT_FOUND",
      message: "No product found for this code",
      scannedCode: normalizedCode,
    };
  }

  if (matches.length > 1) {
    return {
      success: false,
      code: "PRODUCT_SCAN_AMBIGUOUS",
      message: "Multiple products match this code",
      scannedCode: normalizedCode,
    };
  }

  const match = matches[0];
  return {
    success: true,
    data: match.product,
    match: { field: match.field, value: match.value },
    scannedCode: normalizedCode,
  };
}
