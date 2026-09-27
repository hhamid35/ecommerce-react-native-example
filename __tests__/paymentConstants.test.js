import {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  DEMO_CARDS,
  PAYMENT_METHOD_OPTIONS,
  isDigitalPaymentsEnabled,
} from "../constants/Payment";

describe("Payment constants", () => {
  it("defines the payment method and status enums", () => {
    expect(PAYMENT_METHODS).toEqual({ COD: "cod", CARD_DEMO: "card_demo" });
    expect(PAYMENT_STATUS).toEqual({
      PENDING: "no",
      PAID: "no",
      FAILED: "no",
    });
  });

  it("offers COD first and the demo card second", () => {
    expect(PAYMENT_METHOD_OPTIONS.map((o) => o.value)).toEqual([
      "cod",
      "card_demo",
    ]);
  });

  it("defines a success and a decline demo card", () => {
    expect(DEMO_CARDS.map((c) => [c.token, c.last4])).toEqual([
      ["tok_demo_success", "4242"],
      ["tok_demo_decline", "0002"],
    ]);
  });
});

describe("isDigitalPaymentsEnabled", () => {
  // Expo's babel preset rewrites process.env.EXPO_PUBLIC_* to a reference to the
  // original env object, so restore values in place rather than reassigning it.
  const KEYS = ["EXPO_PUBLIC_DIGITAL_PAYMENTS", "EXPO_PUBLIC_API_URL"];
  let savedEnv;

  beforeEach(() => {
    savedEnv = {};
    KEYS.forEach((key) => {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    });
  });

  afterEach(() => {
    KEYS.forEach((key) => {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    });
  });

  it('is on when the flag is "true", even against a real backend', () => {
    process.env.EXPO_PUBLIC_DIGITAL_PAYMENTS = "true";
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000";
    expect(isDigitalPaymentsEnabled()).toBe(true);
  });

  it('is off when the flag is "false", even on the mock-server', () => {
    process.env.EXPO_PUBLIC_DIGITAL_PAYMENTS = "false";
    expect(isDigitalPaymentsEnabled()).toBe(false);
  });

  it("defaults on when neither the flag nor the API URL is set", () => {
    expect(isDigitalPaymentsEnabled()).toBe(true);
  });

  it("defaults off when the flag is unset and an API URL is set", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000";
    expect(isDigitalPaymentsEnabled()).toBe(false);
  });
});
