import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import ConnectionAlert from "../../components/ConnectionAlert/ConnectionAlert";
import * as api from "../../api";

function validateResetForm({ otp, newPassword, confirmPassword }) {
  if (!otp || !/^\d{6}$/.test(otp)) {
    return "Please enter the 6-digit code from your email";
  }
  if (!newPassword || newPassword.length < 6) {
    return "Password must be 6 characters long";
  }
  if (newPassword !== confirmPassword) {
    return "Password does not match";
  }
  return null;
}

const ResetForgottenPasswordScreen = ({ navigation, route }) => {
  const email = route.params?.email || "";
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);

  const resetPasswordHandle = async () => {
    setIsLoading(true);
    const validationError = validateResetForm({ otp, newPassword, confirmPassword });
    if (validationError) {
      setAlertType("error");
      setMessage(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const result = await api.resetForgottenPassword({
        email,
        otp,
        newPassword,
      });

      if (result.success) {
        setIsLoading(false);
        navigation.replace("login", {
          passwordResetMessage:
            "Password reset successfully. Please log in with your new password.",
        });
      } else {
        setAlertType("error");
        setMessage(result.message || "Failed to reset password");
        setIsLoading(false);
      }
    } catch (err) {
      setAlertType("error");
      setMessage(err.message || "Failed to reset password");
      setIsLoading(false);
    }
  };

  return (
    <ConnectionAlert onChange={() => {}}>
      <View style={styles.container} testID="reset-forgotten-password-screen">
        <ProgressDialog visible={isLoading} label={"Resetting password ..."} />
        <View style={styles.TopBarContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="reset-password-back-btn"
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.screenNameContainer}>
          <Text style={styles.screenNameText} testID="reset-password-heading">
            Enter Reset Code
          </Text>
          <Text style={styles.screenNameParagraph} testID="reset-password-instruction">
            Enter the 6-digit code from your email. Codes expire in 10 minutes.
          </Text>
          {email ? (
            <Text style={styles.emailText} testID="reset-password-email">
              {email}
            </Text>
          ) : null}
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={message} type={alertType} testID="reset-password-alert" />
          <CustomInput
            value={otp}
            setValue={setOtp}
            placeholder={"6-digit code"}
            keyboardType="number-pad"
            maxLength={6}
            testID="reset-password-otp-input"
          />
          <CustomInput
            value={newPassword}
            setValue={setNewPassword}
            secureTextEntry={true}
            placeholder={"New Password"}
            testID="reset-password-new-input"
          />
          <CustomInput
            value={confirmPassword}
            setValue={setConfirmPassword}
            secureTextEntry={true}
            placeholder={"Confirm Password"}
            testID="reset-password-confirm-input"
          />
        </View>
        <CustomButton
          text={"Reset Password"}
          onPress={resetPasswordHandle}
          radius={5}
          testID="reset-password-submit-btn"
          disabled={isLoading}
        />
      </View>
    </ConnectionAlert>
  );
};

export default ResetForgottenPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    padding: 20,
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 5,
    fontSize: 15,
  },
  emailText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.primary_shadow,
  },
  formContainer: {
    marginTop: 10,
    marginBottom: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    flexDirecion: "row",
  },
});
