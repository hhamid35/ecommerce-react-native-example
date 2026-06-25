function normalizeLookupCode(code) {
  if (!code || typeof code !== "string") return "";
  return code.trim();
}

function resolveProductByCode(code, productList) {
  const normalized = normalizeLookupCode(code);
  if (!normalized) return null;

  const bySku = productList.find((p) => p.sku === normalized);
  if (bySku) return { product: bySku, matchedBy: "sku" };

  const byExternalId = productList.find(
    (p) => p.externalId && p.externalId === normalized
  );
  if (byExternalId) return { product: byExternalId, matchedBy: "externalId" };

  return null;
}

module.exports = {
  normalizeLookupCode,
  resolveProductByCode,
};
