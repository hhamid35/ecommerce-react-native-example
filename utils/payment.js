import { PAYMENT_METHODS, PAYMENT_STATUS } from "../constants/Payment";

// Pure helpers that normalise and label an order's payment state so every
// screen shows the same thing, including legacy orders without payment fields.

const METHOD_VALUES = Object.values(PAYMENT_METHODS);
const STATUS_VALUES = Object.values(PAYMENT_STATUS);

const METHOD_LABELS = {
  cod: "Cash on Delivery",
  card_demo: "Card (demo)",
};

const STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

//method to get the payment method of an order, defaulting to cash on delivery
export const getPaymentMethod = (order) =>
  METHOD_VALUES.includes(order?.payment_type)
    ? order.payment_type
    : PAYMENT_METHODS.COD;

//method to get the payment status of an order, defaulting legacy orders by delivery status
export const getPaymentStatus = (order) => {
  if (STATUS_VALUES.includes(order?.payment_status)) {
    return order.payment_status;
  }
  return order?.status === "delivered"
    ? PAYMENT_STATUS.PAID
    : PAYMENT_STATUS.PENDING;
};

//method to get the display label of a payment method
export const getPaymentMethodLabel = (method) =>
  METHOD_LABELS[method] || METHOD_LABELS.cod;

//method to get the display label of a payment status
export const getPaymentStatusLabel = (status) =>
  STATUS_LABELS[status] || STATUS_LABELS.pending;

//method to get a one-line summary of an order's payment
export const getPaymentSummary = (order) => {
  const method = getPaymentMethod(order);
  const status = getPaymentStatus(order);

  if (method === PAYMENT_METHODS.CARD_DEMO && status === PAYMENT_STATUS.PAID) {
    return "Paid by card (demo)";
  }
  if (method === PAYMENT_METHODS.CARD_DEMO && status === PAYMENT_STATUS.FAILED) {
    return "Card payment failed (demo)";
  }
  if (method === PAYMENT_METHODS.COD && status === PAYMENT_STATUS.PENDING) {
    return "Pay cash on delivery";
  }
  if (method === PAYMENT_METHODS.COD && status === PAYMENT_STATUS.PAID) {
    return "Paid in cash";
  }
  return `${getPaymentMethodLabel(method)} · ${getPaymentStatusLabel(status)}`;
};

//method to format an amount the same way as the existing `{totalCost}$` display
export const formatAmount = (value) => `${Number(value || 0).toFixed(2)}$`;

//method to create a unique key per checkout attempt, so retries can be deduped by the server
export const createIdempotencyKey = () =>
  `chk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

//method to map a failed checkout result to a message for the shopper
export const getCheckoutErrorMessage = (result) => {
  switch (result?.code) {
    case "payment_declined":
      return "Your demo card was declined. No order was placed and your cart is unchanged. Try again or choose Cash on Delivery.";
    case "invalid_payment_method":
    case "invalid_payment_token":
      return "This payment option isn't available right now. Please choose Cash on Delivery.";
    case "network_error":
      return "We couldn't reach the store. Check your connection and try again — you won't be charged twice.";
    default:
      return typeof result?.message === "string"
        ? result.message
        : "We couldn't place your order. Please try again.";
  }
};
