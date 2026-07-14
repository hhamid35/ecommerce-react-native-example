import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import {
  normalizeScannedCode,
  buildScanLookupUrl,
} from "../../utils/scanProduct";

const BARCODE_TYPES = [
  "qr",
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
];

const truncateCode = (value, maxLength = 48) => {
  if (!value || value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...`;
};

const ScanProductScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState("checking");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [lastCode, setLastCode] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);

  const requestCameraPermission = useCallback(async () => {
    const result = await requestPermission();
    if (result.granted) {
      setPermissionStatus("granted");
    } else {
      setPermissionStatus("denied");
    }
  }, [requestPermission]);

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  const lookupScannedProduct = async (rawValue, barcodeType) => {
    const normalized = normalizeScannedCode(rawValue);

    if (!normalized.isSupported) {
      setScanLocked(true);
      setLastCode(truncateCode(normalized.rawValue));
      setMessage("We could not find a product for this code.");
      setAlertType("error");
      setShowRecovery(true);
      console.log({
        feature: "scan-product",
        event: "lookup_failed",
        status: "unsupported",
        barcodeType,
      });
      return;
    }

    setIsLookingUp(true);
    setScanLocked(true);
    setLastCode(truncateCode(normalized.lookupCode));
    setMessage("");
    setShowRecovery(false);

    try {
      const response = await fetch(
        buildScanLookupUrl(network.serverip, normalized.lookupCode)
      );
      const result = await response.json();

      if (result.success === true && result.data) {
        navigation.replace("productdetail", { product: result.data });
        return;
      }

      setMessage(
        result.message || "We could not find a product for this code."
      );
      setAlertType("error");
      setShowRecovery(true);
      console.log({
        feature: "scan-product",
        event: "lookup_failed",
        status: response.status,
        barcodeType,
      });
    } catch (error) {
      setMessage("We could not find a product for this code.");
      setAlertType("error");
      setShowRecovery(true);
      console.log({
        feature: "scan-product",
        event: "lookup_failed",
        status: "network",
        barcodeType,
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleBarcodeScanned = ({ data, type }) => {
    if (!data || scanLocked || isLookingUp) {
      return;
    }
    lookupScannedProduct(data, type);
  };

  const handleRetry = () => {
    setMessage("");
    setLastCode("");
    setScanLocked(false);
    setShowRecovery(false);
    setAlertType("error");
  };

  const handleManualSearch = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("tab", { screen: "home" });
  };

  const handleBrowseCategories = () => {
    navigation.navigate("categories");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (permissionStatus === "checking" && !permission) {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <StatusBar />
        <Text style={styles.guidanceText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <StatusBar />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} testID="scan-product-back-btn">
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
        <View
          style={styles.permissionContainer}
          testID="scan-product-permission-denied"
        >
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            Camera access is needed to scan products. You can enable it in
            settings or search manually.
          </Text>
          <CustomButton
            text="Search Manually"
            onPress={handleManualSearch}
            testID="scan-product-search-btn"
          />
          <CustomButton text="Back" onPress={handleBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="scan-product-screen">
      <StatusBar />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} testID="scan-product-back-btn">
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.light}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: BARCODE_TYPES,
          }}
          onBarcodeScanned={scanLocked ? undefined : handleBarcodeScanned}
          testID="scan-product-camera"
        />
        <View style={styles.overlay}>
          <Text style={styles.guidanceText}>
            Align the barcode or QR code inside the frame
          </Text>
        </View>
      </View>

      {isLookingUp && (
        <Text style={styles.statusText}>Looking up product...</Text>
      )}

      {message ? (
        <CustomAlert
          message={message}
          type={alertType}
          testID="scan-product-alert"
        />
      ) : null}

      {lastCode && showRecovery ? (
        <Text style={styles.scannedCodeText} testID="scan-product-last-code">
          Scanned: {lastCode}
        </Text>
      ) : null}

      {showRecovery && (
        <View style={styles.recoveryContainer}>
          <CustomButton
            text="Retry Scan"
            onPress={handleRetry}
            testID="scan-product-retry-btn"
          />
          <CustomButton
            text="Search Manually"
            onPress={handleManualSearch}
            testID="scan-product-search-btn"
          />
          <CustomButton
            text="Browse Categories"
            onPress={handleBrowseCategories}
            testID="scan-product-categories-btn"
          />
        </View>
      )}
    </View>
  );
};

export default ScanProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  cameraWrapper: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  guidanceText: {
    color: colors.light,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    color: colors.light,
    textAlign: "center",
    padding: 10,
    backgroundColor: colors.muted,
  },
  scannedCodeText: {
    color: colors.light,
    textAlign: "center",
    padding: 8,
    backgroundColor: colors.muted,
  },
  recoveryContainer: {
    padding: 20,
    backgroundColor: colors.light,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.light,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.muted,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 20,
  },
});
