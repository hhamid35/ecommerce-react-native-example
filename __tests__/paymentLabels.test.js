import {
  normalizePaymentType,
  normalizePaymentStatus,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../utils/paymentLabels";
import { PAYMENT_METHOD, PAYMENT_STATUS } from "../constants/payment";

describe("paymentLabels", () => {
  describe("normalizePaymentType", () => {
    it("returns cod for cod", () => {
      expect(normalizePaymentType("cod")).toBe(PAYMENT_METHOD.COD);
    });

    it("returns card for card", () => {
      expect(normalizePaymentType("card")).toBe(PAYMENT_METHOD.CARD);
    });

    it("defaults to cod for missing or invalid values", () => {
      expect(normalizePaymentType(undefined)).toBe(PAYMENT_METHOD.COD);
      expect(normalizePaymentType("wallet")).toBe(PAYMENT_METHOD.COD);
    });
  });

  describe("normalizePaymentStatus", () => {
    it("returns pay_on_delivery when set", () => {
      expect(normalizePaymentStatus("pay_on_delivery", "cod")).toBe(
        PAYMENT_STATUS.PAY_ON_DELIVERY
      );
    });

    it("returns paid when set", () => {
      expect(normalizePaymentStatus("paid", "card")).toBe(PAYMENT_STATUS.PAID);
    });

    it("derives paid for card when status missing", () => {
      expect(normalizePaymentStatus(undefined, "card")).toBe(PAYMENT_STATUS.PAID);
    });

    it("derives pay_on_delivery for cod when status missing", () => {
      expect(normalizePaymentStatus(undefined, "cod")).toBe(
        PAYMENT_STATUS.PAY_ON_DELIVERY
      );
    });
  });

  describe("getPaymentMethodLabel", () => {
    it("maps cod to Cash on Delivery", () => {
      expect(getPaymentMethodLabel("cod")).toBe("Cash on Delivery");
    });

    it("maps card to Pay with Card", () => {
      expect(getPaymentMethodLabel("card")).toBe("Pay with Card");
    });
  });

  describe("getPaymentStatusLabel", () => {
    it("maps paid to Payment successful", () => {
      expect(getPaymentStatusLabel("paid", "card")).toBe("Payment successful");
    });

    it("maps pay_on_delivery to Pay on delivery", () => {
      expect(getPaymentStatusLabel("pay_on_delivery", "cod")).toBe("Pay on delivery");
    });
  });
});
