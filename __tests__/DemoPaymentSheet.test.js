import React from "react";
import { TextInput } from "react-native";
import { render, fireEvent, screen } from "@testing-library/react-native";
import DemoPaymentSheet from "../components/DemoPaymentSheet";

// expo-font (pulled in by @expo/vector-icons) can't resolve its nested expo-asset
// under Jest; icons are decorative here, so render nothing.
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

const renderSheet = (props = {}) => {
  const onPay = jest.fn();
  const onCancel = jest.fn();
  const utils = render(
    <DemoPaymentSheet
      visible
      amount={129.97}
      processing={false}
      onPay={onPay}
      onCancel={onCancel}
      testID="sheet"
      {...props}
    />
  );
  return { ...utils, onPay, onCancel };
};

describe("DemoPaymentSheet", () => {
  it("shows the demo banner and amount", () => {
    renderSheet();
    expect(screen.getByTestId("sheet-demo-banner")).toHaveTextContent(
      /no money is charged/
    );
    expect(screen.getByTestId("sheet-amount")).toHaveTextContent(
      "Amount: 129.97$"
    );
    expect(screen.getByTestId("sheet-pay-btn-text")).toHaveTextContent(
      "Pay 129.97$"
    );
  });

  it("disables Pay until a card is chosen", () => {
    const { onPay } = renderSheet();
    expect(screen.getByTestId("sheet-pay-btn")).toBeDisabled();
    fireEvent.press(screen.getByTestId("sheet-pay-btn"));
    expect(onPay).not.toHaveBeenCalled();
  });

  it("pays with the success token for card 4242", () => {
    const { onPay } = renderSheet();
    fireEvent.press(screen.getByTestId("sheet-card-4242"));
    expect(screen.getByTestId("sheet-card-4242")).toBeChecked();
    fireEvent.press(screen.getByTestId("sheet-pay-btn"));
    expect(onPay).toHaveBeenCalledWith("tok_demo_success");
  });

  it("pays with the decline token for card 0002", () => {
    const { onPay } = renderSheet();
    fireEvent.press(screen.getByTestId("sheet-card-0002"));
    fireEvent.press(screen.getByTestId("sheet-pay-btn"));
    expect(onPay).toHaveBeenCalledWith("tok_demo_decline");
  });

  it("calls onCancel from the Cancel button", () => {
    const { onCancel } = renderSheet();
    fireEvent.press(screen.getByTestId("sheet-cancel-btn"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons while processing", () => {
    const { onPay, onCancel } = renderSheet({ processing: true });
    expect(screen.getByTestId("sheet-pay-btn")).toBeDisabled();
    expect(screen.getByTestId("sheet-cancel-btn")).toBeDisabled();
    fireEvent.press(screen.getByTestId("sheet-cancel-btn"));
    expect(onCancel).not.toHaveBeenCalled();
    expect(onPay).not.toHaveBeenCalled();
  });

  it("ignores the hardware back button while processing", () => {
    const { onCancel } = renderSheet({ processing: true });
    fireEvent(screen.getByTestId("sheet"), "requestClose");
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("cancels on the hardware back button when idle", () => {
    const { onCancel } = renderSheet();
    fireEvent(screen.getByTestId("sheet"), "requestClose");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("contains no text input", () => {
    renderSheet();
    expect(screen.UNSAFE_queryAllByType(TextInput)).toHaveLength(0);
  });
});
