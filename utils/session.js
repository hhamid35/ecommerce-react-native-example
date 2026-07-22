import * as authStorage from "./authStorage";

// The one place that owns the authenticated user + token lifecycle.
// Everything else asks this module for identity instead of reading storage
// or route params directly.
const KEY = "authUser";

// Return the stored user object (with token) or null.
export async function getUser() {
  const value = await authStorage.getItem(KEY);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

// Return the JWT for the current user, or null when signed out.
export async function getToken() {
  const user = await getUser();
  return user?.token ?? null;
}

// Persist the user returned by POST /login.
export async function setSession(user) {
  await authStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

// Clear the stored session (logout / token expiry).
export async function clearSession() {
  await authStorage.deleteItem(KEY);
}

export async function isAdmin() {
  const user = await getUser();
  return user?.userType === "ADMIN";
}
