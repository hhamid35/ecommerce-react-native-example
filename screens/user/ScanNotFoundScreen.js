import React from "react";
import { View, Text, StyleSheet, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";

const ScanNotFoundScreen = ({ navigation, route }) => {
  const { scannedCode } = route.params;

  const handleScanAgain = () => {
    navigation.replace("scan");
  };

  const handleSearchProducts = () => {
    navigation.navigate("tab", { screen: "home" });
    navigation.goBack();
  };

  const handleBrowseCategories = () => {
    navigation.navigate("categories", {});
  };

  return (
    <View style={styles.container} testID="scan-not-found-screen">
      <StatusBar />
      <View style={styles.content}>
        <Ionicons
          name="barcode-outline"
          size={64}
          color={colors.muted}
          testID="scan-not-found-icon"
        />
        <Text style={styles.title} testID="scan-not-found-title">
          Product not found
        </Text>
        <Text style={styles.body} testID="scan-not-found-body">
          We couldn&apos;t find a product matching code{" "}
          <Text style={styles.codeText}>{scannedCode}</Text> in our catalog.
        </Text>
        <View style={styles.actions}>
          <CustomButton
            text="Scan again"
            onPress={handleScanAgain}
            testID="scan-not-found-rescan-btn"
          />
          <CustomButton
            text="Search products"
            onPress={handleSearchProducts}
            testID="scan-not-found-search-btn"
          />
          <CustomButton
            text="Browse categories"
            onPress={handleBrowseCategories}
            testID="scan-not-found-categories-btn"
          />
        </View>
      </View>
    </View>
  );
};

export default ScanNotFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontWeight: "bold",
    color: colors.dark,
  },
  actions: {
    width: "100%",
  },
});
