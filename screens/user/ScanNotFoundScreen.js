import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";

const ScanNotFoundScreen = ({ navigation, route }) => {
  const scannedCode = route.params?.scannedCode || "";

  const handleScanAgain = () => {
    navigation.replace("scan");
  };

  const handleSearch = () => {
    navigation.navigate("tab", {
      screen: "home",
      params: { prefillSearch: scannedCode },
    });
  };

  const handleBrowseCategories = () => {
    navigation.navigate("tab", { screen: "categories" });
  };

  return (
    <View style={styles.container} testID="scan-not-found-screen">
      <Text style={styles.title} testID="scan-not-found-title">
        Product not found
      </Text>
      <Text style={styles.body} testID="scan-not-found-body">
        We couldn't find a product for code{" "}
        <Text style={styles.code}>{scannedCode}</Text>.
      </Text>
      <View style={styles.actions}>
        <CustomButton
          text="Scan again"
          onPress={handleScanAgain}
          testID="scan-not-found-rescan-btn"
        />
        <CustomButton
          text="Search"
          onPress={handleSearch}
          testID="scan-not-found-search-btn"
        />
        <CustomButton
          text="Browse categories"
          onPress={handleBrowseCategories}
          testID="scan-not-found-categories-btn"
        />
      </View>
    </View>
  );
};

export default ScanNotFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 16,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24,
  },
  code: {
    fontWeight: "bold",
    color: colors.dark,
  },
  actions: {
    width: "100%",
  },
});
