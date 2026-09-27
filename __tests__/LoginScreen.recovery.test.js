import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import LoginScreen from "../screens/auth/LoginScreen";
import * as api from "../api";
import { RECOVERY_MESSAGES } from "../utils/passwordRecovery";

jest.mock("../api", () => ({
  login: jest.fn(),
  isPasswordRecoveryEnabled: jest.fn(),
}));
jest.mock("../utils/session", () => ({ setSession: jest.fn() }));
jest.mock("../components/ConnectionAlert/ConnectionAlert", () => ({
  __esModule: true,
  default: ({ children }) => children,
}));
jest.mock("react-native-progress-dialog", () => ({
  __esModule: true,
  default: () => null,
}));

const makeNavigation = () => ({ navigate: jest.fn(), replace: jest.fn() });

describe("LoginScreen after password recovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.isPasswordRecoveryEnabled.mockReturnValue(true);
  });

  it("shows the success notice and prefills the email", () => {
    render(
      <LoginScreen
        navigation={makeNavigation()}
        route={{
          params: { successMessage: RECOVERY_MESSAGES.success, email: "user@easybuy.com" },
        }}
      />
    );
    expect(screen.getByTestId("login-success-alert-message").props.children).toBe(
      RECOVERY_MESSAGES.success
    );
    expect(screen.getByTestId("login-email-input").props.value).toBe("user@easybuy.com");
  });

  it("clears the notice when the user submits", () => {
    render(
      <LoginScreen
        navigation={makeNavigation()}
        route={{ params: { successMessage: RECOVERY_MESSAGES.success } }}
      />
    );
    fireEvent.press(screen.getByTestId("login-submit-btn"));
    expect(screen.queryByTestId("login-success-alert-message")).toBeNull();
  });

  it("does not apply the new password rule to existing passwords", () => {
    api.login.mockReturnValue(new Promise(() => {}));
    render(<LoginScreen navigation={makeNavigation()} />);
    fireEvent.changeText(screen.getByTestId("login-email-input"), "user@easybuy.com");
    fireEvent.changeText(screen.getByTestId("login-password-input"), "user1");
    fireEvent.press(screen.getByTestId("login-submit-btn"));
    expect(api.login).toHaveBeenCalledWith("user@easybuy.com", "user1");
  });

  it("links to recovery when the flag is on", () => {
    const navigation = makeNavigation();
    render(<LoginScreen navigation={navigation} />);
    fireEvent.press(screen.getByTestId("login-forget-password"));
    expect(navigation.navigate).toHaveBeenCalledWith("forgetpassword");
  });

  it("hides the recovery link when the flag is off", () => {
    api.isPasswordRecoveryEnabled.mockReturnValue(false);
    render(<LoginScreen navigation={makeNavigation()} />);
    expect(screen.queryByTestId("login-forget-password")).toBeNull();
  });
});
