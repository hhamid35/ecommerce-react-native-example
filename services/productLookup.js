import { network } from "../constants";

export async function lookupProductByCode(code) {
  const encoded = encodeURIComponent(code);
  const response = await fetch(
    `${network.serverip}/products/lookup?code=${encoded}`
  );
  const result = await response.json();
  return { ok: response.ok, status: response.status, result };
}
