export function normalizeScanValue(value) {
  if (value == null) {
    return "";
  }
  return String(value).trim().toUpperCase();
}

export function extractApprovedSku(value) {
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

export function isSupportedScanType(type) {
  if (!type) {
    return false;
  }

  const normalized = String(type).toLowerCase().replace(/[-_]/g, "");
  const supported = ["qr", "ean13", "ean8", "upca", "upce", "code39", "code128"];
  return supported.includes(normalized);
}
