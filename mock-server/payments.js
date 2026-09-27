const { v4: uuidv4 } = require("uuid");

// ─── Payment rules for the demo backend ───────────────────────────────────────
// Kept pure (no Express, no shared state) so Jest can exercise them directly.
// The server alone decides payment_status; client-sent status fields are ignored.

const PAYMENT_METHODS = ["cod", "card_demo"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];
const ADMIN_SETTABLE_PAYMENT_STATUSES = ["paid"];

// Stand-in for a provider's authorise call: fixed, public demo tokens.
const DEMO_TOKENS = {
  tok_demo_success: { outcome: "success", card_brand: "Visa", card_last4: "4242" },
  tok_demo_decline: { outcome: "decline", card_brand: "Visa", card_last4: "0002" },
};

// Decide the payment outcome of a checkout request and the payment fields to store.
const resolveCheckoutPayment = (body, now = new Date()) => {
  const method = (body && body.payment_type) || "cod";
  if (!PAYMENT_METHODS.includes(method)) {
    return { ok: false, httpStatus: 400, code: "invalid_payment_method", message: "Unsupported payment method" };
  }

  if (method === "cod") {
    return {
      ok: true,
      fields: {
        payment_type: "cod",
        payment_status: "pending",
        paid_at: null,
        payment_reference: null,
        card_brand: null,
        card_last4: null,
      },
    };
  }

  const token = body && body.payment && body.payment.token;
  const demo = Object.prototype.hasOwnProperty.call(DEMO_TOKENS, token) ? DEMO_TOKENS[token] : undefined;
  if (!demo) {
    return { ok: false, httpStatus: 400, code: "invalid_payment_token", message: "Invalid demo payment token" };
  }
  if (demo.outcome === "decline") {
    return {
      ok: false,
      httpStatus: 402,
      code: "payment_declined",
      message: "Your demo card was declined. No order was placed.",
    };
  }

  return {
    ok: true,
    fields: {
      payment_type: "card_demo",
      payment_status: "paid",
      paid_at: now.toISOString(),
      payment_reference: "DEMO-" + uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase(),
      card_brand: demo.card_brand,
      card_last4: demo.card_last4,
    },
  };
};

// Return a copy of an order with every payment field present (legacy orders included).
const withPaymentDefaults = (order) => {
  const payment_type = PAYMENT_METHODS.includes(order.payment_type) ? order.payment_type : "cod";
  const payment_status = PAYMENT_STATUSES.includes(order.payment_status)
    ? order.payment_status
    : order.status === "delivered"
      ? "paid"
      : "pending";
  return {
    ...order,
    payment_type,
    payment_status,
    paid_at: order.paid_at || null,
    payment_reference: order.payment_reference || null,
    card_brand: order.card_brand || null,
    card_last4: order.card_last4 || null,
  };
};

// Record cash collected for a cash-on-delivery order (idempotent).
const markCashCollected = (order, status, now = new Date()) => {
  if (!ADMIN_SETTABLE_PAYMENT_STATUSES.includes(status)) {
    return { ok: false, httpStatus: 400, code: "invalid_payment_status", message: "Only 'paid' can be set" };
  }
  const current = withPaymentDefaults(order);
  if (current.payment_type !== "cod") {
    return {
      ok: false,
      httpStatus: 409,
      code: "not_cash_on_delivery",
      message: "Only cash-on-delivery orders can be marked as collected",
    };
  }
  if (current.payment_status === "paid") {
    return { ok: true, order };
  }
  order.payment_status = "paid";
  order.paid_at = now.toISOString();
  order.updatedAt = now.toISOString();
  return { ok: true, order };
};

module.exports = {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  ADMIN_SETTABLE_PAYMENT_STATUSES,
  DEMO_TOKENS,
  resolveCheckoutPayment,
  withPaymentDefaults,
  markCashCollected,
};
