import { network } from "../constants";
import { normalizeScannedCode } from "./scanCodeNormalizer";
import { track, SCAN_EVENTS } from "./scanAnalytics";

/**
 * @param {string} rawCode
 * @returns {Promise<
 *   | { status: 'found', product: object }
 *   | { status: 'multiple', matches: object[], scannedCode: string }
 *   | { status: 'not_found', scannedCode: string }
 *   | { status: 'error', message: string }
 * >}
 */
export async function lookupProductByCode(rawCode) {
  const code = normalizeScannedCode(rawCode);
  if (!code) {
    return { status: "error", message: "Invalid scan" };
  }

  try {
    const response = await fetch(
      `${network.serverip}/products/lookup?code=${encodeURIComponent(code)}`
    );
    const result = await response.json();

    if (response.status === 200 && result.success) {
      const matches = Array.isArray(result.matches)
        ? result.matches
        : result.data
          ? [result.data]
          : [];
      const matchCount = result.matchCount ?? matches.length;

      if (matchCount > 1) {
        track(SCAN_EVENTS.LOOKUP_MULTIPLE, { scannedCode: code, matchCount });
        return { status: "multiple", matches, scannedCode: code };
      }

      track(SCAN_EVENTS.LOOKUP_SUCCESS, {
        sku: result.data?.sku,
        productId: result.data?._id,
      });
      return { status: "found", product: result.data };
    }

    if (response.status === 404 && result.code === "PRODUCT_NOT_FOUND") {
      track(SCAN_EVENTS.LOOKUP_NOT_FOUND, { scannedCode: code });
      return { status: "not_found", scannedCode: code };
    }

    const message = result.message || "Lookup failed";
    track(SCAN_EVENTS.LOOKUP_ERROR, { message });
    return { status: "error", message };
  } catch (error) {
    const message = error.message || "Network error";
    track(SCAN_EVENTS.LOOKUP_ERROR, { message });
    return { status: "error", message };
  }
}
