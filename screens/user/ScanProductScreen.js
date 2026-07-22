import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import * as api from "../../api";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";

const BARCODE_TYPES = [
  "qr",
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
  "code39",
  "pdf417",
];

const truncateCode = (value) => {
  if (!value) {
    return "";
  }
  return value.length > 32 ? `${value.slice(0, 32)}...` : value;
};

const ScanProductScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [lastCode, setLastCode] = useState("");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  useEffect(() => {
    console.log({ event: "scan_product_started" });
  }, []);

  const resetScan = useCallback(() => {
    setError("");
    setLastCode("");
    setScanned(false);
    setIsResolving(false);
    setAlertType("error");
  }, []);

  const navigateToProduct = useCallback(
    (product) => {
      navigation.replace("productdetail", { product });
    },
    [navigation]
  );

  const showNotFound = useCallback((result) => {
    setLastCode(result.scannedCode || "");
    setError("No product found for this code.");
    setAlertType("error");
    console.log({
      event: "scan_product_not_found",
      outcome: result.code,
      codeLength: (result.scannedCode || "").length,
    });
  }, []);

  const handleManualSearch = useCallback(() => {
    navigation.navigate("categories", { categoryID: null });
  }, [navigation]);

  const handleBackHome = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("tab");
  }, [navigation]);

  const handleBarCodeScanned = useCallback(
    async (event) => {
      if (scanned || isResolving) {
        return;
      }

      setScanned(true);
      setIsResolving(true);
      setError("");
      const startedAt = Date.now();

      const result = await api.resolveScannedProduct(event.data);
      const durationMs = Date.now() - startedAt;

      setIsResolving(false);

      if (result.success) {
        console.log({
          event: "scan_product_resolved",
          outcome: "success",
          barcodeType: event.type,
          matchedBy: result.match?.field,
          codeLength: (result.scannedCode || "").length,
          durationMs,
        });
        navigateToProduct(result.data);
        return;
      }

      if (result.code === "PRODUCT_SCAN_NOT_FOUND") {
        showNotFound(result);
        return;
      }

      if (result.code === "PRODUCT_SCAN_AMBIGUOUS") {
        setLastCode(result.scannedCode || "");
        setError("Multiple products match this code.");
        setAlertType("error");
        console.log({
          event: "scan_product_ambiguous",
          outcome: result.code,
          barcodeType: event.type,
          codeLength: (result.scannedCode || "").length,
          durationMs,
        });
        return;
      }

      if (result.code === "SCAN_CATALOG_UNAVAILABLE") {
        setError(result.message || "Unable to check the catalog right now");
        setAlertType("error");
        console.log({
          event: "scan_product_catalog_unavailable",
          outcome: result.code,
          barcodeType: event.type,
          codeLength: (event.data || "").length,
          durationMs,
        });
        return;
      }

      setError(result.message || "Unable to scan this code. Please try again.");
      setAlertType("error");
      console.log({
        event: "scan_product_resolved",
        outcome: result.code,
        barcodeType: event.type,
        codeLength: (event.data || "").length,
        durationMs,
      });
    },
    [isResolving, navigateToProduct, scanned, showNotFound]
  );

  const renderRecoveryActions = () => (
    <View style={styles.actionsContainer}>
      {error ? (
        <CustomButton
          text="Try Again"
          onPress={resetScan}
          testID="scan-product-retry-btn"
        />
      ) : null}
      <CustomButton
        text="Search Manually"
        onPress={handleManualSearch}
        testID="scan-product-manual-search-btn"
      />
      <CustomButton
        text="Back Home"
        onPress={handleBackHome}
        testID="scan-product-home-btn"
      />
    </View>
  );

  if (!permission) {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <StatusBar />
        <Text style={styles.messageText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <StatusBar />
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBackHome}
            testID="scan-product-back-btn"
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.messageText}>
            Camera access is needed to scan product codes. You can still search
            manually.
          </Text>
          <CustomButton
            text="Enable Camera"
            onPress={() => {
              requestPermission().then((response) => {
                if (!response?.granted) {
                  console.log({ event: "scan_product_permission_denied" });
                }
              });
            }}
            testID="scan-product-permission-btn"
          />
          {renderRecoveryActions()}
        </View>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <StatusBar />
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBackHome}
            testID="scan-product-back-btn"
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.messageText}>
            Camera scanning is not available in this preview. You can still search
            manually.
          </Text>
          {renderRecoveryActions()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="scan-product-screen">
      <StatusBar />
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleBackHome}
          testID="scan-product-back-btn"
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.light}
          />
        </TouchableOpacity>
      </View>

      {!scanned ? (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          onBarcodeScanned={handleBarCodeScanned}
          testID="scan-product-camera"
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.helperText}>
              Align a barcode or QR code inside the frame
            </Text>
          </View>
        </CameraView>
      ) : (
        <View style={styles.resultContainer}>
          {isResolving ? (
            <Text style={styles.messageText} testID="scan-product-loading">
              Checking catalog...
            </Text>
          ) : (
            <>
              <CustomAlert
                message={error}
                type={alertType}
                testID="scan-product-alert"
              />
              {lastCode ? (
                <Text style={styles.scannedCodeText}>
                  Scanned code: {truncateCode(lastCode)}
                </Text>
              ) : null}
              {renderRecoveryActions()}
            </>
          )}
        </View>
      )}
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
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  helperText: {
    marginTop: 20,
    color: colors.light,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  messageText: {
    color: colors.muted,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  scannedCodeText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  actionsContainer: {
    width: "100%",
    marginTop: 10,
  },
});
