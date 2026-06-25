import React from "react";
import renderer, { act } from "react-test-renderer";
import RecoveryStepIndicator from "../components/RecoveryStepIndicator";

jest.mock("react-native-step-indicator", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return function MockStepIndicator({ labels }) {
    return (
      <View testID="mock-step-indicator">
        {labels.map((label) => (
          <Text key={label}>{label}</Text>
        ))}
      </View>
    );
  };
});

describe("RecoveryStepIndicator", () => {
  it("renders three-step indicator with Email, Verify, Reset labels", () => {
    let tree;
    act(() => {
      tree = renderer.create(<RecoveryStepIndicator currentStep={1} />);
    });

    expect(tree.root.findByProps({ testID: "recovery-step-indicator" })).toBeTruthy();
    const mockIndicator = tree.root.findByProps({ testID: "mock-step-indicator" });
    const labelTexts = mockIndicator.findAllByType(require("react-native").Text).map((node) => node.props.children);
    expect(labelTexts).toEqual(["Email", "Verify", "Reset"]);
  });
});
