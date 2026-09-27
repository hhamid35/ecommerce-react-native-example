import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import SetNewPasswordScreen from "../screens/auth/SetNewPasswordScreen";
import * as api from "../api";
import { RECOVERY_MESSAGES } from "../utils/passwordRecovery";
import { PASSWORD_RULE_TEXT } from "../utils/passwordPolicy";

jest.mock("../api", () => ({
  setNewPassword: jest.fn(),
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
const TOKEN = "a".repeat(64);

const renderScreen = (params = { email: EMAIL, resetToken: TOKEN }) => {
  const navigation = { navigate: jest.fn(), reset: jest.fn(), goBack: jest.fn() };
  render(<SetNewPasswordScreen navigation={navigation} route={{ params }} />);
  return navigation;
};

const alertText = () =>
  screen.queryByTestId("set-password-alert-message")?.props.children;

const submit = (password, confirm = password) => {
  fireEvent.changeText(screen.getByTestId("set-password-new-input"), password);
  fireEvent.changeText(screen.getByTestId("set-password-confirm-input"), confirm);
  fireEvent.press(screen.getByTestId("set-password-submit-btn"));
};

describe("SetNewPasswordScreen", () => {
  let warnSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => warnSpy.mockRestore());

  it("shows the shared password rule", () => {
    renderScreen();
    expect(screen.getByTestId("set-password-rule").props.children).toBe(PASSWORD_RULE_TEXT);
  });

  it.each([
    ["abc123", "abc123", PASSWORD_RULE_TEXT],
    ["abcdefg1", "abcdefg2", "Passwords do not match"],
  ])("rejects %p / %p without calling the api", (password, confirm, message) => {
    renderScreen();
    submit(password, confirm);
    expect(alertText()).toBe(message);
    expect(api.setNewPassword).not.toHaveBeenCalled();
  });

  it("resets the stack to login with the success message", async () => {
    api.setNewPassword.mockResolvedValue({ success: true });
    const navigation = renderScreen();
    submit("abcdefg1");
    await waitFor(() =>
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [
          {
            name: "login",
            params: { successMessage: RECOVERY_MESSAGES.success, email: EMAIL },
          },
        ],
      })
    );
    expect(api.setNewPassword).toHaveBeenCalledWith(TOKEN, "abcdefg1");
  });

  it("keeps the token usable after a server policy rejection", async () => {
    api.setNewPassword.mockResolvedValue({
      success: false,
      err: "PASSWORD_POLICY",
      message: PASSWORD_RULE_TEXT,
    });
    renderScreen();
    submit("abcdefg1");
    await waitFor(() => expect(alertText()).toBe(PASSWORD_RULE_TEXT));
    expect(screen.getByTestId("set-password-submit-btn")).toBeTruthy();
    expect(screen.getByTestId("set-password-new-input").props.value).toBe("abcdefg1");
  });

  it("requires a restart when the reset token is invalid", async () => {
    api.setNewPassword.mockResolvedValue({ success: false, err: "RESET_TOKEN_INVALID" });
    const navigation = renderScreen();
    submit("abcdefg1");
    await waitFor(() => expect(alertText()).toBe(RECOVERY_MESSAGES.tokenInvalid));
    fireEvent.press(screen.getByTestId("set-password-restart-btn"));
    expect(navigation.navigate).toHaveBeenCalledWith("forgetpassword", { email: EMAIL });
  });

  it("shows the network message and keeps both inputs when offline", async () => {
    api.setNewPassword.mockRejectedValue(new TypeError("Network request failed"));
    renderScreen();
    submit("abcdefg1");
    await waitFor(() => expect(alertText()).toBe(RECOVERY_MESSAGES.network));
    expect(screen.getByTestId("set-password-new-input").props.value).toBe("abcdefg1");
    expect(screen.getByTestId("set-password-confirm-input").props.value).toBe("abcdefg1");
  });

  it("asks the user to start over when the reset token is missing", () => {
    renderScreen({ email: EMAIL });
    expect(alertText()).toBe(RECOVERY_MESSAGES.tokenInvalid);
    expect(screen.queryByTestId("set-password-submit-btn")).toBeNull();
    expect(screen.getByTestId("set-password-restart-btn")).toBeTruthy();
  });
});
