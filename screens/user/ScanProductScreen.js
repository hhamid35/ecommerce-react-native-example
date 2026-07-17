import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import CustomButton from "../../components/CustomButton";

const BARCODE_TYPES = [
  "qr",
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
  "pdf417",
];

const ScanProductScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState("loading");
  const [hasScanned, setHasScanned] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [scanError, setScanError] = useState("");
  const [notFoundCode, setNotFoundCode] = useState("");
  const [lastCodeType, setLastCodeType] = useState("");

  const requestCameraPermission = useCallback(async () => {
    setPermissionStatus("loading");
    try {
      const result = await requestPermission();
      if (!result) {
        setPermissionStatus("unavailable");
        return;
      }
      if (result.granted) {
        setPermissionStatus("granted");
      } else if (result.canAskAgain === false) {
        setPermissionStatus("denied");
      } else {
        setPermissionStatus("denied");
      }
    } catch (error) {
      setPermissionStatus("unavailable");
      console.log("camera permission error", error);
    }
  }, [requestPermission]);

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  const resolveScannedProduct = async (code, codeType) => {
    setIsResolving(true);
    setScanError("");
    setNotFoundCode("");

    try {
      const response = await fetch(
        `${network.serverip}/products/resolve?code=${encodeURIComponent(code)}&type=${encodeURIComponent(codeType || "")}`
      );
      const result = await response.json();

      if (response.status === 200 && result.success) {
        navigation.navigate("productdetail", { product: result.data });
        return;
      }

      if (response.status === 404) {
        setNotFoundCode(code);
        return;
      }

      if (response.status === 400 || response.status === 409) {
        setScanError(result.message || "We could not look up this code.");
        return;
      }

      setScanError(
        result.message ||
          "We could not look up this code. Check your connection and try again."
      );
    } catch (error) {
      setScanError(
        "We could not look up this code. Check your connection and try again."
      );
      console.log("scan lookup error", error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleBarcodeScanned = async ({ type, data }) => {
    if (!data || hasScanned || isResolving) {
      return;
    }

    setHasScanned(true);
    setLastCodeType(type || "");
    await resolveScannedProduct(data, type);
  };

  const handleRetry = () => {
    setScanError("");
    setNotFoundCode("");
    setHasScanned(false);
    setLastCodeType("");
  };

  const handleSearchInstead = () => {
    navigation.goBack();
  };

  const handleBrowseCategories = () => {
    navigation.navigate("categories");
  };

  const canScan = permissionStatus === "granted" && !hasScanned && !isResolving;

  const renderPermissionState = () => {
    if (permissionStatus === "loading" || !permission) {
      return (
        <View style={styles.centeredContent} testID="scan-product-loading">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.messageText}>Preparing camera...</Text>
        </View>
      );
    }

    if (permissionStatus === "denied" || permissionStatus === "unavailable") {
      return (
        <View
          style={styles.centeredContent}
          testID="scan-product-permission-denied"
        >
          <Text style={styles.titleText}>
            EasyBuy needs camera access to scan product barcodes and QR codes.
          </Text>
          <CustomButton
            text="Try Again"
            onPress={requestCameraPermission}
            testID="scan-product-retry-btn"
          />
          <View style={styles.buttonSpacer} />
          <CustomButton
            text="Search Instead"
            onPress={handleSearchInstead}
            testID="scan-product-search-btn"
          />
        </View>
      );
    }

    return null;
  };

  const renderRecoveryState = () => {
    if (notFoundCode) {
      return (
        <View style={styles.recoveryOverlay} testID="scan-product-not-found">
          <Text style={styles.titleText}>
            We could not find this product in EasyBuy.
          </Text>
          <Text style={styles.messageText}>
            Scanned code: {notFoundCode}
            {lastCodeType ? ` (${lastCodeType})` : ""}
          </Text>
          <Text style={styles.messageText}>
            Try scanning again, search by product name, or browse categories.
          </Text>
          <CustomButton
            text="Scan Again"
            onPress={handleRetry}
            testID="scan-product-retry-btn"
          />
          <View style={styles.buttonSpacer} />
          <CustomButton
            text="Search Instead"
            onPress={handleSearchInstead}
            testID="scan-product-search-btn"
          />
          <View style={styles.buttonSpacer} />
          <CustomButton
            text="Browse Categories"
            onPress={handleBrowseCategories}
            testID="scan-product-browse-btn"
          />
        </View>
      );
    }

    if (scanError) {
      return (
        <View style={styles.recoveryOverlay}>
          <Text style={styles.titleText}>{scanError}</Text>
          <CustomButton
            text="Scan Again"
            onPress={handleRetry}
            testID="scan-product-retry-btn"
          />
          <View style={styles.buttonSpacer} />
          <CustomButton
            text="Search Instead"
            onPress={handleSearchInstead}
            testID="scan-product-search-btn"
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container} testID="scan-product-screen">
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          testID="scan-product-back-btn"
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>

      {permissionStatus === "granted" && !notFoundCode && !scanError ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
            onBarcodeScanned={canScan ? handleBarcodeScanned : undefined}
            testID="scan-product-camera"
          />
          <View style={styles.scanOverlay}>
            <Text style={styles.overlayText}>
              Align barcode or QR code inside the frame
            </Text>
            {isResolving ? (
              <View style={styles.resolvingContainer}>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.overlayText}>Looking up product...</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        renderPermissionState()
      )}

      {renderRecoveryState()}
    </View>
  );
};

export default ScanProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 2,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  overlayText: {
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  resolvingContainer: {
    marginTop: 12,
    alignItems: "center",
    gap: 8,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  recoveryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.light,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
    textAlign: "center",
    marginBottom: 12,
  },
  messageText: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonSpacer: {
    height: 10,
  },
});
