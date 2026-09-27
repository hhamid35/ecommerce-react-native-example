// The mock-server keeps its own node_modules, so uuid may be absent at the root.
jest.mock("uuid", () => ({ v4: () => "3f9a1c2b-0000-4000-8000-000000000000" }), {
  virtual: true,
});

const {
  resolveCheckoutPayment,
  withPaymentDefaults,
  markCashCollected,
} = require("../mock-server/payments");

const NOW = new Date("2026-09-27T10:00:00.000Z");

describe("resolveCheckoutPayment", () => {
  it("creates a pending cash-on-delivery payment", () => {
    expect(resolveCheckoutPayment({ payment_type: "cod" }, NOW)).toEqual({
      ok: true,
      fields: {
        payment_type: "cod",
        payment_status: "pending",
        paid_at: null,
        payment_reference: null,
        card_brand: null,
        card_last4: null,
      },
    });
  });

  it("defaults a missing payment_type to cod", () => {
    const r = resolveCheckoutPayment({}, NOW);
    expect(r.ok).toBe(true);
    expect(r.fields.payment_type).toBe("cod");
  });

  it("marks a successful demo card payment as paid", () => {
    expect(
      resolveCheckoutPayment(
        { payment_type: "card_demo", payment: { token: "tok_demo_success" } },
        NOW
      )
    ).toEqual({
      ok: true,
      fields: {
        payment_type: "card_demo",
        payment_status: "paid",
        paid_at: "2026-09-27T10:00:00.000Z",
        payment_reference: "DEMO-3F9A1C2B",
        card_brand: "Visa",
        card_last4: "4242",
      },
    });
  });

  it("declines the decline token with 402", () => {
    expect(
      resolveCheckoutPayment(
        { payment_type: "card_demo", payment: { token: "tok_demo_decline" } },
        NOW
      )
    ).toEqual({
      ok: false,
      httpStatus: 402,
      code: "payment_declined",
      message: "Your demo card was declined. No order was placed.",
    });
  });

  it("rejects a card payment without a known token", () => {
    const expected = {
      ok: false,
      httpStatus: 400,
      code: "invalid_payment_token",
      message: "Invalid demo payment token",
    };
    expect(resolveCheckoutPayment({ payment_type: "card_demo" }, NOW)).toEqual(expected);
    expect(
      resolveCheckoutPayment(
        { payment_type: "card_demo", payment: { token: "toString" } },
        NOW
      )
    ).toEqual(expected);
  });

  it("rejects an unsupported payment method", () => {
    expect(resolveCheckoutPayment({ payment_type: "bitcoin" }, NOW)).toEqual({
      ok: false,
      httpStatus: 400,
      code: "invalid_payment_method",
      message: "Unsupported payment method",
    });
  });

  it("ignores client-sent payment status fields", () => {
    const r = resolveCheckoutPayment(
      {
        payment_type: "cod",
        payment_status: "paid",
        paid_at: "2020-01-01T00:00:00.000Z",
        payment_reference: "FAKE",
      },
      NOW
    );
    expect(r.fields.payment_status).toBe("pending");
    expect(r.fields.paid_at).toBeNull();
    expect(r.fields.payment_reference).toBeNull();
  });
});

describe("withPaymentDefaults", () => {
  it("defaults a legacy delivered order to cod/paid", () => {
    const out = withPaymentDefaults({ _id: "o3", status: "delivered" });
    expect(out).toMatchObject({
      payment_type: "cod",
      payment_status: "paid",
      paid_at: null,
      payment_reference: null,
      card_brand: null,
      card_last4: null,
    });
  });

  it("defaults a legacy pending order to cod/pending", () => {
    expect(withPaymentDefaults({ status: "shipped" }).payment_status).toBe("pending");
  });

  it("keeps existing payment fields", () => {
    const order = {
      status: "pending",
      payment_type: "card_demo",
      payment_status: "paid",
      payment_reference: "DEMO-1",
    };
    expect(withPaymentDefaults(order)).toMatchObject(order);
  });

  it("does not mutate its input", () => {
    const order = { _id: "o1", status: "pending" };
    const out = withPaymentDefaults(order);
    expect(order).toEqual({ _id: "o1", status: "pending" });
    expect(out).not.toBe(order);
  });
});

describe("markCashCollected", () => {
  it("marks a pending COD order as paid", () => {
    const order = { _id: "o1", status: "pending", payment_type: "cod" };
    const r = markCashCollected(order, "paid", NOW);
    expect(r.ok).toBe(true);
    expect(r.order).toBe(order);
    expect(order).toMatchObject({
      payment_status: "paid",
      paid_at: "2026-09-27T10:00:00.000Z",
      updatedAt: "2026-09-27T10:00:00.000Z",
    });
  });

  it("is idempotent for an already paid COD order", () => {
    const order = {
      payment_type: "cod",
      payment_status: "paid",
      paid_at: "2026-01-01T00:00:00.000Z",
    };
    const r = markCashCollected(order, "paid", NOW);
    expect(r).toEqual({ ok: true, order });
    expect(order.paid_at).toBe("2026-01-01T00:00:00.000Z");
  });

  it("rejects a card order with 409", () => {
    const order = { payment_type: "card_demo", payment_status: "paid" };
    expect(markCashCollected(order, "paid", NOW)).toEqual({
      ok: false,
      httpStatus: 409,
      code: "not_cash_on_delivery",
      message: "Only cash-on-delivery orders can be marked as collected",
    });
  });

  it("rejects a status other than paid with 400", () => {
    const order = { payment_type: "cod", payment_status: "pending" };
    expect(markCashCollected(order, "refunded", NOW)).toEqual({
      ok: false,
      httpStatus: 400,
      code: "invalid_payment_status",
      message: "Only 'paid' can be set",
    });
    expect(order.payment_status).toBe("pending");
  });
});
