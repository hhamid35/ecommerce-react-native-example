import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import * as api from "../../api";

const BARCODE_TYPES = ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39"];

const ProductScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [lastCode, setLastCode] = useState("");

  const resetScanner = useCallback(() => {
    setScanned(false);
    setResolving(false);
    setMessage("");
    setLastCode("");
  }, []);

  const requestCameraAccess = useCallback(async () => {
    const result = await requestPermission();
    if (!result?.granted) {
      setAlertType("error");
      setMessage(
        "Camera access is needed to scan product barcodes and QR codes."
      );
    }
    return result;
  }, [requestPermission]);

  const handleResolveSuccess = useCallback(
    (product) => {
      navigation.replace("productdetail", { product });
    },
    [navigation]
  );

  const handleResolveFailure = useCallback(
    (result, code) => {
      setResolving(false);
      setScanned(true);

      if (result?.reason === "PRODUCT_NOT_FOUND") {
        navigation.replace("productscannotfound", {
          code,
          message: result.message,
        });
        return;
      }

      if (result?.reason === "DUPLICATE_SCAN_CODE") {
        setAlertType("error");
        setMessage("Multiple products share this scan code. Try searching instead.");
        return;
      }

      if (result?.reason === "INVALID_SCAN_CODE") {
        setAlertType("error");
        setMessage(result.message || "Scan code is required");
        return;
      }

      setAlertType("error");
      setMessage(result?.message || "Unable to resolve this scan code.");
    },
    [navigation]
  );

  const handleBarcodeScanned = useCallback(
    async (event) => {
      if (scanned || resolving) {
        return;
      }

      const code = event?.data;
      if (!code) {
        return;
      }

      setScanned(true);
      setResolving(true);
      setLastCode(code);
      setMessage("Finding product...");
      setAlertType("success");

      try {
        const result = await api.resolveProductByScanCode(code);
        if (result?.success && result?.data) {
          handleResolveSuccess(result.data);
          return;
        }
        handleResolveFailure(result, code);
      } catch (error) {
        setResolving(false);
        setScanned(true);
        setAlertType("error");
        setMessage(error?.message || "Network unavailable. Try again or search manually.");
      }
    },
    [handleResolveFailure, handleResolveSuccess, resolving, scanned]
  );

  const handleSearchManually = () => {
    navigation.navigate("tab");
  };

  const handleOpenSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
      return;
    }
    Linking.openSettings();
  };

  if (!permission) {
    return (
      <View style={styles.centered} testID="product-scanner-loading">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer} testID="product-scanner-permission-denied">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          testID="product-scanner-back-btn"
        >
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          EasyBuy uses the camera to scan product barcodes and QR codes.
        </Text>
        <CustomAlert
          message={message || "Camera access is needed to scan product barcodes and QR codes."}
          type="error"
          testID="product-scanner-permission-alert"
        />
        <View style={styles.permissionActions}>
          <CustomButton
            text="Try again"
            onPress={requestCameraAccess}
            testID="product-scanner-try-again-btn"
          />
          <CustomButton
            text="Search manually"
            onPress={handleSearchManually}
            testID="product-scanner-search-manually-btn"
          />
          <CustomButton
            text="Open settings"
            onPress={handleOpenSettings}
            testID="product-scanner-open-settings-btn"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="product-scanner-screen">
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        testID="product-scanner-camera"
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            testID="product-scanner-back-btn"
          >
            <Ionicons name="arrow-back-circle-outline" size={30} color={colors.white} />
          </TouchableOpacity>

          <Text style={styles.instructionText} testID="product-scanner-instruction">
            Align a barcode or QR code inside the frame
          </Text>

          <View style={styles.scanFrame} testID="product-scanner-frame" />

          {resolving ? (
            <View style={styles.resolvingContainer} testID="product-scanner-resolving">
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.resolvingText}>Finding product...</Text>
            </View>
          ) : null}

          {message && !resolving ? (
            <CustomAlert message={message} type={alertType} testID="product-scanner-alert" />
          ) : null}

          {scanned && !resolving ? (
            <View style={styles.retryContainer}>
              <CustomButton
                text="Scan again"
                onPress={resetScanner}
                testID="product-scanner-scan-again-btn"
              />
              <CustomButton
                text="Search manually"
                onPress={handleSearchManually}
                testID="product-scanner-search-manually-btn"
              />
            </View>
          ) : null}
        </View>
      </CameraView>
    </View>
  );
};

export default ProductScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
    justifyContent: "space-between",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.light,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 20,
    justifyContent: "center",
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionActions: {
    gap: 12,
    marginTop: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: 20,
  },
  instructionText: {
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  scanFrame: {
    alignSelf: "center",
    width: "75%",
    height: 220,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  resolvingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resolvingText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  retryContainer: {
    gap: 12,
    marginBottom: 20,
  },
});
