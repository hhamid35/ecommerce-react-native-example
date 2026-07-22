import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
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
];

const ScanProductScreen = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isResolving, setIsResolving] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resultReason, setResultReason] = useState("");

  const handleBarcodeScanned = async ({ type, data }) => {
    if (hasScanned || isResolving) {
      return;
    }

    setHasScanned(true);
    setIsResolving(true);
    setErrorMessage("");
    setResultReason("");

    try {
      const result = await api.resolveProductByCode(data, type);

      if (result.success) {
        navigation.navigate("productdetail", { product: result.product });
        return;
      }

      setResultReason(result.reason);
      setErrorMessage(result.message);
    } catch (error) {
      setResultReason("lookup-failed");
      setErrorMessage("We could not check the catalog. Please try again.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleScanAgain = () => {
    setErrorMessage("");
    setResultReason("");
    setHasScanned(false);
  };

  const handleSearchManually = () => {
    navigation.goBack();
  };

  const handleBrowseCategories = () => {
    const user = route.params?.user;
    const parent = navigation.getParent();

    if (parent) {
      parent.navigate("tab", {
        screen: "categories",
        params: user ? { user } : undefined,
      });
      return;
    }

    navigation.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const showRecoveryActions = Boolean(errorMessage);

  if (!permission) {
    return (
      <View style={styles.centeredContainer} testID="scan-product-screen">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading camera...</Text>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          testID="scan-product-back-btn"
        >
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container} testID="scan-product-screen">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} testID="scan-product-back-btn">
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Camera access is needed to scan products.</Text>
          <Text style={styles.subtitle}>
            EasyBuy uses your camera to read barcodes and QR codes so you can find
            products quickly.
          </Text>
          {!permission.canAskAgain && (
            <Text style={styles.subtitle}>
              Enable camera access in your device settings, or use search and
              browse instead.
            </Text>
          )}
          {permission.canAskAgain && (
            <CustomButton
              text="Allow camera access"
              onPress={requestPermission}
              testID="scan-product-permission-btn"
            />
          )}
          <CustomButton
            text="Search manually"
            onPress={handleSearchManually}
            testID="scan-product-search-btn"
          />
          <CustomButton
            text="Browse categories"
            onPress={handleBrowseCategories}
            testID="scan-product-browse-btn"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="scan-product-screen">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} testID="scan-product-back-btn">
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.light}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          onBarcodeScanned={
            hasScanned || isResolving ? undefined : handleBarcodeScanned
          }
          testID="scan-product-camera"
        />
        <View style={styles.overlay}>
          <Text style={styles.instructionText}>
            Align the barcode or QR code inside the frame
          </Text>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <View style={styles.footer}>
        {isResolving && (
          <Text style={styles.resolvingText}>Checking the catalog...</Text>
        )}

        <CustomAlert
          message={errorMessage}
          type="error"
          testID="scan-product-alert"
        />

        {showRecoveryActions && (
          <View style={styles.recoveryActions}>
            <CustomButton
              text="Scan again"
              onPress={handleScanAgain}
              testID="scan-product-again-btn"
            />
            <CustomButton
              text="Search manually"
              onPress={handleSearchManually}
              testID="scan-product-search-btn"
            />
            <CustomButton
              text="Browse categories"
              onPress={handleBrowseCategories}
              testID="scan-product-browse-btn"
            />
          </View>
        )}

        {resultReason === "duplicate-match" && (
          <Text style={styles.hintText}>
            Try searching manually to find the right product.
          </Text>
        )}
      </View>
    </View>
  );
};

export default ScanProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    marginTop: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.light,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.muted,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.muted,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  instructionText: {
    position: "absolute",
    top: 100,
    color: colors.light,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  scanFrame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  footer: {
    backgroundColor: colors.light,
    padding: 20,
    paddingBottom: 30,
  },
  resolvingText: {
    textAlign: "center",
    color: colors.muted,
    marginBottom: 10,
    fontSize: 15,
  },
  recoveryActions: {
    marginTop: 10,
  },
  hintText: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 8,
    fontSize: 14,
  },
});
