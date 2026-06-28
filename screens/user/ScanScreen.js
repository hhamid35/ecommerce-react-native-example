import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton/CustomButton";
import { lookupProductByCode } from "../../utils/productLookup";
import { track, SCAN_EVENTS } from "../../utils/scanAnalytics";

const BARCODE_TYPES = [
  "qr",
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
  "code39",
];

const SCAN_COOLDOWN_MS = 2000;

const ScanScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isResolving, setIsResolving] = useState(false);
  const [scanLock, setScanLock] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const cooldownRef = useRef(null);
  const scanStartedRef = useRef(false);

  const permissionStatus = permission?.status ?? "undetermined";

  useEffect(() => {
    if (permissionStatus === "undetermined") {
      requestPermission();
    }
  }, [permissionStatus, requestPermission]);

  useEffect(() => {
    if (permissionStatus === "granted" && !scanStartedRef.current) {
      scanStartedRef.current = true;
      track(SCAN_EVENTS.STARTED, {});
    }
    if (permissionStatus === "denied") {
      track(SCAN_EVENTS.PERMISSION_DENIED, {});
    }
  }, [permissionStatus]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, []);

  const releaseScanLock = useCallback(() => {
    cooldownRef.current = setTimeout(() => {
      setScanLock(false);
      setIsResolving(false);
    }, SCAN_COOLDOWN_MS);
  }, []);

  const handleBarcodeScanned = useCallback(
    async ({ data }) => {
      if (scanLock || isResolving) {
        return;
      }
      setScanLock(true);
      setIsResolving(true);
      setNetworkError(null);

      const result = await lookupProductByCode(data);

      if (result.status === "found") {
        navigation.navigate("productdetail", { product: result.product });
        releaseScanLock();
        return;
      }

      if (result.status === "multiple") {
        navigation.navigate("scanmatches", {
          matches: result.matches,
          scannedCode: result.scannedCode,
        });
        releaseScanLock();
        return;
      }

      if (result.status === "not_found") {
        navigation.navigate("scannotfound", {
          scannedCode: result.scannedCode,
        });
        releaseScanLock();
        return;
      }

      setNetworkError(
        result.message ||
          "Couldn't reach the store. Check your connection and try again."
      );
      setIsResolving(false);
      releaseScanLock();
    },
    [scanLock, isResolving, navigation, releaseScanLock]
  );

  const handleClose = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    setNetworkError(null);
    setScanLock(false);
    setIsResolving(false);
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  if (permission == null || permissionStatus === "undetermined") {
    return (
      <View style={styles.centered} testID="scan-screen">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.helperText}>Requesting camera access…</Text>
      </View>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <View style={styles.centered} testID="scan-screen">
        <View style={styles.deniedContent} testID="scan-permission-denied">
          <Ionicons name="camera-outline" size={64} color={colors.muted} />
          <Text style={styles.deniedTitle}>Camera access needed</Text>
          <Text style={styles.deniedBody}>
            Camera access is needed to scan products. You can enable it in
            Settings or search manually.
          </Text>
          <CustomButton
            text="Go to Settings"
            onPress={handleOpenSettings}
            testID="scan-settings-btn"
          />
          <CustomButton
            text="Back to Home"
            onPress={handleClose}
            testID="scan-search-instead-btn"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="scan-screen">
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={scanLock || isResolving ? undefined : handleBarcodeScanned}
        testID="scan-camera-view"
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          testID="scan-close-btn"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>

        {networkError ? (
          <View style={styles.errorBanner} testID="scan-network-error">
            <Text style={styles.errorBannerText}>
              Couldn&apos;t reach the store. Check your connection and try again.
            </Text>
            <TouchableOpacity onPress={handleRetry} accessibilityLabel="Retry">
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.overlay}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>
            Align barcode or QR code within the frame
          </Text>
          <Text style={styles.helperText}>
            Point camera at barcode or QR code
          </Text>
        </View>

        {isResolving ? (
          <View style={styles.resolvingOverlay}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.resolvingText}>Looking up product…</Text>
          </View>
        ) : null}
      </CameraView>
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  camera: {
    flex: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.dark,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  deniedContent: {
    width: "100%",
    alignItems: "center",
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  deniedBody: {
    fontSize: 15,
    color: colors.light,
    textAlign: "center",
    marginBottom: 24,
  },
  closeButton: {
    position: "absolute",
    top: 48,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinder: {
    width: "70%",
    aspectRatio: 1.4,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: colors.white,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instructionText: {
    color: colors.white,
    fontSize: 16,
    marginTop: 24,
    textAlign: "center",
  },
  helperText: {
    color: colors.light,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  errorBanner: {
    position: "absolute",
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: colors.warning,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorBannerText: {
    flex: 1,
    color: colors.dark,
    fontSize: 14,
    marginRight: 8,
  },
  retryText: {
    color: colors.dark,
    fontWeight: "bold",
    fontSize: 14,
  },
  resolvingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  resolvingText: {
    color: colors.white,
    marginTop: 12,
    fontSize: 16,
  },
});
