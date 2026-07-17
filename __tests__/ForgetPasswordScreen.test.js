import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ForgetPasswordScreen from "../screens/auth/ForgetPasswordScreen";

jest.mock("react-native-progress-dialog", () => "ProgressDialog");
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const mockNavigate = jest.fn();

describe("ForgetPasswordScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders the recovery request screen", async () => {
    const { getByTestId } = await render(
      <ForgetPasswordScreen navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
    );

    expect(getByTestId("forget-password-screen")).toBeTruthy();
    expect(getByTestId("forget-password-submit-btn")).toBeTruthy();
    expect(getByTestId("forget-password-login-link")).toBeTruthy();
  });

  it("shows validation error when email is empty", async () => {
    const { getByTestId } = await render(
      <ForgetPasswordScreen navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
    );

    fireEvent.press(getByTestId("forget-password-submit-btn"));

    await waitFor(() => {
      expect(getByTestId("forget-password-alert-message").props.children).toBe(
        "Please enter your email"
      );
    });
  });

  it("navigates back to login from the recovery screen", async () => {
    const { getByTestId } = await render(
      <ForgetPasswordScreen navigation={{ navigate: mockNavigate, goBack: jest.fn() }} />
    );

    fireEvent.press(getByTestId("forget-password-login-link"));
    expect(mockNavigate).toHaveBeenCalledWith("login");
  });
});
