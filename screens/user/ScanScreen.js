import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { normalizeScannedValue } from "../../utils/scanCodeParser";
import { lookupProductByCode } from "../../services/productLookup";
import CameraPermissionGate from "../../components/Scan/CameraPermissionGate";

const BARCODE_TYPES = ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128"];
const DEBOUNCE_MS = 2000;

const ScanScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const lastScanRef = useRef({ code: "", timestamp: 0 });

  const handleBarcodeScanned = useCallback(
    async ({ data, type }) => {
      if (isProcessing) return;

      const lookupCode = normalizeScannedValue(data, type);
      if (!lookupCode) return;

      const now = Date.now();
      if (
        lastScanRef.current.code === lookupCode &&
        now - lastScanRef.current.timestamp < DEBOUNCE_MS
      ) {
        return;
      }
      lastScanRef.current = { code: lookupCode, timestamp: now };

      setIsProcessing(true);
      setErrorMessage("");

      if (__DEV__) {
        console.log("Scan normalized code:", lookupCode);
      }

      try {
        const { ok, status, result } = await lookupProductByCode(lookupCode);

        if (__DEV__) {
          console.log("Scan lookup status:", status);
        }

        if (ok && result.success) {
          navigation.replace("productdetail", { product: result.data });
          return;
        }

        if (status === 404) {
          navigation.replace("scannotfound", { scannedCode: lookupCode });
          return;
        }

        setErrorMessage(
          result.message || "Something went wrong. Please try again."
        );
        setTimeout(() => setIsProcessing(false), DEBOUNCE_MS);
      } catch (_) {
        setErrorMessage(
          "Can't reach the store. Check your connection and try again."
        );
        setTimeout(() => setIsProcessing(false), DEBOUNCE_MS);
      }
    },
    [isProcessing, navigation]
  );

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted && !result.canAskAgain) {
      // permission state will update via hook
    }
  };

  if (!permission) {
    return (
      <View style={styles.loadingContainer} testID="scan-screen">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container} testID="scan-screen">
        <CameraPermissionGate
          status={permission.canAskAgain ? "undetermined" : "denied"}
          onRequestPermission={handleRequestPermission}
          onOpenSettings={() => Linking.openSettings()}
          onCancel={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="scan-screen">
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
      />
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          testID="scan-close-btn"
        >
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomHint}>
        <Text style={styles.hintText} testID="scan-hint-text">
          Align barcode or QR code within the frame.
        </Text>
      </View>
      {errorMessage ? (
        <View style={styles.errorBanner} testID="scan-error-banner">
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
      {isProcessing ? (
        <View style={styles.processingOverlay} testID="scan-processing-overlay">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.dark,
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  closeButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  bottomHint: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    padding: 16,
  },
  hintText: {
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
  },
  errorBanner: {
    position: "absolute",
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    textAlign: "center",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});
