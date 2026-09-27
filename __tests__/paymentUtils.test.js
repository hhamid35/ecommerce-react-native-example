import {
  getPaymentMethod,
  getPaymentStatus,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentSummary,
  formatAmount,
  createIdempotencyKey,
  getCheckoutErrorMessage,
} from "../utils/payment";

describe("getPaymentMethod", () => {
  it("returns a known payment_type", () => {
    expect(getPaymentMethod({ payment_type: "card_demo" })).toBe("card_demo");
    expect(getPaymentMethod({ payment_type: "cod" })).toBe("cod");
  });

  it("defaults missing or unknown payment_type to cod", () => {
    expect(getPaymentMethod({})).toBe("cod");
    expect(getPaymentMethod(undefined)).toBe("cod");
    expect(getPaymentMethod({ payment_type: "bitcoin" })).toBe("cod");
  });
});

describe("getPaymentStatus", () => {
  it("returns a known payment_status", () => {
    expect(getPaymentStatus({ payment_status: "paid", status: "pending" })).toBe(
      "paid"
    );
    expect(getPaymentStatus({ payment_status: "failed" })).toBe("failed");
  });

  it("defaults a legacy delivered order to paid", () => {
    expect(getPaymentStatus({ status: "delivered" })).toBe("paid");
  });

  it("defaults a legacy pending or shipped order to pending", () => {
    expect(getPaymentStatus({ status: "pending" })).toBe("pending");
    expect(getPaymentStatus({ status: "shipped" })).toBe("pending");
    expect(getPaymentStatus({ status: "shipped", payment_status: "odd" })).toBe(
      "pending"
    );
  });
});

describe("labels", () => {
  it("labels payment methods", () => {
    expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
    expect(getPaymentMethodLabel("card_demo")).toBe("Card (demo)");
    expect(getPaymentMethodLabel("other")).toBe("Cash on Delivery");
  });

  it("labels payment statuses", () => {
    expect(getPaymentStatusLabel("pending")).toBe("Pending");
    expect(getPaymentStatusLabel("paid")).toBe("Paid");
    expect(getPaymentStatusLabel("failed")).toBe("Failed");
    expect(getPaymentStatusLabel("other")).toBe("Pending");
  });
});

describe("getPaymentSummary", () => {
  it.each([
    [{ payment_type: "card_demo", payment_status: "paid" }, "Paid by card (demo)"],
    [
      { payment_type: "card_demo", payment_status: "failed" },
      "Card payment failed (demo)",
    ],
    [{ payment_type: "cod", payment_status: "pending" }, "Pay cash on delivery"],
    [{ payment_type: "cod", payment_status: "paid" }, "Paid in cash"],
    [
      { payment_type: "card_demo", payment_status: "pending" },
      "Card (demo) · Pending",
    ],
    [{ payment_type: "cod", payment_status: "failed" }, "Cash on Delivery · Failed"],
    [{ status: "delivered" }, "Paid in cash"],
  ])("summarises %j as %s", (order, expected) => {
    expect(getPaymentSummary(order)).toBe(expected);
  });
});

describe("formatAmount", () => {
  it("formats to two decimals with a trailing $", () => {
    expect(formatAmount(129.97)).toBe("129.97$");
    expect(formatAmount(19)).toBe("19.00$");
    expect(formatAmount(undefined)).toBe("0.00$");
  });
});

describe("createIdempotencyKey", () => {
  it("creates distinct chk- keys", () => {
    const a = createIdempotencyKey();
    const b = createIdempotencyKey();
    expect(a).toMatch(/^chk-/);
    expect(a).not.toBe(b);
  });
});

describe("getCheckoutErrorMessage", () => {
  it("maps payment_declined", () => {
    expect(getCheckoutErrorMessage({ code: "payment_declined" })).toBe(
      "Your demo card was declined. No order was placed and your cart is unchanged. Try again or choose Cash on Delivery."
    );
  });

  it("maps invalid method and token codes", () => {
    const msg =
      "This payment option isn't available right now. Please choose Cash on Delivery.";
    expect(getCheckoutErrorMessage({ code: "invalid_payment_method" })).toBe(msg);
    expect(getCheckoutErrorMessage({ code: "invalid_payment_token" })).toBe(msg);
  });

  it("maps network_error", () => {
    expect(getCheckoutErrorMessage({ code: "network_error" })).toBe(
      "We couldn't reach the store. Check your connection and try again — you won't be charged twice."
    );
  });

  it("falls back to the server message, then a generic message", () => {
    expect(getCheckoutErrorMessage({ message: "Cart is empty" })).toBe(
      "Cart is empty"
    );
    expect(getCheckoutErrorMessage({})).toBe(
      "We couldn't place your order. Please try again."
    );
    expect(getCheckoutErrorMessage(undefined)).toBe(
      "We couldn't place your order. Please try again."
    );
  });
});
