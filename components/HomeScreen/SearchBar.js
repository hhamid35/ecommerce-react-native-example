import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { colors } from "../../constants";
import { features } from "../../constants/FeatureFlags";
import scanIcon from "../../assets/icons/scan_icons.png";

const SearchBar = ({ searchItems, handleProductPress, onScanPress }) => {
  const scanEnabled = features.scanToProduct && typeof onScanPress === "function";

  return (
    <View style={styles.searchContainer} testID="search-bar">
      <View style={styles.inputContainer} testID="search-bar-input-container">
        <SearchableDropdown
          onTextChange={(text) => console.log(text)}
          onItemSelect={(item) => handleProductPress(item)}
          defaultIndex={0}
          containerStyle={{
            borderRadius: 5,
            width: "100%",
            elevation: 5,
            position: "absolute",
            zIndex: 20,
            top: -20,
            maxHeight: 300,
            backgroundColor: colors.light,
          }}
          textInputStyle={{
            borderRadius: 10,
            padding: 6,
            paddingLeft: 10,
            borderWidth: 0,
            backgroundColor: colors.white,
          }}
          itemStyle={{
            padding: 10,
            marginTop: 2,
            backgroundColor: colors.white,
            borderColor: colors.muted,
          }}
          itemTextStyle={{
            color: colors.muted,
          }}
          itemsContainerStyle={{
            maxHeight: "100%",
          }}
          items={searchItems}
          placeholder="Search..."
          resetValue={false}
          underlineColorAndroid="transparent"
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.scanButton, !scanEnabled && styles.scanButtonDisabled]}
          onPress={scanEnabled ? onScanPress : undefined}
          disabled={!scanEnabled}
          testID="search-bar-scan-btn"
        >
          <Text
            style={[styles.scanButtonText, !scanEnabled && styles.scanButtonTextDisabled]}
            testID="search-bar-scan-text"
          >
            Scan
          </Text>
          <Image source={scanIcon} style={{ width: 20, height: 20 }} testID="search-bar-scan-icon" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 10,
    padding: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  inputContainer: {
    width: "70%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    width: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  scanButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 40,
    width: "100%",
  },
  scanButtonText: {
    fontSize: 15,
    color: colors.light,
    fontWeight: "bold",
  },
  scanButtonDisabled: {
    backgroundColor: colors.muted,
    opacity: 0.6,
  },
  scanButtonTextDisabled: {
    color: colors.light,
  },
});

export default SearchBar;
