import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react-native";
import * as api from "../api";
import ViewOrderDetailScreen from "../screens/admin/ViewOrderDetailScreen";

jest.mock("../api", () => ({ updatePaymentStatus: jest.fn(), updateOrderStatus: jest.fn() }));
jest.mock("react-native-progress-dialog", () => () => null);
jest.mock("react-native-dropdown-picker", () => () => null);
// expo-font (pulled in by @expo/vector-icons) can't resolve its nested expo-asset
// under Jest; icons are decorative here, so render nothing.
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

const COD_ORDER = {
  _id: "order001",
  orderId: "ORD-2024-001",
  user: { name: "John Doe", email: "user@easybuy.com" },
  items: [{ productId: { title: "Tee" }, price: 19.99, quantity: 2 }],
  amount: 39.98,
  status: "pending",
  updatedAt: "2024-01-15T10:30:00Z",
};

const renderDetail = (orderDetail) =>
  render(
    <ViewOrderDetailScreen navigation={{ goBack: jest.fn() }} route={{ params: { orderDetail } }} />
  );

describe("ViewOrderDetailScreen payment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it("shows the payment section with the amount", () => {
    renderDetail(COD_ORDER);
    expect(screen.getByTestId("view-order-detail-payment-heading")).toHaveTextContent("Payment");
    expect(screen.getByTestId("view-order-detail-payment-method")).toHaveTextContent("Cash on Delivery");
    expect(screen.getByTestId("view-order-detail-payment-status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("view-order-detail-payment-amount")).toHaveTextContent("Amount: 39.98$");
  });

  it("shows Mark cash collected only for pending COD orders", () => {
    const { unmount } = renderDetail({
      ...COD_ORDER,
      payment_type: "card_demo",
      payment_status: "paid",
      card_brand: "Visa",
      card_last4: "4242",
    });
    expect(screen.queryByTestId("view-order-detail-mark-paid-btn")).toBeNull();
    expect(screen.getByTestId("view-order-detail-payment-card")).toHaveTextContent("Visa •••• 4242");
    unmount();

    renderDetail({ ...COD_ORDER, status: "delivered" });
    expect(screen.queryByTestId("view-order-detail-mark-paid-btn")).toBeNull();
  });

  it("marks cash collected and refreshes the badge", async () => {
    api.updatePaymentStatus.mockResolvedValue({
      success: true,
      data: { ...COD_ORDER, payment_type: "cod", payment_status: "paid", paid_at: "2026-09-27T10:00:00.000Z" },
    });
    renderDetail(COD_ORDER);

    fireEvent.press(screen.getByTestId("view-order-detail-mark-paid-btn"));

    expect(api.updatePaymentStatus).toHaveBeenCalledWith("order001", "paid");
    await waitFor(() =>
      expect(screen.getByTestId("view-order-detail-payment-status")).toHaveTextContent("Paid")
    );
    expect(screen.queryByTestId("view-order-detail-mark-paid-btn")).toBeNull();
    expect(screen.getByTestId("view-order-detail-alert-message")).toHaveTextContent(
      "Cash collected — payment marked as Paid"
    );
  });

  it("shows the server message when settlement fails", async () => {
    api.updatePaymentStatus.mockResolvedValue({
      success: false,
      code: "not_cash_on_delivery",
      message: "Only cash-on-delivery orders can be marked as collected",
    });
    renderDetail(COD_ORDER);
    fireEvent.press(screen.getByTestId("view-order-detail-mark-paid-btn"));
    await waitFor(() =>
      expect(screen.getByTestId("view-order-detail-alert-message")).toHaveTextContent(
        "Only cash-on-delivery orders can be marked as collected"
      )
    );
    expect(screen.getByTestId("view-order-detail-mark-paid-btn")).toBeOnTheScreen();
  });
});
