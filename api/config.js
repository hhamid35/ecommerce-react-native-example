import { Platform } from "react-native";

// Default target when EXPO_PUBLIC_API_URL is not set: the local mock-server.
// The real Node backend listens on :3000, the mock-server on :3002 — set
// EXPO_PUBLIC_API_URL to point at whichever you want (e.g. http://localhost:3000).
const DEFAULT_PORT = 3002;

// Android emulators reach the host machine through the 10.0.2.2 loopback,
// while web and the iOS simulator talk to localhost directly.
function defaultHost() {
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

// Android emulators can't reach the host machine via localhost/127.0.0.1 — they
// need the 10.0.2.2 loopback. Rewrite it so one EXPO_PUBLIC_API_URL value works
// across web, iOS simulator, and Android emulator without editing per platform.
function forPlatform(url) {
  if (Platform.OS === "android") {
    return url.replace(/(https?:\/\/)(localhost|127\.0\.0\.1)/i, "$110.0.2.2");
  }
  return url;
}

// The single place that decides where the backend lives.
export function getBaseUrl() {
  const fromEnv =
    typeof process !== "undefined" &&
    process.env &&
    process.env.EXPO_PUBLIC_API_URL;

  if (fromEnv) {
    // strip any trailing slash so path concatenation stays clean
    return forPlatform(String(fromEnv).replace(/\/+$/, ""));
  }

  return `http://${defaultHost()}:${DEFAULT_PORT}`;
}

// Compose the URL for an uploaded image served at /uploads/<filename>.
export function imageUrl(filename) {
  return `${getBaseUrl()}/uploads/${filename}`;
}
