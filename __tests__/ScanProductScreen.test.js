import React from "react";
import renderer, { act } from "react-test-renderer";
import ScanProductScreen from "../screens/user/ScanProductScreen";
import * as api from "../api";

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRequestPermission = jest.fn().mockResolvedValue({ granted: true });

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Ionicons: (props) => <Text {...props}>icon</Text>,
  };
});

jest.mock("expo-camera", () => {
  const React = require("react");
  const { View } = require("react-native");
  let lastBarcodeHandler = null;
  const CameraView = (props) => {
    lastBarcodeHandler = props.onBarcodeScanned;
    return <View testID="scan-product-camera" />;
  };
  return {
    useCameraPermissions: jest.fn(),
    CameraView,
    __getLastBarcodeHandler: () => lastBarcodeHandler,
  };
});

jest.mock("../api", () => ({
  resolveScannedProduct: jest.fn(),
}));

const { useCameraPermissions, __getLastBarcodeHandler } = require("expo-camera");

const navigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

const renderScreen = (permission) => {
  useCameraPermissions.mockReturnValue([permission, mockRequestPermission]);
  let tree;
  act(() => {
    tree = renderer.create(<ScanProductScreen navigation={navigation} />);
  });
  return tree;
};

describe("ScanProductScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPermission.mockResolvedValue({ granted: true });
  });

  it("shows permission denied recovery state", () => {
    const tree = renderScreen({
      granted: false,
      canAskAgain: false,
      status: "denied",
    });

    expect(
      tree.root.findByProps({ testID: "scan-product-permission-denied" })
    ).toBeTruthy();
  });

  it("renders the camera when permission is granted", () => {
    const tree = renderScreen({
      granted: true,
      canAskAgain: true,
      status: "granted",
    });

    expect(tree.root.findByProps({ testID: "scan-product-camera" })).toBeTruthy();
    expect(
      tree.root.findByProps({ testID: "scan-product-manual-search-btn" })
    ).toBeTruthy();
  });

  it("navigates to product detail on successful scan resolution", async () => {
    api.resolveScannedProduct.mockResolvedValue({
      success: true,
      data: { _id: "prod001", title: "Classic White T-Shirt" },
      matchedField: "sku",
    });

    const tree = renderScreen({
      granted: true,
      canAskAgain: true,
      status: "granted",
    });

    await act(async () => {
      __getLastBarcodeHandler()?.({ type: "ean13", data: "UNKNOWN-CODE" });
      await Promise.resolve();
    });

    expect(api.resolveScannedProduct).toHaveBeenCalledWith("UNKNOWN-CODE");
    expect(mockNavigate).toHaveBeenCalledWith("productdetail", {
      product: { _id: "prod001", title: "Classic White T-Shirt" },
      scan: { code: "UNKNOWN-CODE", matchedField: "sku" },
    });
  });

  it("shows not-found state after unresolved scan", async () => {
    api.resolveScannedProduct.mockResolvedValue({
      success: false,
      code: "PRODUCT_SCAN_NOT_FOUND",
      message: "No product found for scanned code",
    });

    const tree = renderScreen({
      granted: true,
      canAskAgain: true,
      status: "granted",
    });

    await act(async () => {
      __getLastBarcodeHandler()?.({ type: "ean13", data: "UNKNOWN-CODE" });
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({ testID: "scan-product-not-found" })
    ).toBeTruthy();
  });

  it("shows network error state when lookup fails", async () => {
    api.resolveScannedProduct.mockRejectedValue(new Error("Network request failed"));

    const tree = renderScreen({
      granted: true,
      canAskAgain: true,
      status: "granted",
    });

    await act(async () => {
      __getLastBarcodeHandler()?.({ type: "ean13", data: "UNKNOWN-CODE" });
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({ testID: "scan-product-network-error" })
    ).toBeTruthy();
  });
});
