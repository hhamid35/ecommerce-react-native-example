import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import * as api from "../../api";

const OTP_HINT =
  "Enter the 6-digit code from your email. Codes expire after 20 minutes.";
const PASSWORD_HINT = "Use at least 8 characters with a letter and a number.";

const ResetPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const validateResetForm = () => {
    if (!email) {
      return "Please enter your email";
    }
    if (!email.includes("@") || email.length < 6) {
      return "Email is not valid";
    }
    if (!/^\d{6}$/.test(otp)) {
      return "Please enter the 6-digit code from your email";
    }
    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return PASSWORD_HINT;
    }
    if (newPassword !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const completeResetHandle = async () => {
    const validationError = validateResetForm();
    if (validationError) {
      setAlertType("error");
      setMessage(validationError);
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      const result = await api.completePasswordReset({ email, otp, newPassword });
      if (result.success) {
        setAlertType("success");
        setMessage(
          result.message || "Password reset successfully. Please log in with your new password."
        );
        setCompleted(true);
      } else {
        setAlertType("error");
        setMessage(
          result.message || "Reset code is invalid or expired. Request a new code and try again."
        );
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setAlertType("error");
      setMessage(
        err.message || "Reset code is invalid or expired. Request a new code and try again."
      );
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.replace("login");
  };

  const requestNewCode = () => {
    navigation.navigate("forgetpassword");
  };

  return (
    <View style={styles.container} testID="reset-password-screen">
      <ProgressDialog visible={isLoading} label="Resetting password..." />
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
          {OTP_HINT}
        </Text>
        <Text style={styles.hintText} testID="reset-password-password-hint">
          {PASSWORD_HINT}
        </Text>
      </View>
      <View style={styles.formContainer}>
        <CustomAlert message={message} type={alertType} testID="reset-password-alert" />
        <CustomInput
          value={email}
          setValue={setEmail}
          placeholder={"Email Address"}
          keyboardType="email-address"
          editable={!completed}
          testID="reset-password-email-input"
        />
        <CustomInput
          value={otp}
          setValue={setOtp}
          placeholder={"6-digit code"}
          keyboardType="number-pad"
          maxLength={6}
          editable={!completed}
          testID="reset-password-otp-input"
        />
        <CustomInput
          value={newPassword}
          setValue={setNewPassword}
          placeholder={"New Password"}
          secureTextEntry={true}
          editable={!completed}
          testID="reset-password-new-input"
        />
        <CustomInput
          value={confirmPassword}
          setValue={setConfirmPassword}
          placeholder={"Confirm New Password"}
          secureTextEntry={true}
          editable={!completed}
          testID="reset-password-confirm-input"
        />
      </View>
      {completed ? (
        <CustomButton
          text={"Back to Login"}
          onPress={goToLogin}
          radius={5}
          testID="reset-password-login-btn"
        />
      ) : (
        <>
          <CustomButton
            text={"Reset Password"}
            onPress={completeResetHandle}
            radius={5}
            testID="reset-password-submit-btn"
          />
          <TouchableOpacity
            onPress={requestNewCode}
            style={styles.linkButton}
            testID="reset-password-request-new-btn"
          >
            <Text style={styles.linkText}>Request a new code</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ResetPasswordScreen;

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
  hintText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.muted,
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
  linkButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
  },
});
