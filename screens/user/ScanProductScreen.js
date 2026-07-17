import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import { isSupportedScanType } from "../../utils/scanIdentifier";

const BARCODE_TYPES = ["qr", "ean13", "ean8", "upc_a", "upc_e", "code39", "code128"];

const ScanProductScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isResolving, setIsResolving] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastScannedValue, setLastScannedValue] = useState("");
  const [alertType, setAlertType] = useState("error");

  const resolveScannedProduct = async (value, format) => {
    const url = `${network.serverip}/products/resolve-scan?value=${encodeURIComponent(value)}&format=${encodeURIComponent(format || "")}`;
    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  };

  const handleBarcodeScanned = async (result) => {
    if (scanLocked || isResolving) {
      return;
    }

    const scannedValue = result?.data?.trim?.() ? result.data.trim() : "";
    const scanFormat = result?.type || "";

    if (!scannedValue) {
      setErrorMessage("Scanned code is empty");
      setAlertType("error");
      return;
    }

    if (!isSupportedScanType(scanFormat)) {
      setErrorMessage("Scanned code is not an approved product identifier");
      setAlertType("error");
      setLastScannedValue(scannedValue);
      return;
    }

    setScanLocked(true);
    setIsResolving(true);
    setErrorMessage("");
    setLastScannedValue(scannedValue);

    try {
      const product = await resolveScannedProduct(scannedValue, scanFormat);
      navigation.navigate("productdetail", { product });
    } catch (error) {
      const message = error.message || "Could not look up this code. Check your connection and try again.";
      if (message === "No product found for this code") {
        setErrorMessage(message);
      } else if (message.includes("Network request failed") || message.includes("Failed to fetch")) {
        setErrorMessage("Could not look up this code. Check your connection and try again.");
      } else {
        setErrorMessage(message);
      }
      setAlertType("error");
      setScanLocked(false);
    } finally {
      setIsResolving(false);
    }
  };

  const handleRetry = () => {
    setErrorMessage("");
    setLastScannedValue("");
    setScanLocked(false);
    setIsResolving(false);
    setAlertType("error");
  };

  const handleManualSearch = () => {
    navigation.goBack();
  };

  const handleBrowseCategories = () => {
    navigation.navigate("categories");
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const renderPermissionState = () => {
    if (!permission) {
      return (
        <View style={styles.centeredState} testID="scan-permission-loading">
          <Text style={styles.stateText}>Preparing camera...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centeredState} testID="scan-permission-denied">
          <Text style={styles.stateText}>
            EasyBuy uses the camera only to read product barcodes and QR codes.
          </Text>
          {permission.canAskAgain ? (
            <CustomButton
              text="Enable Camera"
              onPress={requestPermission}
              testID="scan-enable-camera-btn"
            />
          ) : (
            <CustomButton
              text="Open Settings"
              onPress={handleOpenSettings}
              testID="scan-open-settings-btn"
            />
          )}
          <CustomButton
            text="Back to Home"
            onPress={handleManualSearch}
            testID="scan-back-home-btn"
          />
        </View>
      );
    }

    return null;
  };

  const showRecoveryActions = Boolean(errorMessage);

  return (
    <View style={styles.container} testID="scan-product-screen">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleManualSearch} testID="scan-back-btn">
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Scan Product</Text>
        <View style={styles.topBarSpacer} />
      </View>

      {renderPermissionState()}

      {permission?.granted && !showRecoveryActions && (
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
            onBarcodeScanned={scanLocked || isResolving ? undefined : handleBarcodeScanned}
            testID="scan-camera-view"
          />
          <View style={styles.overlay}>
            <View style={styles.viewfinder} testID="scan-viewfinder" />
            <Text style={styles.instructionText}>
              Align a product barcode or QR code inside the frame
            </Text>
            {isResolving && (
              <Text style={styles.resolvingText} testID="scan-resolving-text">
                Looking up product...
              </Text>
            )}
          </View>
        </View>
      )}

      {showRecoveryActions && (
        <View style={styles.recoveryContainer} testID="scan-recovery-container">
          <CustomAlert message={errorMessage} type={alertType} testID="scan-alert" />
          {lastScannedValue ? (
            <Text style={styles.scannedValueText} testID="scan-last-value">
              Scanned code: {lastScannedValue}
            </Text>
          ) : null}
          <CustomButton text="Retry Scan" onPress={handleRetry} testID="scan-retry-btn" />
          <CustomButton
            text="Search Manually"
            onPress={handleManualSearch}
            testID="scan-manual-search-btn"
          />
          <CustomButton
            text="Browse Categories"
            onPress={handleBrowseCategories}
            testID="scan-browse-categories-btn"
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.dark,
  },
  topBarTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  topBarSpacer: {
    width: 30,
  },
  centeredState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.light,
  },
  stateText: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 20,
  },
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  viewfinder: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  instructionText: {
    marginTop: 24,
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
  },
  resolvingText: {
    marginTop: 16,
    color: colors.primary_light,
    fontSize: 16,
    fontWeight: "600",
  },
  recoveryContainer: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 20,
    justifyContent: "center",
  },
  scannedValueText: {
    marginBottom: 12,
    color: colors.muted,
    textAlign: "center",
  },
});
