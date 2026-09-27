import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import ForgetPasswordScreen from "../screens/auth/ForgetPasswordScreen";
import * as api from "../api";
import { RECOVERY_MESSAGES } from "../utils/passwordRecovery";

jest.mock("../api", () => ({
  requestPasswordReset: jest.fn(),
}));
jest.mock("../components/ConnectionAlert/ConnectionAlert", () => ({
  __esModule: true,
  default: ({ children }) => children,
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock("react-native-progress-dialog", () => ({
  __esModule: true,
  default: () => null,
}));

const makeNavigation = () => ({
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
});

const alertText = () =>
  screen.queryByTestId("forget-password-alert-message")?.props.children;

describe("ForgetPasswordScreen", () => {
  let warnSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warnSpy.mockRestore());

  it("keeps the existing test IDs and shows the new copy", () => {
    render(<ForgetPasswordScreen navigation={makeNavigation()} />);
    expect(screen.getByTestId("forget-password-screen")).toBeTruthy();
    expect(screen.getByTestId("forget-password-back-btn")).toBeTruthy();
    expect(screen.getByTestId("forget-password-heading")).toBeTruthy();
    expect(screen.getByTestId("forget-password-instruction")).toBeTruthy();
    expect(screen.getByTestId("forget-password-email-input")).toBeTruthy();
    expect(screen.getByText("Send Code")).toBeTruthy();
  });

  it.each([
    ["", "Please enter your email"],
    ["user@easybuy", "Please enter a valid email address"],
  ])("shows a validation message for %p and sends no request", (email, message) => {
    render(<ForgetPasswordScreen navigation={makeNavigation()} />);
    fireEvent.changeText(screen.getByTestId("forget-password-email-input"), email);
    fireEvent.press(screen.getByTestId("forget-password-submit-btn"));
    expect(alertText()).toBe(message);
    expect(api.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("requests a code and moves on with the neutral notice", async () => {
    api.requestPasswordReset.mockResolvedValue({ success: true, message: "x" });
    const navigation = makeNavigation();
    render(<ForgetPasswordScreen navigation={navigation} />);
    fireEvent.changeText(
      screen.getByTestId("forget-password-email-input"),
      "  User@EasyBuy.com "
    );
    fireEvent.press(screen.getByTestId("forget-password-submit-btn"));
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith("verifyresetcode", {
        email: "user@easybuy.com",
        notice: RECOVERY_MESSAGES.requestSent,
      })
    );
    expect(api.requestPasswordReset).toHaveBeenCalledWith("user@easybuy.com");
  });

  it("moves on with the throttled notice when rate limited", async () => {
    api.requestPasswordReset.mockResolvedValue({
      success: false,
      err: "RESET_THROTTLED",
      retryAfterSeconds: 30,
    });
    const navigation = makeNavigation();
    render(<ForgetPasswordScreen navigation={navigation} />);
    fireEvent.changeText(
      screen.getByTestId("forget-password-email-input"),
      "user@easybuy.com"
    );
    fireEvent.press(screen.getByTestId("forget-password-submit-btn"));
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith("verifyresetcode", {
        email: "user@easybuy.com",
        notice: RECOVERY_MESSAGES.throttled,
      })
    );
  });

  it("shows the network message and keeps the email when offline", async () => {
    api.requestPasswordReset.mockRejectedValue(new TypeError("Network request failed"));
    const navigation = makeNavigation();
    render(<ForgetPasswordScreen navigation={navigation} />);
    fireEvent.changeText(
      screen.getByTestId("forget-password-email-input"),
      "user@easybuy.com"
    );
    fireEvent.press(screen.getByTestId("forget-password-submit-btn"));
    await waitFor(() => expect(alertText()).toBe(RECOVERY_MESSAGES.network));
    expect(screen.getByTestId("forget-password-email-input").props.value).toBe(
      "user@easybuy.com"
    );
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("goes back to login from the link", () => {
    const navigation = makeNavigation();
    render(<ForgetPasswordScreen navigation={navigation} />);
    fireEvent.press(screen.getByTestId("forget-password-login-link"));
    expect(navigation.navigate).toHaveBeenCalledWith("login");
  });
});
