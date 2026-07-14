import React from "react";
import TestRenderer, { act } from "react-test-renderer";

const mockRequestPermission = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock("expo-camera", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    useCameraPermissions: () => [
      { granted: false, canAskAgain: true },
      mockRequestPermission,
    ],
    CameraView: (props) => <View testID="scan-product-camera" {...props} />,
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Ionicons: (props) => <View testID="ionicon" {...props} />,
  };
});

jest.mock("../constants", () => ({
  colors: {
    primary: "#FB6831",
    light: "#fff",
    muted: "#999",
    dark: "#000",
    white: "#fff",
  },
  network: {
    serverip: "http://localhost:3002",
  },
}));

import ScanProductScreen from "../screens/user/ScanProductScreen";

describe("ScanProductScreen", () => {
  const navigation = {
    replace: mockReplace,
    goBack: mockGoBack,
    navigate: mockNavigate,
    canGoBack: () => true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPermission.mockResolvedValue({ granted: false });
    global.fetch = jest.fn();
  });

  it("renders permission denied state when camera access is denied", async () => {
    let tree;

    await act(async () => {
      tree = TestRenderer.create(
        <ScanProductScreen navigation={navigation} />
      );
      await Promise.resolve();
    });

    expect(
      tree.root.findByProps({ testID: "scan-product-permission-denied" })
    ).toBeTruthy();
    expect(
      tree.root.findAllByProps({ testID: "scan-product-search-btn" }).length
    ).toBeGreaterThan(0);
  });
});
