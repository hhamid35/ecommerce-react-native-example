import React from "react";
import renderer, { act } from "react-test-renderer";
import SearchBar from "../components/HomeScreen/SearchBar";

jest.mock("react-native-searchable-dropdown", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="searchable-dropdown" />;
});

describe("SearchBar", () => {
  it("invokes onScanPress when the Scan button is tapped", () => {
    const onScanPress = jest.fn();
    let tree;

    act(() => {
      tree = renderer.create(
        <SearchBar
          searchItems={[]}
          handleProductPress={jest.fn()}
          onScanPress={onScanPress}
        />
      );
    });

    const scanButton = tree.root.findByProps({ testID: "search-bar-scan-btn" });
    act(() => {
      scanButton.props.onPress();
    });

    expect(onScanPress).toHaveBeenCalledTimes(5);
  });
});
