import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors, network } from "../../constants";
import ProductCard from "../../components/ProductCard";
import CustomButton from "../../components/CustomButton/CustomButton";

const ScanMatchesScreen = ({ navigation, route }) => {
  const { matches = [], scannedCode } = route.params || {};

  // Degenerate case: a 'multiple' result arrived with no usable matches —
  // fall back to the existing not-found experience rather than show an empty list.
  useEffect(() => {
    if (!matches || matches.length === 0) {
      navigation.replace("scannotfound", { scannedCode });
    }
  }, [matches, scannedCode, navigation]);

  const onSelect = (product) => {
    navigation.navigate("productdetail", { product });
  };

  const handleScanAgain = () => {
    navigation.replace("scan");
  };

  const handleSearchManually = () => {
    navigation.navigate("tab", { screen: "home" });
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <ProductCard
        name={item.title}
        price={item.price}
        image={`${network.serverip}/uploads/${item.image}`}
        quantity={item.quantity}
        cardSize="large"
        onPress={() => onSelect(item)}
        onPressSecondary={() => onSelect(item)}
        testID={`scan-match-${item._id}`}
      />
    </View>
  );

  return (
    <View style={styles.container} testID="scan-matches-screen">
      <Text style={styles.title}>More than one match</Text>
      <Text style={styles.body}>
        More than one product matches{" "}
        <Text style={styles.code} testID="scan-matches-code">
          {scannedCode}
        </Text>
        . Pick the one you scanned.
      </Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        testID="scan-matches-list"
      />
      <View style={styles.actions}>
        <CustomButton
          text="Scan again"
          onPress={handleScanAgain}
          testID="scan-matches-scan-again-btn"
        />
        <CustomButton
          text="Search manually"
          onPress={handleSearchManually}
          testID="scan-matches-search-btn"
        />
      </View>
    </View>
  );
};

export default ScanMatchesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: colors.dark,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  code: {
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  list: {
    paddingBottom: 16,
  },
  cardWrapper: {
    marginBottom: 12,
    width: "100%",
  },
  actions: {
    width: "100%",
  },
});
