import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";

jest.mock("react-native-progress-dialog", () => "ProgressDialog");
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const mockNavigate = jest.fn();

describe("ResetPasswordScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders the reset password screen", async () => {
    global.fetch.mockResolvedValue({
      status: 400,
      json: async () => ({
        success: false,
        message: "Reset link is invalid",
      }),
    });

    const { getByTestId } = await render(
      <ResetPasswordScreen
        navigation={{ navigate: mockNavigate, goBack: jest.fn() }}
        route={{ params: { token: "bad-token" } }}
      />
    );

    expect(getByTestId("reset-password-screen")).toBeTruthy();
  });

  it("shows invalid token state after verification", async () => {
    global.fetch.mockResolvedValue({
      status: 400,
      json: async () => ({
        success: false,
        message: "Reset link is invalid",
      }),
    });

    const { getByTestId } = await render(
      <ResetPasswordScreen
        navigation={{ navigate: mockNavigate, goBack: jest.fn() }}
        route={{ params: { token: "bad-token" } }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("reset-password-alert-message").props.children).toBe(
        "Reset link is invalid"
      );
    });
    expect(getByTestId("reset-password-request-new-btn")).toBeTruthy();
  });

  it("shows expired token messaging", async () => {
    global.fetch.mockResolvedValue({
      status: 410,
      json: async () => ({
        success: false,
        message: "Reset link has expired. Please request a new one.",
        code: "RESET_TOKEN_EXPIRED",
      }),
    });

    const { getByTestId } = await render(
      <ResetPasswordScreen
        navigation={{ navigate: mockNavigate, goBack: jest.fn() }}
        route={{ params: { token: "expired-token" } }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("reset-password-alert-message").props.children).toBe(
        "Reset link has expired. Please request a new one."
      );
    });
  });

  it("routes to forgot-password when requesting a new link", async () => {
    global.fetch.mockResolvedValue({
      status: 410,
      json: async () => ({
        success: false,
        message: "Reset link has expired. Please request a new one.",
        code: "RESET_TOKEN_EXPIRED",
      }),
    });

    const { getByTestId } = await render(
      <ResetPasswordScreen
        navigation={{ navigate: mockNavigate, goBack: jest.fn() }}
        route={{ params: { token: "expired-token" } }}
      />
    );

    await waitFor(() => {
      expect(getByTestId("reset-password-request-new-btn")).toBeTruthy();
    });

    fireEvent.press(getByTestId("reset-password-request-new-btn"));
    expect(mockNavigate).toHaveBeenCalledWith("forgetpassword");
  });
});
