export const PAYMENT_METHOD = {
  COD: "cod",
  CARD: "card",
};

export const PAYMENT_STATUS = {
  PAY_ON_DELIVERY: "pay_on_delivery",
  PAID: "paid",
};

export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHOD.COD, label: "Cash on Delivery" },
  { value: PAYMENT_METHOD.CARD, label: "Pay with Card (demo)" },
];
