import { network } from "../constants";

/**
 * @param {string} code - Normalized scan code
 * @returns {Promise<
 *   | { status: "found", product: object }
 *   | { status: "not_found", message: string }
 *   | { status: "network_error", message: string }
 * >}
 */
export async function lookupProductByCode(code) {
  try {
    const response = await fetch(
      `${network.serverip}/products/lookup?code=${encodeURIComponent(code)}`
    );
    const result = await response.json();

    if (response.ok && result.success) {
      return { status: "found", product: result.data };
    }

    if (response.status === 404 || response.status === 400) {
      return { status: "not_found", message: result.message };
    }

    return {
      status: "network_error",
      message: "Could not reach the store. Check your connection and try again.",
    };
  } catch (error) {
    console.error("scan lookup failed", error);
    return {
      status: "network_error",
      message: "Could not reach the store. Check your connection and try again.",
    };
  }
}
