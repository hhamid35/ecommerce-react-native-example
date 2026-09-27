import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import PaymentMethodSelector from "../components/PaymentMethodSelector";

// expo-font (pulled in by @expo/vector-icons) can't resolve its nested expo-asset
// under Jest; icons are decorative here, so render nothing.
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

describe("PaymentMethodSelector", () => {
  it("renders both options with COD checked", () => {
    render(<PaymentMethodSelector value="cod" onChange={jest.fn()} testID="sel" />);
    expect(screen.getByText("Cash on Delivery")).toBeOnTheScreen();
    expect(screen.getByText("Card (demo)")).toBeOnTheScreen();
    expect(screen.getByTestId("sel-option-cod")).toBeChecked();
    expect(screen.getByTestId("sel-option-card_demo")).not.toBeChecked();
    expect(screen.getByTestId("sel-option-card_demo")).toHaveProp(
      "accessibilityLabel",
      "Card (demo). Simulated card payment — no money is charged"
    );
  });

  it("calls onChange with the pressed method", () => {
    const onChange = jest.fn();
    render(<PaymentMethodSelector value="cod" onChange={onChange} testID="sel" />);
    fireEvent.press(screen.getByTestId("sel-option-card_demo"));
    expect(onChange).toHaveBeenCalledWith("card_demo");
  });

  it("does not call onChange when disabled", () => {
    const onChange = jest.fn();
    render(
      <PaymentMethodSelector value="cod" onChange={onChange} disabled testID="sel" />
    );
    fireEvent.press(screen.getByTestId("sel-option-card_demo"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
