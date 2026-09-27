import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import VerifyResetCodeScreen from "../screens/auth/VerifyResetCodeScreen";
import * as api from "../api";
import { RECOVERY_MESSAGES } from "../utils/passwordRecovery";

jest.mock("../api", () => ({
  requestPasswordReset: jest.fn(),
  verifyResetCode: jest.fn(),
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

const EMAIL = "user@easybuy.com";

const makeNavigation = () => ({
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
});

const renderScreen = (params = { email: EMAIL, notice: RECOVERY_MESSAGES.requestSent }) => {
  const navigation = makeNavigation();
  render(<VerifyResetCodeScreen navigation={navigation} route={{ params }} />);
  return navigation;
};

const alertText = () =>
  screen.queryByTestId("verify-code-alert-message")?.props.children;

const enterCode = (code) => {
  fireEvent.changeText(screen.getByTestId("verify-code-input"), code);
  fireEvent.press(screen.getByTestId("verify-code-submit-btn"));
};

describe("VerifyResetCodeScreen", () => {
  let warnSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
    jest.useRealTimers();
  });

  it("shows the notice passed from the request step", () => {
    renderScreen();
    expect(alertText()).toBe(RECOVERY_MESSAGES.requestSent);
    expect(screen.getByText("Enter Code")).toBeTruthy();
  });

  it("rejects a malformed code without calling the api", () => {
    renderScreen();
    enterCode("12a4");
    expect(alertText()).toBe(RECOVERY_MESSAGES.codeFormat);
    expect(api.verifyResetCode).not.toHaveBeenCalled();
  });

  it("exchanges a valid code for a reset token and moves on", async () => {
    api.verifyResetCode.mockResolvedValue({
      success: true,
      data: { resetToken: "tok", expiresAt: "2026-01-01T00:00:00.000Z" },
    });
    const navigation = renderScreen();
    enterCode("012345");
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith("setnewpassword", {
        email: EMAIL,
        resetToken: "tok",
      })
    );
    expect(api.verifyResetCode).toHaveBeenCalledWith(EMAIL, "012345");
  });

  it("shows the incorrect-code message and lets the user retry", async () => {
    api.verifyResetCode.mockResolvedValue({ success: false, err: "RESET_CODE_INVALID" });
    renderScreen();
    enterCode("012345");
    await waitFor(() => expect(alertText()).toBe(RECOVERY_MESSAGES.codeInvalid));
    expect(screen.getByTestId("verify-code-submit-btn")).toBeTruthy();
    expect(screen.queryByTestId("verify-code-restart-btn")).toBeNull();
  });

  it.each([
    ["RESET_CODE_EXPIRED", RECOVERY_MESSAGES.codeExpired],
    ["RESET_ATTEMPTS_EXCEEDED", RECOVERY_MESSAGES.attemptsExceeded],
  ])("requires a restart after %s", async (err, message) => {
    api.verifyResetCode.mockResolvedValue({ success: false, err });
    const navigation = renderScreen();
    enterCode("012345");
    await waitFor(() => expect(alertText()).toBe(message));
    expect(screen.queryByTestId("verify-code-input")).toBeNull();
    fireEvent.press(screen.getByTestId("verify-code-restart-btn"));
    expect(navigation.navigate).toHaveBeenCalledWith("forgetpassword", { email: EMAIL });
  });

  it("shows the network message and keeps the code when offline", async () => {
    api.verifyResetCode.mockRejectedValue(new TypeError("Network request failed"));
    renderScreen();
    enterCode("012345");
    await waitFor(() => expect(alertText()).toBe(RECOVERY_MESSAGES.network));
    expect(screen.getByTestId("verify-code-input").props.value).toBe("012345");
  });

  it("blocks resend during the cooldown and allows it afterwards", async () => {
    jest.useFakeTimers();
    api.requestPasswordReset.mockResolvedValue({ success: true });
    renderScreen();
    expect(screen.getByText("Resend code in 60s")).toBeTruthy();
    fireEvent.press(screen.getByTestId("verify-code-resend-link"));
    expect(api.requestPasswordReset).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });
    expect(screen.getByText("Resend code")).toBeTruthy();
    fireEvent.press(screen.getByTestId("verify-code-resend-link"));
    await waitFor(() => expect(api.requestPasswordReset).toHaveBeenCalledWith(EMAIL));
    await waitFor(() => expect(alertText()).toBe(RECOVERY_MESSAGES.requestSent));
    expect(screen.getByText("Resend code in 60s")).toBeTruthy();
  });

  it("uses the server's retryAfterSeconds when a resend is throttled", async () => {
    jest.useFakeTimers();
    api.requestPasswordReset.mockResolvedValue({
      success: false,
      err: "RESET_THROTTLED",
      retryAfterSeconds: 42,
    });
    renderScreen();
    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });
    fireEvent.press(screen.getByTestId("verify-code-resend-link"));
    await waitFor(() => expect(alertText()).toBe(RECOVERY_MESSAGES.throttled));
    expect(screen.getByText("Resend code in 42s")).toBeTruthy();
  });

  it("asks the user to start over when the email is missing", () => {
    const navigation = renderScreen({});
    expect(alertText()).toBe(RECOVERY_MESSAGES.tokenInvalid);
    expect(screen.queryByTestId("verify-code-input")).toBeNull();
    expect(screen.queryByTestId("verify-code-resend-link")).toBeNull();
    fireEvent.press(screen.getByTestId("verify-code-restart-btn"));
    expect(navigation.navigate).toHaveBeenCalledWith("forgetpassword", { email: "" });
  });

  it("offers a different email and back to login", () => {
    const navigation = renderScreen();
    fireEvent.press(screen.getByTestId("verify-code-change-email-link"));
    expect(navigation.navigate).toHaveBeenCalledWith("forgetpassword", { email: EMAIL });
    fireEvent.press(screen.getByTestId("verify-code-login-link"));
    expect(navigation.navigate).toHaveBeenCalledWith("login");
  });
});
