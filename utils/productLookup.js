import { network } from "../constants";
import { normalizeScannedCode } from "./scanCodeNormalizer";

/**
 * @param {string} rawCode
 * @returns {Promise<
 *   | { status: 'found', product: object }
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
      console.log("scan_lookup_success", {
        sku: result.data?.sku,
        productId: result.data?._id,
      });
      return { status: "found", product: result.data };
    }

    if (
      response.status === 404 &&
      result.code === "PRODUCT_NOT_FOUND"
    ) {
      console.log("scan_lookup_not_found", { scannedCode: code });
      return { status: "not_found", scannedCode: code };
    }

    if (response.status === 401 || response.status === 403) {
      console.log("scan_lookup_error", { message: result.message });
      return { status: "error", message: result.message };
    }

    console.log("scan_lookup_error", {
      message: result.message || "Lookup failed",
    });
    return {
      status: "error",
      message: result.message || "Lookup failed",
    };
  } catch (error) {
    console.log("scan_lookup_error", { message: error.message });
    return {
      status: "error",
      message: error.message || "Network error",
    };
  }
}
