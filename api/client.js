import { getBaseUrl } from "./config";
import * as session from "../utils/session";
import { resetToLogin } from "../routes/navigationRef";

// Low-level transport for the backend seam. Owns URL composition, the
// x-auth-token header, JSON parsing, and centralized token-expiry handling.
// Named operations in ./index.js build on top of this — screens never see it.
async function request(method, path, { body, headers } = {}) {
  const finalHeaders = new Headers(headers || {});

  // Attach the auth token automatically when the user is signed in.
  // Public endpoints simply ignore it.
  const token = await session.getToken();
  if (token) finalHeaders.append("x-auth-token", token);

  let payload = body;
  if (body != null && !(body instanceof FormData)) {
    finalHeaders.append("Content-Type", "application/json");
    payload = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers: finalHeaders,
    body: payload,
    redirect: "follow",
  });

  let result;
  try {
    result = await response.json();
  } catch (e) {
    result = {};
  }

  // Centralized token-expiry: clear the session and redirect to login once,
  // so no screen has to detect "jwt expired" itself.
  if (result?.err === "jwt expired") {
    await session.clearSession();
    resetToLogin();
  }

  return result;
}

export const get = (path, opts) => request("GET", path, opts);
export const post = (path, body, opts) =>
  request("POST", path, { ...(opts || {}), body });
