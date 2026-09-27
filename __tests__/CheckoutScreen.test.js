import React from "react";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react-native";
import reducers from "../states/reducers/index";
import { addCartItem } from "../states/actionCreaters/actionCreaters";
import * as api from "../api";
import CheckoutScreen from "../screens/user/CheckoutScreen";

jest.mock("../api", () => ({ checkout: jest.fn() }));
jest.mock("react-native-progress-dialog", () => () => null);
// expo-font (pulled in by @expo/vector-icons) can't resolve its nested expo-asset
// under Jest; icons are decorative here, so render nothing.
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

const PRODUCT = {
  _id: "prod001",
  title: "Classic White T-Shirt",
  price: 19.99,
  quantity: 10,
};

const ORDER = {
  _id: "o1",
  orderId: "ORD-1",
  amount: 39.98,
  payment_type: "cod",
  payment_status: "pending",
};

const DECLINE_MESSAGE =
  "Your demo card was declined. No order was placed and your cart is unchanged. Try again or choose Cash on Delivery.";
const CANCEL_MESSAGE =
  "Payment cancelled. Your cart is unchanged — try again or choose Cash on Delivery.";

// Build a fresh store (same recipe as states/store.js) with 2 × 19.99 in the cart.
const makeStore = () => {
  const store = createStore(reducers, {}, applyMiddleware(thunk));
  store.dispatch(addCartItem(PRODUCT));
  store.dispatch(addCartItem(PRODUCT));
  return store;
};

const renderCheckout = () => {
  const store = makeStore();
  const navigation = { replace: jest.fn(), goBack: jest.fn() };
  render(
    <Provider store={store}>
      <CheckoutScreen navigation={navigation} route={{}} />
    </Provider>
  );
  // fill the shipping address through the address modal
  fireEvent.press(screen.getByTestId("checkout-address-btn"));
  fireEvent.changeText(screen.getByTestId("checkout-country-input"), "Canada");
  fireEvent.changeText(screen.getByTestId("checkout-city-input"), "Toronto");
  fireEvent.changeText(screen.getByTestId("checkout-street-input"), "123 Main");
  fireEvent.changeText(screen.getByTestId("checkout-zipcode-input"), "12345");
  fireEvent.press(screen.getByTestId("checkout-save-address-btn"));
  return { store, navigation };
};

const chooseCardAndPay = (last4) => {
  fireEvent.press(screen.getByTestId("checkout-payment-selector-option-card_demo"));
  fireEvent.press(screen.getByTestId("checkout-submit-btn"));
  fireEvent.press(screen.getByTestId(`checkout-payment-sheet-card-${last4}`));
  fireEvent.press(screen.getByTestId("checkout-payment-sheet-pay-btn"));
};

