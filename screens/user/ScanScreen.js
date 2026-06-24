import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants";
import {
  SCAN_BARCODE_TYPES,
  SCAN_DEBOUNCE_MS,
  CAMERA_PERMISSION_RATIONALE,
} from "../../constants/ScanConfig";
import { requestCameraPermission } from "../../utils/cameraPermissions";
import { resolveProductByScanCode } from "../../utils/productScanResolver";
import CustomButton from "../../components/CustomButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIEWFINDER_WIDTH = SCREEN_WIDTH * 0.7;
const VIEWFINDER_HEIGHT = SCREEN_WIDTH * 0.3;

const ScanScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { products = [], user } = route.params || {};
  const [permissionGranted, setPermissionGranted] = useState(null);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState("");
  const lastScannedAt = useRef(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await requestCameraPermission();
      console.log("scan_permission_result", {
        granted: result.granted,
        status: result.status,
      });
      if (mounted) {
        setPermissionGranted(result.granted);
        setPermissionChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBarcodeScanned = useCallback(
    ({ data }) => {
      if (!isScanning) return;
      const now = Date.now();
      if (now - lastScannedAt.current < SCAN_DEBOUNCE_MS) return;
      lastScannedAt.current = now;
      setIsScanning(false);

      const result = resolveProductByScanCode(data, products);
      console.log("scan_resolve_result", {
        status: result.status,
        codeLength: data ? String(data).length : 0,
      });

      if (result.status === "found") {
        navigation.replace("productdetail", { product: result.product });
        return;
      }
      if (result.status === "not_found") {
        navigation.navigate("scannotfound", {
          scannedCode: result.scannedCode,
          products,
          user,
        });
        return;
      }
      if (result.status === "catalog_unavailable") {
        setError(
          "Unable to look up products. Check your connection and try again."
        );
        setIsScanning(true);
        return;
      }
      setIsScanning(true);
    },
    [isScanning, navigation, products, user]
  );

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  if (!permissionChecked) {
    return (
      <View style={styles.container} testID="scan-screen">
        <Text style={styles.hintText}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permissionGranted) {
    return (
      <View style={styles.container} testID="scan-screen">
        <View
          style={[styles.permissionCard, { paddingTop: insets.top + 20 }]}
          testID="scan-permission-denied"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            testID="scan-back-btn"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionBody}>{CAMERA_PERMISSION_RATIONALE}</Text>
          <CustomButton
            text="Open Settings"
            onPress={handleOpenSettings}
            testID="scan-open-settings-btn"
          />
          <CustomButton
            text="Search instead"
            onPress={() => navigation.goBack()}
            testID="scan-search-instead-btn"
          />
        </View>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.container} testID="scan-screen">
        <View style={[styles.permissionCard, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            testID="scan-back-btn"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.permissionTitle}>Products couldn't be loaded</Text>
          <Text style={styles.permissionBody}>
            Load products before scanning. Go back and try again.
          </Text>
          <CustomButton
            text="Go back"
            onPress={() => navigation.goBack()}
            testID="scan-go-back-btn"
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
        barcodeScannerSettings={{ barcodeTypes: SCAN_BARCODE_TYPES }}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
        testID="scan-camera-view"
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButtonDark}
            onPress={() => navigation.goBack()}
            testID="scan-back-btn"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Product</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder} />
        </View>

        <Text style={styles.hintText}>
          Point camera at barcode or QR code
        </Text>

        {error !== "" && (
          <Text style={styles.errorText} testID="scan-error-text">
            {error}
          </Text>
        )}
      </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  topBarSpacer: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  backButtonDark: {
    padding: 8,
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  viewfinder: {
    width: VIEWFINDER_WIDTH,
    height: VIEWFINDER_HEIGHT,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  hintText: {
    textAlign: "center",
    color: colors.white,
    fontSize: 16,
    paddingBottom: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingTop: 16,
  },
  errorText: {
    textAlign: "center",
    color: colors.danger,
    fontSize: 14,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  permissionCard: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.light,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.dark,
    marginTop: 24,
    marginBottom: 12,
  },
  permissionBody: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 24,
    lineHeight: 22,
  },
});
