import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import { normalizeScannedCode } from "../../utils/scanCodeNormalizer";
import { lookupProductByCode } from "../../services/productLookupService";

const ScanScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [permissionStatus, setPermissionStatus] = useState("undetermined");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState("");
  const scanLock = useRef(false);

  const requestCameraPermission = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      setPermissionStatus("granted");
    } else {
      setPermissionStatus("denied");
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Scanning unavailable",
        "Scanning is available on the mobile app",
        [
          {
            text: "Search",
            onPress: () => navigation.goBack(),
          },
          {
            text: "Browse Categories",
            onPress: () => navigation.navigate("categories"),
          },
        ]
      );
      return;
    }
    requestCameraPermission();
  }, [navigation, requestCameraPermission]);

  const resetScanLock = () => {
    scanLock.current = false;
    setIsLookingUp(false);
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanLock.current || isLookingUp) {
      return;
    }

    const normalized = normalizeScannedCode(data);
    if (normalized.rejected) {
      return;
    }

    scanLock.current = true;
    setIsLookingUp(true);
    setError("");

    const result = await lookupProductByCode(normalized.code);

    if (result.status === "found") {
      navigation.replace("productdetail", { product: result.product });
      return;
    }

    if (result.status === "not_found") {
      navigation.replace("scannotfound", { scannedCode: normalized.code });
      return;
    }

    setError(result.message);
    resetScanLock();
  };

  const handlePermissionDenied = () => (
    <View style={styles.permissionCard} testID="scan-permission-denied">
      <Text style={styles.permissionTitle}>Camera access needed</Text>
      <Text style={styles.permissionBody}>
        EasyBuy needs camera access to scan product barcodes and QR codes. You
        can enable it in Settings or search for products manually.
      </Text>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={() => Linking.openSettings()}
        testID="scan-open-settings-btn"
      >
        <Text style={styles.permissionButtonText}>Go to Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.permissionButton, styles.permissionButtonSecondary]}
        onPress={() => navigation.goBack()}
        testID="scan-search-instead-btn"
      >
        <Text style={styles.permissionButtonTextSecondary}>Search instead</Text>
      </TouchableOpacity>
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.container} testID="scan-screen-web-fallback">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="scan-screen-back-btn"
          >
            <Ionicons name="chevron-back" size={28} color={colors.light} />
          </TouchableOpacity>
        </View>
        <Text style={styles.webFallbackText}>
          Scanning is available on the mobile app
        </Text>
      </View>
    );
  }

  if (permissionStatus === "undetermined") {
    return (
      <View style={styles.container} testID="scan-screen">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <View style={styles.container} testID="scan-screen">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="scan-screen-back-btn"
          >
            <Ionicons name="chevron-back" size={28} color={colors.light} />
          </TouchableOpacity>
        </View>
        {handlePermissionDenied()}
      </View>
    );
  }

  return (
    <View style={styles.container} testID="scan-screen">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
          ],
        }}
        onBarcodeScanned={isLookingUp ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="scan-screen-back-btn"
          >
            <Ionicons name="chevron-back" size={28} color={colors.light} />
          </TouchableOpacity>
        </View>
        <View style={styles.maskRow}>
          <View style={styles.maskSide} />
          <View style={styles.viewfinder} />
          <View style={styles.maskSide} />
        </View>
        <View style={styles.maskBottom}>
          <Text style={styles.instructionText}>
            Point camera at product barcode or QR code
          </Text>
        </View>
      </View>
      {isLookingUp && (
        <View style={styles.loadingOverlay} testID="scan-loading-overlay">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {error !== "" && (
        <View style={styles.alertWrapper}>
          <CustomAlert message={error} type="error" testID="scan-network-error" />
          <TouchableOpacity
            style={styles.retryButton}
            onPress={resetScanLock}
            testID="scan-retry-btn"
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  maskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  maskSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    height: 160,
  },
  viewfinder: {
    width: 260,
    height: 160,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  maskBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 24,
  },
  instructionText: {
    color: colors.light,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionCard: {
    margin: 24,
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    width: "85%",
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 12,
  },
  permissionBody: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  permissionButtonSecondary: {
    backgroundColor: colors.light,
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 15,
  },
  permissionButtonTextSecondary: {
    color: colors.dark,
    fontWeight: "bold",
    fontSize: 15,
  },
  alertWrapper: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  webFallbackText: {
    color: colors.light,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
