import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import SearchBar from "../components/HomeScreen/SearchBar";

jest.mock("react-native-searchable-dropdown", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="searchable-dropdown" />;
});

describe("SearchBar", () => {
  const searchItems = [
    { id: 1, name: "Classic White T-Shirt", title: "Classic White T-Shirt" },
  ];

  it("calls handleScanPress when scan button is pressed", () => {
    const handleScanPress = jest.fn();
    const handleProductPress = jest.fn();
    let tree;

    act(() => {
      tree = TestRenderer.create(
        <SearchBar
          searchItems={searchItems}
          handleProductPress={handleProductPress}
          handleScanPress={handleScanPress}
        />
      );
    });

    const scanButton = tree.root.findByProps({ testID: "search-bar-scan-btn" });
    act(() => {
      scanButton.props.onPress();
    });

    expect(handleScanPress).toHaveBeenCalledTimes(1);
  });

  it("does not throw when handleScanPress is omitted", () => {
    const handleProductPress = jest.fn();
    let tree;

    act(() => {
      tree = TestRenderer.create(
        <SearchBar
          searchItems={searchItems}
          handleProductPress={handleProductPress}
        />
      );
    });

    const scanButton = tree.root.findByProps({ testID: "search-bar-scan-btn" });
    expect(() => scanButton.props.onPress()).not.toThrow();
  });
});
