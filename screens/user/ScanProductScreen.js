import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
import * as api from "../../api";

const BARCODE_TYPES = [
  "qr",
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
  "code39",
  "itf14",
];

const ScanProductScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isResolving, setIsResolving] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("scanning");

  const handleRetryScan = useCallback(() => {
    setError("");
    setLastScan(null);
    setMode("scanning");
    setScanLocked(false);
    setIsResolving(false);
  }, []);

  const handleManualSearch = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBrowseCategories = useCallback(() => {
    navigation.navigate("categories");
  }, [navigation]);

  const handleOpenSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (e) {
      setError("Unable to open settings on this device.");
    }
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const result = await requestPermission();
    if (!result?.granted) {
      setMode("permissionDenied");
    } else {
      setMode("scanning");
    }
  }, [requestPermission]);

  const handleBarcodeScanned = useCallback(
    async (event) => {
      if (scanLocked || isResolving) {
        return;
      }

      const trimmed = String(event.data || "").trim();
      if (!trimmed) {
        setError("Unreadable code. Please try again.");
        setScanLocked(false);
        return;
      }

      setScanLocked(true);
      setIsResolving(true);
      setError("");
      setLastScan({ data: trimmed, type: event.type });

      try {
        const result = await api.resolveScannedProduct(trimmed, event.type);

        if (result.success === true && result.data) {
          navigation.replace("productdetail", { product: result.data, source: "scan" });
          return;
        }

        if (
          result.status === 404 ||
          result.code === "PRODUCT_SCAN_NOT_FOUND"
        ) {
          setMode("notFound");
          return;
        }

        setMode("networkError");
      } catch (e) {
        setMode("networkError");
      } finally {
        setIsResolving(false);
      }
    },
    [scanLocked, isResolving, navigation]
  );

  if (!permission) {
    return (
      <View style={styles.centered} testID="scan-screen">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container} testID="scan-screen">
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="scan-back-btn"
          >
            <Ionicons name="arrow-back" size={28} color={colors.dark} />
          </TouchableOpacity>
        </View>
        <View style={styles.recoveryContainer} testID="scan-permission-denied">
          <Text style={styles.title}>Camera access needed</Text>
          <Text style={styles.message}>
            EasyBuy uses your camera only to scan product codes.
          </Text>
          <CustomButton
            text="Allow camera"
            onPress={handleRequestPermission}
            testID="scan-allow-camera-btn"
          />
          <CustomButton
            text="Open Settings"
            onPress={handleOpenSettings}
            testID="scan-open-settings-btn"
          />
          <CustomButton
            text="Search manually"
            onPress={handleManualSearch}
            testID="scan-manual-search-btn"
          />
        </View>
      </View>
    );
  }

  if (mode === "notFound") {
    return (
      <View style={styles.container} testID="scan-screen">
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="scan-back-btn"
          >
            <Ionicons name="arrow-back" size={28} color={colors.dark} />
          </TouchableOpacity>
        </View>
        <View style={styles.recoveryContainer} testID="scan-not-found">
          <Text style={styles.title}>Product not found</Text>
          <Text style={styles.message}>
            We couldn't find a product for this code.
          </Text>
          {lastScan?.data ? (
            <Text style={styles.scannedValue} testID="scan-last-value">
              Scanned: {lastScan.data}
            </Text>
          ) : null}
          <CustomButton
            text="Try Again"
            onPress={handleRetryScan}
            testID="scan-retry-btn"
          />
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
      </View>
    );
  }

  if (mode === "networkError") {
    return (
      <View style={styles.container} testID="scan-screen">
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="scan-back-btn"
          >
            <Ionicons name="arrow-back" size={28} color={colors.dark} />
          </TouchableOpacity>
        </View>
        <View style={styles.recoveryContainer} testID="scan-network-error">
          <Text style={styles.title}>Connection problem</Text>
          <Text style={styles.message}>
            We couldn't reach the catalog. Check your connection and try again.
          </Text>
          <CustomButton
            text="Try Again"
            onPress={handleRetryScan}
            testID="scan-retry-btn"
          />
          <CustomButton
            text="Search Manually"
            onPress={handleManualSearch}
            testID="scan-manual-search-btn"
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
        onBarcodeScanned={scanLocked || isResolving ? undefined : handleBarcodeScanned}
        testID="scan-camera"
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              testID="scan-back-btn"
            >
              <Ionicons name="arrow-back" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.instructionContainer}>
            <Text style={styles.instruction}>
              Scan a product barcode or QR code
            </Text>
          </View>
          {isResolving ? (
            <View style={styles.loadingContainer} testID="scan-loading">
              <ActivityIndicator size="large" color={colors.white} />
              <Text style={styles.loadingText}>Looking up product...</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </CameraView>
    </View>
  );
};

export default ScanProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.light,
  },
  instructionContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 48,
  },
  instruction: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  loadingContainer: {
    alignItems: "center",
    paddingBottom: 32,
  },
  loadingText: {
    color: colors.white,
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#ffcccc",
    textAlign: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  recoveryContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: colors.light,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 16,
    textAlign: "center",
  },
  scannedValue: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 24,
    textAlign: "center",
  },
});
