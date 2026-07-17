import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";

const ResetPasswordScreen = ({ navigation, route }) => {
  const initialToken = route.params?.token || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenStatus, setTokenStatus] = useState(
    initialToken ? "checking" : "invalid"
  );
  const [emailHint, setEmailHint] = useState("");

  const verifyToken = async () => {
    if (!initialToken) {
      setTokenStatus("invalid");
      setAlertType("error");
      setMessage("Reset link is invalid");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(
        `${network.serverip}/password-reset/verify?token=${encodeURIComponent(initialToken)}`
      );
      const result = await response.json();
      if (result.success && result.data?.valid) {
        setTokenStatus("valid");
        setEmailHint(result.data.emailHint || "");
        setAlertType("success");
        setMessage(result.message || "Reset link is valid");
      } else if (response.status === 410) {
        if (result.code === "RESET_TOKEN_USED") {
          setTokenStatus("used");
        } else {
          setTokenStatus("expired");
        }
        setAlertType("error");
        setMessage(result.message);
      } else {
        setTokenStatus("invalid");
        setAlertType("error");
        setMessage(result.message || "Reset link is invalid");
      }
    } catch (error) {
      setTokenStatus("invalid");
      setAlertType("error");
      setMessage("Unable to verify reset link. Please try again.");
      console.log("error", error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const resetPasswordHandle = () => {
    if (!initialToken) {
      setAlertType("error");
      return setMessage("Reset token is required");
    }
    if (newPassword == "") {
      setAlertType("error");
      return setMessage("Please enter your password");
    }
    if (newPassword.length < 6) {
      setAlertType("error");
      return setMessage("Password must be 6 characters long");
    }
    if (confirmPassword == "") {
      setAlertType("error");
      return setMessage("Please confirm your password");
    }
    if (newPassword != confirmPassword) {
      setAlertType("error");
      return setMessage("Password not matched");
    }

    setIsSubmitting(true);
    fetch(network.serverip + "/password-reset/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: initialToken, newPassword, confirmPassword }),
    })
      .then((response) => response.json().then((result) => ({ response, result })))
      .then(({ response, result }) => {
        setIsSubmitting(false);
        if (result.success) {
          setTokenStatus("success");
          setAlertType("success");
          setMessage(
            result.message ||
              "Password reset successfully. Please login with your new password."
          );
        } else {
          setAlertType("error");
          setMessage(result.message || "Unable to reset password. Please try again.");
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        setAlertType("error");
        setMessage("Unable to reset password. Please try again.");
        console.log("error", error.message);
      });
  };

  const canEditPassword = tokenStatus === "valid";
  const showRequestNewLink =
    tokenStatus === "invalid" || tokenStatus === "expired" || tokenStatus === "used";

  return (
    <View style={styles.container} testID="reset-password-screen">
      <ProgressDialog
        visible={isVerifying || isSubmitting}
        label={isVerifying ? "Verifying reset link ..." : "Resetting password ..."}
      />
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="reset-password-back-btn"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="reset-password-heading">
            Set New Password
          </Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="reset-password-instruction">
            {emailHint
              ? `Create a new password for ${emailHint}`
              : "Create a new password for your account"}
          </Text>
        </View>
      </View>
      <View style={styles.formContainer}>
        <CustomAlert
          message={message}
          type={alertType}
          testID="reset-password-alert"
        />
        {canEditPassword ? (
          <>
            <CustomInput
              value={newPassword}
              setValue={setNewPassword}
              placeholder={"New Password"}
              secureTextEntry={true}
              testID="reset-password-new-input"
            />
            <CustomInput
              value={confirmPassword}
              setValue={setConfirmPassword}
              placeholder={"Confirm New Password"}
              secureTextEntry={true}
              testID="reset-password-confirm-input"
            />
          </>
        ) : null}
      </View>
      {tokenStatus === "success" ? (
        <CustomButton
          text={"Return to Login"}
          onPress={() => navigation.navigate("login")}
          radius={5}
          testID="reset-password-login-btn"
        />
      ) : canEditPassword ? (
        <CustomButton
          text={"Reset Password"}
          onPress={resetPasswordHandle}
          radius={5}
          testID="reset-password-submit-btn"
        />
      ) : null}
      {showRequestNewLink ? (
        <View style={styles.secondaryActions}>
          <CustomButton
            text={"Request New Reset Link"}
            onPress={() => navigation.navigate("forgetpassword")}
            radius={5}
            testID="reset-password-request-new-btn"
          />
          <Text
            onPress={() => navigation.navigate("login")}
            style={styles.loginLink}
            testID="reset-password-login-link"
          >
            Return to login
          </Text>
        </View>
      ) : null}
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
  formContainer: {
    marginTop: 10,
    marginBottom: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    flexDirecion: "row",
  },
  secondaryActions: {
    marginTop: 10,
    width: "100%",
  },
  loginLink: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
});
