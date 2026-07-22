import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";

const ProductScanNotFoundScreen = ({ navigation, route }) => {
  const code = route?.params?.code || "";
  const message =
    route?.params?.message || "No product found for this code";

  const handleScanAgain = () => {
    navigation.replace("productscanner");
  };

  const handleSearchManually = () => {
    navigation.navigate("tab");
  };

  const handleBrowseCategories = () => {
    navigation.navigate("categories");
  };

  return (
    <View style={styles.container} testID="product-scan-not-found-screen">
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        testID="product-scan-not-found-back-btn"
      >
        <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title} testID="product-scan-not-found-title">
          Product not found
        </Text>
        <Text style={styles.message} testID="product-scan-not-found-message">
          {message}
        </Text>
        {code ? (
          <Text style={styles.codeLabel} testID="product-scan-not-found-code-label">
            Scanned code
          </Text>
        ) : null}
        {code ? (
          <Text style={styles.codeValue} testID="product-scan-not-found-code">
            {code}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <CustomButton
            text="Scan again"
            onPress={handleScanAgain}
            testID="product-scan-not-found-scan-again-btn"
          />
          <CustomButton
            text="Search manually"
            onPress={handleSearchManually}
            testID="product-scan-not-found-search-btn"
          />
          <CustomButton
            text="Browse categories"
            onPress={handleBrowseCategories}
            testID="product-scan-not-found-browse-btn"
          />
        </View>
      </View>
    </View>
  );
};

export default ProductScanNotFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 24,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: 12,
  },
});
