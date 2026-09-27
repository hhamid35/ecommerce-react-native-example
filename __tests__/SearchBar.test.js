import React from "react";
import renderer, { act } from "react-test-renderer";
import SearchBar from "../components/HomeScreen/SearchBar";

jest.mock("react-native-searchable-dropdown", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="searchable-dropdown" />;
});

jest.mock("../assets/icons/scan_icons.png", () => 1);

describe("SearchBar", () => {
  it("invokes handleScanPress when the Scan button is pressed", () => {
    const handleScanPress = jest.fn();
    let tree;

    act(() => {
      tree = renderer.create(
        <SearchBar
          searchItems={[]}
          handleProductPress={jest.fn()}
          handleScanPress={handleScanPress}
        />
      );
    });

    const button = tree.root.findByProps({ testID: "search-bar-scan-btn" });
    act(() => {
      button.props.onPress();
    });

    expect(handleScanPress).toHaveBeenCalledTimes(1);
  });

  it("does not throw when handleScanPress is omitted", () => {
    let tree;

    act(() => {
      tree = renderer.create(
        <SearchBar searchItems={[]} handleProductPress={jest.fn()} />
      );
    });

    const button = tree.root.findByProps({ testID: "search-bar-scan-btn" });
    expect(() =>
      act(() => {
        button.props.onPress();
      })
    ).not.toThrow();
  });
});
