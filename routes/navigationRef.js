import { createNavigationContainerRef } from "@react-navigation/native";

// A navigation handle the API seam can use to redirect on token expiry,
// without every screen having to own logout-on-expiry.
export const navigationRef = createNavigationContainerRef();

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: "login" }] });
  }
}
