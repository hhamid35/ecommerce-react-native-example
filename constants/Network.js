const network = {
  // EXPO_PUBLIC_API_URL is injected by the ALORA preview runner;
  // falls back to the Android-emulator loopback for local dev.
  serverip:
    (typeof process !== "undefined" &&
      process.env &&
      process.env.EXPO_PUBLIC_API_URL) ||
    "http://10.0.2.2:3002",
};

export default network;
