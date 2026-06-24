import { Camera } from "expo-camera";

/**
 * @returns {Promise<{ granted: boolean, canAskAgain: boolean, status: string }>}
 */
export async function requestCameraPermission() {
  const existing = await Camera.getCameraPermissionsAsync();
  if (existing.granted) {
    return {
      granted: true,
      canAskAgain: existing.canAskAgain,
      status: existing.status,
    };
  }
  const requested = await Camera.requestCameraPermissionsAsync();
  return {
    granted: requested.granted,
    canAskAgain: requested.canAskAgain,
    status: requested.status,
  };
}
