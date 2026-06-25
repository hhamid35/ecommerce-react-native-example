import { PAYMENT_METHOD, PAYMENT_STATUS } from "../constants/payment";

export function normalizePaymentType(paymentType) {
  if (paymentType === PAYMENT_METHOD.COD || paymentType === PAYMENT_METHOD.CARD) {
    return paymentType;
  }
  return PAYMENT_METHOD.COD;
}

export function normalizePaymentStatus(paymentStatus, paymentType) {
  if (
    paymentStatus === PAYMENT_STATUS.PAY_ON_DELIVERY ||
    paymentStatus === PAYMENT_STATUS.PAID
  ) {
    return paymentStatus;
  }
  if (paymentType === PAYMENT_METHOD.CARD) {
    return PAYMENT_STATUS.PAID;
  }
  return PAYMENT_STATUS.PAY_ON_DELIVERY;
}

export function getPaymentMethodLabel(paymentType) {
  const normalized = normalizePaymentType(paymentType);
  if (normalized === PAYMENT_METHOD.CARD) {
    return "Pay with Card";
  }
  return "Cash on Delivery";
}

export function getPaymentStatusLabel(paymentStatus, paymentType) {
  const normalizedStatus = normalizePaymentStatus(paymentStatus, paymentType);
  if (normalizedStatus === PAYMENT_STATUS.PAID) {
    return "Payment successful";
  }
  return "Pay on delivery";
}
