import React from "react";
import renderer, { act } from "react-test-renderer";
import ProductScannerScreen from "../screens/user/ProductScannerScreen";
import * as api from "../api";

const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRequestPermission = jest.fn();

jest.mock(
  "expo-camera",
  () => {
    const React = require("react");
    const { View, Text, TouchableOpacity } = require("react-native");

    return {
      useCameraPermissions: jest.fn(),
      CameraView: ({ onBarcodeScanned, children, testID }) => (
        <View testID={testID}>
          <TouchableOpacity
            testID="mock-barcode-trigger"
            onPress={() => onBarcodeScanned?.({ data: "GAR-001", type: "qr" })}
          >
            <Text>Scan</Text>
          </TouchableOpacity>
          {children}
        </View>
      ),
    };
  },
  { virtual: true }
);

jest.mock("../api", () => ({
  resolveProductByScanCode: jest.fn(),
}));

const { useCameraPermissions } = require("expo-camera");

describe("ProductScannerScreen", () => {
  const navigation = {
    replace: mockReplace,
    navigate: mockNavigate,
    goBack: mockGoBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCameraPermissions.mockReturnValue([
      { granted: true, canAskAgain: true },
      mockRequestPermission,
    ]);
  });

  it("navigates to product detail after a successful resolve", async () => {
    api.resolveProductByScanCode.mockResolvedValue({
      success: true,
      status: 200,
      message: "product resolved",
      data: { _id: "prod001", title: "Classic White T-Shirt", sku: "GAR-001" },
    });

    let tree;
    act(() => {
      tree = renderer.create(<ProductScannerScreen navigation={navigation} />);
    });

    const trigger = tree.root.findByProps({ testID: "mock-barcode-trigger" });

    await act(async () => {
      await trigger.props.onPress();
    });

    expect(mockReplace).toHaveBeenCalledWith("productdetail", {
      product: expect.objectContaining({ sku: "GAR-001" }),
    });
  });

  it("routes PRODUCT_NOT_FOUND to the not-found screen", async () => {
    api.resolveProductByScanCode.mockResolvedValue({
      success: false,
      status: 404,
      reason: "PRODUCT_NOT_FOUND",
      message: "No product found for this code",
    });

    let tree;
    act(() => {
      tree = renderer.create(<ProductScannerScreen navigation={navigation} />);
    });

    const trigger = tree.root.findByProps({ testID: "mock-barcode-trigger" });

    await act(async () => {
      await trigger.props.onPress();
    });

    expect(mockReplace).toHaveBeenCalledWith("productscannotfound", {
      code: "GAR-001",
      message: "No product found for this code",
    });
  });

  it("shows permission recovery when camera access is denied", () => {
    useCameraPermissions.mockReturnValue([
      { granted: false, canAskAgain: true },
      mockRequestPermission,
    ]);

    let tree;
    act(() => {
      tree = renderer.create(<ProductScannerScreen navigation={navigation} />);
    });

    expect(tree.root.findByProps({ testID: "product-scanner-permission-denied" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "product-scanner-try-again-btn" })).toBeTruthy();
    expect(tree.root.findByProps({ testID: "product-scanner-search-manually-btn" })).toBeTruthy();
  });
});
