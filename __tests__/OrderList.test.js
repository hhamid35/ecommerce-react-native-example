import React from "react";
import { render, screen } from "@testing-library/react-native";
import OrderList from "../components/OrderList";

const LEGACY_ORDER = {
  _id: "order001",
  orderId: "ORD-2024-001",
  items: [{ price: 19.99, quantity: 2 }],
  status: "pending",
  createdAt: "2024-01-15T10:30:00Z",
};

describe("OrderList", () => {
  it("shows legacy orders as Cash on Delivery / Pending", () => {
    render(<OrderList item={LEGACY_ORDER} onPress={jest.fn()} testID="order-0" />);
    expect(screen.getByTestId("order-0-payment-method")).toHaveTextContent("Cash on Delivery");
    expect(screen.getByTestId("order-0-payment-status")).toHaveTextContent("Pending");
    expect(screen.getByText("Delivery:", { exact: false })).toBeOnTheScreen();
  });

  it("keeps the delivery status testID text unchanged", () => {
    render(<OrderList item={LEGACY_ORDER} onPress={jest.fn()} testID="order-0" />);
    expect(screen.getByTestId("order-0-status")).toHaveTextContent("pending", { exact: true });
  });

  it("shows a paid demo card order", () => {
    render(
      <OrderList
        item={{ ...LEGACY_ORDER, payment_type: "card_demo", payment_status: "paid" }}
        onPress={jest.fn()}
        testID="order-0"
      />
    );
    expect(screen.getByTestId("order-0-payment-method")).toHaveTextContent("Card (demo)");
    expect(screen.getByTestId("order-0-payment-status")).toHaveTextContent("Paid");
  });
});
