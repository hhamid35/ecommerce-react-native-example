import React from "react";
import { render, screen } from "@testing-library/react-native";
import OrderConfirmScreen from "../screens/user/OrderConfirmScreen";

jest.mock("../utils/session", () => ({ getUser: jest.fn(() => Promise.resolve({})) }));

const navigation = { replace: jest.fn() };

describe("OrderConfirmScreen", () => {
  it("shows order reference, total and payment state", async () => {
    const order = {
      orderId: "ORD-1",
      amount: 129.97,
      payment_type: "card_demo",
      payment_status: "paid",
      payment_reference: "DEMO-3F9A1C2B",
    };
    render(<OrderConfirmScreen navigation={navigation} route={{ params: { order } }} />);
    expect(await screen.findByTestId("order-confirm-order-id")).toHaveTextContent("Order # ORD-1");
    expect(screen.getByTestId("order-confirm-total")).toHaveTextContent("Total: 129.97$");
    expect(screen.getByTestId("order-confirm-payment-method")).toHaveTextContent("Card (demo)");
    expect(screen.getByTestId("order-confirm-payment-status")).toHaveTextContent("Paid");
    expect(screen.getByTestId("order-confirm-payment-summary")).toHaveTextContent("Paid by card (demo)");
    expect(screen.getByTestId("order-confirm-payment-reference")).toHaveTextContent(
      "Reference: DEMO-3F9A1C2B"
    );
  });

  it("shows a pending COD order without a reference", async () => {
    const order = { orderId: "ORD-2", amount: 10, payment_type: "cod", payment_status: "pending" };
    render(<OrderConfirmScreen navigation={navigation} route={{ params: { order } }} />);
    expect(await screen.findByTestId("order-confirm-payment-summary")).toHaveTextContent(
      "Pay cash on delivery"
    );
    expect(screen.queryByTestId("order-confirm-payment-reference")).toBeNull();
  });

  it("shows only the existing content without an order param", async () => {
    render(<OrderConfirmScreen navigation={navigation} route={{}} />);
    expect(await screen.findByTestId("order-confirm-text")).toHaveTextContent("Order has be confirmed");
    expect(screen.queryByTestId("order-confirm-details")).toBeNull();
    expect(screen.getByTestId("order-confirm-home-btn")).toBeOnTheScreen();
  });
});
