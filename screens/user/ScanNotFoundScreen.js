import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton/CustomButton";

const ScanNotFoundScreen = ({ navigation, route }) => {
  const { scannedCode } = route.params || {};

  const handleScanAgain = () => {
    navigation.replace("scan");
  };

  const handleSearchManually = () => {
    navigation.navigate("tab", { screen: "home" });
    navigation.goBack();
  };

  const handleBrowseCategories = () => {
    navigation.navigate("tab", { screen: "categories" });
  };

  return (
    <View style={styles.container} testID="scan-not-found-screen">
      <Text style={styles.title}>Product not found</Text>
      <Text style={styles.body}>
        We couldn&apos;t find a product matching{" "}
        <Text style={styles.code} testID="scan-not-found-code">
          {scannedCode}
        </Text>{" "}
        in our catalog.
      </Text>
      <View style={styles.actions}>
        <CustomButton
          text="Scan again"
          onPress={handleScanAgain}
          testID="scan-again-btn"
        />
        <CustomButton
          text="Search manually"
          onPress={handleSearchManually}
          testID="search-manually-btn"
        />
        <CustomButton
          text="Browse categories"
          onPress={handleBrowseCategories}
          testID="browse-categories-btn"
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
    color: colors.danger,
    marginBottom: 16,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: colors.dark,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  code: {
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  actions: {
    width: "100%",
  },
});
