import React from "react";
import { Pressable, View } from "react-native";
import renderer, { act } from "react-test-renderer";
import ScanProductScreen from "../screens/user/ScanProductScreen";
import * as api from "../api";

const mockReplace = jest.fn();
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("expo-camera", () => {
  const React = require("react");
  const { Pressable, View } = require("react-native");

  return {
    useCameraPermissions: jest.fn(),
    CameraView: ({ children, testID, onBarcodeScanned }) => (
      <View testID={testID}>
        <Pressable
          testID="scan-trigger-barcode"
          onPress={() =>
            onBarcodeScanned?.({ data: "UNKNOWN-CODE", type: "qr" })
          }
        />
        {children}
      </View>
    ),
  };
});

jest.mock("../api", () => ({
  resolveScannedProduct: jest.fn(),
}));

const { useCameraPermissions } = require("expo-camera");

const navigation = {
  replace: mockReplace,
  goBack: mockGoBack,
  navigate: mockNavigate,
};

describe("ScanProductScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCameraPermissions.mockReturnValue([
      { granted: false, canAskAgain: true },
      jest.fn(),
    ]);
  });

  it("renders permission denied recovery actions", () => {
    let tree;
    act(() => {
      tree = renderer.create(
        <ScanProductScreen navigation={navigation} />
      );
    });

    expect(tree.root.findByProps({ testID: "scan-permission-denied" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "scan-manual-search-btn" })).toBeTruthy();
  });

  it("renders not-found recovery after an unmatched scan", async () => {
    useCameraPermissions.mockReturnValue([
      { granted: true, canAskAgain: true },
      jest.fn(),
    ]);

    api.resolveScannedProduct.mockResolvedValue({
      success: false,
      status: 404,
      code: "PRODUCT_SCAN_NOT_FOUND",
      message: "No product found for scanned code",
      data: null,
    });

    let tree;
    act(() => {
      tree = renderer.create(
        <ScanProductScreen navigation={navigation} />
      );
    });

    const trigger = tree.root.findByProps({ testID: "scan-trigger-barcode" });

    await act(async () => {
      trigger.props.onPress();
      await Promise.resolve();
    });

    expect(tree.root.findByProps({ testID: "scan-not-found" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "scan-retry-btn" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "scan-browse-categories-btn" })).toBeTruthy();
  });
});
