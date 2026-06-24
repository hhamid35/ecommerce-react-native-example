import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";

const ScanNotFoundScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { scannedCode = "", products = [], user } = route.params || {};

  const handleScanAgain = () => {
    navigation.replace("scan", { products, user });
  };

  const handleSearchInstead = () => {
    navigation.navigate("tab", { screen: "home", params: { user } });
  };

  const handleBrowseCategories = () => {
    navigation.navigate("tab", { screen: "categories", params: { user } });
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 24 }]}
      testID="scan-not-found-screen"
    >
      <Text style={styles.title}>Product not found</Text>
      <Text style={styles.body} testID="scan-not-found-code">
        We read code "{scannedCode}" but it doesn't match any product in our
        catalog.
      </Text>
      <View style={styles.actions}>
        <CustomButton
          text="Scan again"
          onPress={handleScanAgain}
          testID="scan-again-btn"
        />
        <CustomButton
          text="Search by name"
          onPress={handleSearchInstead}
          testID="search-instead-btn"
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
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
    marginBottom: 32,
  },
  actions: {
    width: "100%",
  },
});
