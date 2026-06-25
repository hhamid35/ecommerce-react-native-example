export function normalizeScannedValue(rawValue, barcodeType) {
  const trimmed = (rawValue || "").trim();
  if (!trimmed) return "";

  if (barcodeType === "qr") {
    try {
      const url = new URL(trimmed);
      const fromQuery =
        url.searchParams.get("sku") || url.searchParams.get("code");
      if (fromQuery) return fromQuery.trim();
      const segments = url.pathname.split("/").filter(Boolean);
      if (segments.length) return segments[segments.length - 1].trim();
    } catch (_) {
      /* not a URL — use raw */
    }
  }

  return trimmed;
}
