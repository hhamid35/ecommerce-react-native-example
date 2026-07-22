import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import * as api from "../../api";
import ScanResultState from "../../components/Scan/ScanResultState";

const BARCODE_TYPES = [
  "qr",
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code39",
  "code93",
  "code128",
  "itf14",
  "pdf417",
];

const ScanProductScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lastCode, setLastCode] = useState("");
  const [recoveryState, setRecoveryState] = useState(null);

  const permissionStatus =
    permission == null
      ? "unknown"
      : permission.granted
        ? "granted"
        : "denied";

  const requestCameraPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    requestCameraPermission();
  }, [requestCameraPermission]);

  const resetScanner = () => {
    setHasScanned(false);
    setIsResolving(false);
    setScanError("");
    setRecoveryState(null);
  };

  const goToManualSearch = () => {
    navigation.navigate("tab");
  };

  const goToHome = () => {
    navigation.navigate("tab");
  };

  const resolveCode = async (rawCode) => {
    const code = String(rawCode || "").trim();
    if (!code) {
      setScanError("A scanned code is required");
      setRecoveryState("not_found");
      return;
    }

    setIsResolving(true);
    setScanError("");

    try {
      const result = await api.resolveScannedProduct(code);

      if (result?.success && result?.data) {
        navigation.navigate("productdetail", {
          product: result.data,
          scan: { code, matchedField: result.matchedField },
        });
        return;
      }

      if (result?.code === "PRODUCT_SCAN_NOT_FOUND") {
        setScanError("We could not find a product for that code");
        setRecoveryState("not_found");
        return;
      }

      if (result?.code === "PRODUCT_SCAN_DUPLICATE") {
        setScanError("Multiple products share this scanned code");
        setRecoveryState("duplicate");
        return;
      }

      setScanError(result?.message || "We could not find a product for that code");
      setRecoveryState("not_found");
    } catch (error) {
      setScanError("We could not check the catalog right now");
      setRecoveryState("network");
    } finally {
      setIsResolving(false);
    }
  };

  const handleBarcodeScanned = async (event) => {
    if (hasScanned || isResolving) {
      return;
    }

    setHasScanned(true);
    setLastCode(event.data);
    await resolveCode(event.data);
  };

  if (permissionStatus === "unknown") {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} testID="scan-product-back-btn">
            <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <ScanResultState
          testID="scan-product-permission-denied"
          title="Camera access needed"
          message="EasyBuy uses the camera only to read product codes. You can search manually instead."
          primaryLabel="Try again"
          onPrimaryPress={requestCameraPermission}
          secondaryLabel="Search manually"
          onSecondaryPress={goToManualSearch}
        />
      </View>
    );
  }

  if (recoveryState === "not_found") {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} testID="scan-product-back-btn">
            <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <ScanResultState
          testID="scan-product-not-found"
          title="Product not found"
          message={scanError || "We could not find a product for that code"}
          primaryLabel="Try scanning again"
          onPrimaryPress={resetScanner}
          secondaryLabel="Search manually"
          onSecondaryPress={goToManualSearch}
          tertiaryLabel="Back to home"
          onTertiaryPress={goToHome}
        />
      </View>
    );
  }

  if (recoveryState === "duplicate") {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} testID="scan-product-back-btn">
            <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <ScanResultState
          testID="scan-product-duplicate"
          title="Ambiguous scan result"
          message={scanError}
          primaryLabel="Try scanning again"
          onPrimaryPress={resetScanner}
          secondaryLabel="Search manually"
          onSecondaryPress={goToManualSearch}
        />
      </View>
    );
  }

  if (recoveryState === "network") {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} testID="scan-product-back-btn">
            <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
          </TouchableOpacity>
        </View>
        <ScanResultState
          testID="scan-product-network-error"
          title="Catalog unavailable"
          message={scanError}
          primaryLabel="Try scanning again"
          onPrimaryPress={resetScanner}
          secondaryLabel="Search manually"
          onSecondaryPress={goToManualSearch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="scan-product-screen">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} testID="scan-product-back-btn">
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan product</Text>
      </View>

      <Text style={styles.instructions}>
        EasyBuy uses the camera only to read product codes.
      </Text>
      <Text style={styles.frameHint}>
        Align the barcode or QR code inside the frame
      </Text>

      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          testID="scan-product-camera"
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          onBarcodeScanned={hasScanned || isResolving ? undefined : handleBarcodeScanned}
        />
        <View style={styles.scanFrame} pointerEvents="none" />
      </View>

      {isResolving ? (
        <View style={styles.resolvingOverlay} testID="scan-product-resolving">
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.resolvingText}>Looking up product...</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.manualSearchLink}
        onPress={goToManualSearch}
        testID="scan-product-manual-search-btn"
      >
        <Text style={styles.manualSearchText}>Search manually</Text>
      </TouchableOpacity>

      {lastCode ? (
        <Text style={styles.lastCodeText} testID="scan-product-last-code">
          Last code: {lastCode}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
  },
  instructions: {
    color: colors.light,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  frameHint: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: "absolute",
    top: "25%",
    left: "10%",
    right: "10%",
    bottom: "25%",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  resolvingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  resolvingText: {
    color: colors.white,
    marginTop: 12,
    fontSize: 16,
  },
  manualSearchLink: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 24,
  },
  manualSearchText: {
    color: colors.primary_light,
    fontSize: 16,
    fontWeight: "600",
  },
  lastCodeText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 12,
    marginBottom: 16,
  },
});

export default ScanProductScreen;
