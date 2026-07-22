import { getBaseUrl } from "../api/config";

// Backwards-compatible shim. The base URL now lives behind the API seam
// (api/config.js -> getBaseUrl), which resolves per platform (web/iOS ->
// localhost, Android -> 10.0.2.2) and honours EXPO_PUBLIC_API_URL so the app
// can point at either the Node backend or the mock-server. Existing image-URL
// composition (`${network.serverip}/uploads/...`) keeps working.
const network = {
  get serverip() {
    return getBaseUrl();
  },
};

export default network;