// deferred promise so a test controls when api.checkout resolves
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe("CheckoutScreen payments", () => {
  let savedFlag;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    savedFlag = process.env.EXPO_PUBLIC_DIGITAL_PAYMENTS;
    delete process.env.EXPO_PUBLIC_DIGITAL_PAYMENTS;
  });

  afterEach(() => {
    console.log.mockRestore();
    if (savedFlag === undefined) delete process.env.EXPO_PUBLIC_DIGITAL_PAYMENTS;
    else process.env.EXPO_PUBLIC_DIGITAL_PAYMENTS = savedFlag;
  });

  it("defaults to Cash on Delivery with the selector shown", () => {
    renderCheckout();
    expect(screen.getByTestId("checkout-method-value")).toHaveTextContent(
      "Cash on Delivery"
    );
    expect(
      screen.getByTestId("checkout-payment-selector-option-cod")
    ).toBeChecked();
    expect(screen.getByTestId("checkout-submit-btn-text")).toHaveTextContent(
      "Submit Order"
    );
  });

  it("places a COD order directly and goes to the confirmation", async () => {
    api.checkout.mockResolvedValue({ success: true, data: ORDER });
    const { store, navigation } = renderCheckout();

    fireEvent.press(screen.getByTestId("checkout-submit-btn"));

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith("orderconfirm", {
        order: ORDER,
      })
    );
    expect(api.checkout).toHaveBeenCalledTimes(1);
    const payload = api.checkout.mock.calls[0][0];
    expect(payload.payment_type).toBe("cod");
    expect(payload.idempotency_key).toMatch(/^chk-/);
    expect(payload.payment).toBeUndefined();
    expect(store.getState().product).toHaveLength(0);
  });

  it("sends the exact 2-decimal amount", async () => {
    api.checkout.mockResolvedValue({ success: true, data: ORDER });
    renderCheckout();
    fireEvent.press(screen.getByTestId("checkout-submit-btn"));
    await waitFor(() => expect(api.checkout).toHaveBeenCalled());
    expect(api.checkout.mock.calls[0][0].amount).toBe(39.98);
  });

  it("pays by demo card and goes to the confirmation", async () => {
    const paid = { ...ORDER, payment_type: "card_demo", payment_status: "paid" };
    api.checkout.mockResolvedValue({ success: true, data: paid });
    const { store, navigation } = renderCheckout();

    fireEvent.press(screen.getByTestId("checkout-payment-selector-option-card_demo"));
    expect(screen.getByTestId("checkout-method-value")).toHaveTextContent(
      "Card (demo)"
    );
    expect(screen.getByTestId("checkout-submit-btn-text")).toHaveTextContent(
      "Continue to Payment"
    );
    fireEvent.press(screen.getByTestId("checkout-submit-btn"));
    expect(api.checkout).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId("checkout-payment-sheet-card-4242"));
    fireEvent.press(screen.getByTestId("checkout-payment-sheet-pay-btn"));

    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith("orderconfirm", {
        order: paid,
      })
    );
    const payload = api.checkout.mock.calls[0][0];
    expect(payload.payment_type).toBe("card_demo");
    expect(payload.payment).toEqual({ token: "tok_demo_success" });
    expect(store.getState().product).toHaveLength(0);
  });

  it("keeps the cart and shows the decline message", async () => {
    api.checkout.mockResolvedValue({
      success: false,
      code: "payment_declined",
      message: "Your demo card was declined. No order was placed.",
    });
    const { store, navigation } = renderCheckout();

    chooseCardAndPay("0002");

    await waitFor(() =>
      expect(screen.getByTestId("checkout-alert-message")).toHaveTextContent(
        DECLINE_MESSAGE
      )
    );
    expect(api.checkout.mock.calls[0][0].payment).toEqual({
      token: "tok_demo_decline",
    });
    expect(store.getState().product).toHaveLength(1);
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("cancels without calling the API", () => {
    const { store } = renderCheckout();

    fireEvent.press(screen.getByTestId("checkout-payment-selector-option-card_demo"));
    fireEvent.press(screen.getByTestId("checkout-submit-btn"));
    fireEvent.press(screen.getByTestId("checkout-payment-sheet-cancel-btn"));

    expect(api.checkout).not.toHaveBeenCalled();
    expect(screen.getByTestId("checkout-alert-message")).toHaveTextContent(
      CANCEL_MESSAGE
    );
    expect(store.getState().product).toHaveLength(1);
  });

  it("submits a COD order only once on a double press", () => {
    api.checkout.mockReturnValue(new Promise(() => {}));
    renderCheckout();
    const submit = screen.getByTestId("checkout-submit-btn");
    fireEvent.press(submit);
    fireEvent.press(submit);
    expect(api.checkout).toHaveBeenCalledTimes(1);
  });

  it("submits a card payment only once on a double press", () => {
    api.checkout.mockReturnValue(new Promise(() => {}));
    renderCheckout();
    fireEvent.press(screen.getByTestId("checkout-payment-selector-option-card_demo"));
    fireEvent.press(screen.getByTestId("checkout-submit-btn"));
    fireEvent.press(screen.getByTestId("checkout-payment-sheet-card-4242"));
    const pay = screen.getByTestId("checkout-payment-sheet-pay-btn");
    fireEvent.press(pay);
    fireEvent.press(pay);
    expect(api.checkout).toHaveBeenCalledTimes(1);
  });

  it("reuses the idempotency key after a network error", async () => {
    api.checkout.mockRejectedValueOnce(new Error("Network request failed"));
    const second = deferred();
    api.checkout.mockReturnValueOnce(second.promise);
    renderCheckout();

    fireEvent.press(screen.getByTestId("checkout-submit-btn"));
    await waitFor(() =>
      expect(screen.getByTestId("checkout-alert-message")).toHaveTextContent(
        /couldn't reach the store/
      )
    );
    fireEvent.press(screen.getByTestId("checkout-submit-btn"));

    expect(api.checkout).toHaveBeenCalledTimes(2);
    expect(api.checkout.mock.calls[1][0].idempotency_key).toBe(
      api.checkout.mock.calls[0][0].idempotency_key
    );
  });

  it("uses a new idempotency key after a decline", async () => {
    api.checkout.mockResolvedValueOnce({
      success: false,
      code: "payment_declined",
    });
    api.checkout.mockReturnValueOnce(new Promise(() => {}));
    renderCheckout();

    chooseCardAndPay("0002");
    await waitFor(() =>
      expect(screen.getByTestId("checkout-alert-message")).toHaveTextContent(
        DECLINE_MESSAGE
      )
    );
    fireEvent.press(screen.getByTestId("checkout-submit-btn"));
    fireEvent.press(screen.getByTestId("checkout-payment-sheet-card-4242"));
    fireEvent.press(screen.getByTestId("checkout-payment-sheet-pay-btn"));

    expect(api.checkout).toHaveBeenCalledTimes(2);
    expect(api.checkout.mock.calls[1][0].idempotency_key).not.toBe(
      api.checkout.mock.calls[0][0].idempotency_key
    );
  });

  it("hides the payment selector when digital payments are off", () => {
    process.env.EXPO_PUBLIC_DIGITAL_PAYMENTS = "false";
    renderCheckout();
    expect(screen.queryByTestId("checkout-payment-selector")).toBeNull();
    expect(screen.getByTestId("checkout-method-value")).toHaveTextContent(
      "Cash on Delivery"
    );
  });
});
