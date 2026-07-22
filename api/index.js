import { get, post } from "./client";

// The backend seam: named operations screens call instead of building fetch.
// Each returns the parsed response body ({ success, data / categories, message,
// err, ... }) so callers keep their existing success/error handling. Network
// failures reject, so existing .catch() handlers still fire.
//
// The same flat contract is served by both the Node backend and the
// mock-server, so these operations work against either target unchanged.

const q = (value) => encodeURIComponent(value);

// ---- Auth / users ----
export const register = (payload) => post("/register", payload);
export const login = (email, password) => post("/login", { email, password });
export const requestPasswordReset = (email) => post("/forgot-password", { email });
export const resetForgottenPassword = (payload) =>
  post("/reset-forgotten-password", payload);
export const resetPassword = (userId, body) =>
  post(`/reset-password?id=${q(userId)}`, body);
export const deleteUser = (userId) => get(`/delete-user?id=${q(userId)}`);

// ---- Products ----
export const getProducts = (search) =>
  get(`/products${search ? `?search=${q(search)}` : ""}`);

export const normalizeScanCode = (value) =>
  String(value || "").trim().toLowerCase();

export const resolveProductByCode = async (code, format) => {
  const normalizedCode = normalizeScanCode(code);

  if (!normalizedCode) {
    return {
      success: false,
      reason: "invalid-code",
      message: "No scan code was detected.",
    };
  }

  let result;
  try {
    result = await getProducts();
  } catch (error) {
    console.log("scan_lookup_failed", { reason: "network" });
    throw error;
  }

  if (!result?.success || !Array.isArray(result.data)) {
    console.log("scan_lookup_failed", { reason: "lookup-failed" });
    return {
      success: false,
      reason: "lookup-failed",
      message: result?.message || "We could not check the catalog. Please try again.",
    };
  }

  const matches = result.data.filter((product) => {
    const sku = normalizeScanCode(product.sku);
    const externalId = normalizeScanCode(product.externalId);
    return sku === normalizedCode || externalId === normalizedCode;
  });

  if (matches.length > 1) {
    console.log("scan_duplicate_identifier", { count: matches.length });
    return {
      success: false,
      reason: "duplicate-match",
      message: "More than one product uses this scan code.",
    };
  }

  if (matches.length === 0) {
    return {
      success: false,
      reason: "not-found",
      message: "We could not find a product for this code.",
    };
  }

  const product = matches[0];
  const matchedBy =
    normalizeScanCode(product.sku) === normalizedCode ? "sku" : "externalId";

  return {
    success: true,
    product,
    code: normalizedCode,
    format,
    matchedBy,
  };
};

export const createProduct = (payload) => post("/product", payload);
export const updateProduct = (id, payload) =>
  post(`/update-product?id=${q(id)}`, payload);
export const deleteProduct = (id) => get(`/delete-product?id=${q(id)}`);

// ---- Categories ----
export const getCategories = () => get("/categories");
export const createCategory = (payload) => post("/category", payload);
export const updateCategory = (id, payload) =>
  post(`/update-category?id=${q(id)}`, payload);
export const deleteCategory = (id) => get(`/delete-category?id=${q(id)}`);

// ---- Orders ----
export const checkout = (payload) => post("/checkout", payload);
export const getOrders = () => get("/orders");
export const getAdminOrders = () => get("/admin/orders");
export const updateOrderStatus = (orderId, status) =>
  get(`/admin/order-status?orderId=${q(orderId)}&status=${q(status)}`);

// ---- Wishlist ----
export const getWishlist = () => get("/wishlist");
export const addToWishlist = (productId, quantity = 1) =>
  post("/add-to-wishlist", { productId, quantity });
export const removeFromWishlist = (productId) =>
  get(`/remove-from-wishlist?id=${q(productId)}`);

// ---- Admin ----
export const getDashboard = () => get("/dashboard");
export const getUsers = () => get("/admin/users");

// ---- Uploads ----
export const uploadPhoto = (formData) => post("/photos/upload", formData);

// Re-export the base-URL resolver so screens can build image URLs through
// the same seam that decides where the backend lives.
export { getBaseUrl, imageUrl } from "./config";
