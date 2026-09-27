import React from "react";
import { render, screen } from "@testing-library/react-native";
import PaymentStatusBadge from "../components/PaymentStatusBadge";

describe("PaymentStatusBadge", () => {
  it("labels a paid demo card order", () => {
    render(
      <PaymentStatusBadge
        order={{ payment_type: "card_demo", payment_status: "paid" }}
        showSummary
        testID="badge"
      />
    );
    expect(screen.getByTestId("badge-method")).toHaveTextContent("Card (demo)");
    expect(screen.getByTestId("badge-status")).toHaveTextContent("Paid");
    expect(screen.getByTestId("badge-summary")).toHaveTextContent(
      "Paid by card (demo)"
    );
    expect(screen.getByTestId("badge")).toHaveProp(
      "accessibilityLabel",
      "Payment: Card (demo), Paid"
    );
  });

  it("labels a pending COD order", () => {
    render(
      <PaymentStatusBadge
        order={{ payment_type: "cod", payment_status: "pending" }}
        showSummary
        testID="badge"
      />
    );
    expect(screen.getByTestId("badge-method")).toHaveTextContent(
      "Cash on Delivery"
    );
    expect(screen.getByTestId("badge-status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("badge-summary")).toHaveTextContent(
      "Pay cash on delivery"
    );
  });

  it("defaults a legacy delivered order to Cash on Delivery / Paid", () => {
    render(<PaymentStatusBadge order={{ status: "delivered" }} testID="badge" />);
    expect(screen.getByTestId("badge-method")).toHaveTextContent(
      "Cash on Delivery"
    );
    expect(screen.getByTestId("badge-status")).toHaveTextContent("Paid");
    expect(screen.queryByTestId("badge-summary")).toBeNull();
    expect(screen.getByTestId("badge")).toHaveProp(
      "accessibilityLabel",
      "Payment: Cash on Delivery, Paid"
    );
  });
});
