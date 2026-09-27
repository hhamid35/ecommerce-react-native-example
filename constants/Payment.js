// Single source of payment enums, demo test cards and the digital-payment switch.

export const PAYMENT_METHODS = { COD: "cod", CARD_DEMO: "card_demo" };

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

// Fixed test cards: the demo sheet offers these instead of text inputs, so no
// real card data can ever be typed. Tokens are public constants, not secrets.
export const DEMO_CARDS = [
  {
    token: "tok_demo_success",
    brand: "Visa",
    last4: "4242",
    label: "Test card •••• 4242",
    hint: "Payment succeeds",
  },
  {
    token: "tok_demo_decline",
    brand: "Visa",
    last4: "0002",
    label: "Test card •••• 0002",
    hint: "Payment is declined",
  },
];

export const PAYMENT_METHOD_OPTIONS = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives",
  },
  {
    value: "card_demo",
    label: "Card (demo)",
    description: "Simulated card payment — no money is charged",
  },
];

//method to decide whether the digital (demo card) option is offered at checkout.
// Defaults on only for the bundled mock-server (no EXPO_PUBLIC_API_URL), so a
// backend that doesn't know the payment contract never receives card_demo orders.
export function isDigitalPaymentsEnabled() {
  // Read each variable as a literal process.env.EXPO_PUBLIC_* access so Expo can
  // inline it at build time (same guard as api/config.js).
  const hasEnv = typeof process !== "undefined" && process.env;
  const flag = hasEnv && process.env.EXPO_PUBLIC_DIGITAL_PAYMENTS;
  const apiUrl = hasEnv && process.env.EXPO_PUBLIC_API_URL;

  if (flag === "true") return true;
  if (flag === "false") return false;

  return !apiUrl;
}
