import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ConnectionAlert from "../../components/ConnectionAlert/ConnectionAlert";
import * as api from "../../api";
import {
  CODE_EXPIRY_MINUTES,
  RECOVERY_MESSAGES,
  RESEND_COOLDOWN_SECONDS,
  RESET_CODE_LENGTH,
  isRestartRequired,
  messageForRecoveryError,
  validateResetCode,
} from "../../utils/passwordRecovery";

const VerifyResetCodeScreen = ({ navigation, route }) => {
  const email = route?.params?.email ?? "";
  const notice = route?.params?.notice ?? "";
  const [code, setCode] = useState("");
  // Without an email (e.g. after a web refresh) the only way on is to start over.
  const [error, setError] = useState(
    email ? notice : RECOVERY_MESSAGES.tokenInvalid
  );
  const [alertType, setAlertType] = useState(
    email && notice ? "success" : "error"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Verifying ...");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [restartRequired, setRestartRequired] = useState(!email);

  // Tick the resend cooldown down once a second until it reaches 0.
  const isCoolingDown = cooldown > 0;
  useEffect(() => {
    if (!isCoolingDown) return;
    const timer = setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCoolingDown]);

  const showError = (message) => {
    setAlertType("error");
    setError(message);
  };

  // method to exchange the emailed code for a single-use reset token
  const verifyHandle = async () => {
    const codeError = validateResetCode(code);
    if (codeError) return showError(codeError);
    setLoadingLabel("Verifying ...");
    setIsLoading(true);
    setError("");
    try {
      const result = await api.verifyResetCode(email, code.trim());
      if (result.success && result.data?.resetToken) {
        setCode("");
        navigation.navigate("setnewpassword", {
          email,
          resetToken: result.data.resetToken,
        });
      } else {
        showError(messageForRecoveryError(result));
        setRestartRequired(isRestartRequired(result.err));
      }
    } catch (err) {
      console.warn("[password-reset] network error", err?.message);
      showError(RECOVERY_MESSAGES.network);
    } finally {
      setIsLoading(false);
    }
  };

  // method to request a fresh code, honouring the cooldown
  const resendHandle = async () => {
    if (cooldown > 0 || isLoading) return;
    setLoadingLabel("Sending ...");
    setIsLoading(true);
    try {
      const result = await api.requestPasswordReset(email);
      if (result.success) {
        setAlertType("success");
        setError(RECOVERY_MESSAGES.requestSent);
        setCode("");
        setRestartRequired(false);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else if (result.err === "RESET_THROTTLED") {
        showError(RECOVERY_MESSAGES.throttled);
        setCooldown(result.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS);
      } else {
        showError(messageForRecoveryError(result));
      }
    } catch (err) {
      console.warn("[password-reset] network error", err?.message);
      showError(RECOVERY_MESSAGES.network);
    } finally {
      setIsLoading(false);
    }
  };

  const restartHandle = () => {
    navigation.navigate("forgetpassword", { email });
  };

  return (
    <ConnectionAlert onChange={() => {}}>
      <View style={styles.container} testID="verify-code-screen">
        <ProgressDialog visible={isLoading} label={loadingLabel} />
        <View style={styles.TopBarContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            testID="verify-code-back-btn"
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
            <Text style={styles.screenNameText} testID="verify-code-heading">Enter Code</Text>
          </View>
          <View>
            <Text style={styles.screenNameParagraph} testID="verify-code-instruction">
              We sent a {RESET_CODE_LENGTH}-digit code to {email} if an account
              exists. It expires in {CODE_EXPIRY_MINUTES} minutes. Check your
              spam folder if you don't see it.
            </Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={error} type={alertType} testID="verify-code-alert" />
          {!restartRequired && (
            <CustomInput
              value={code}
              setValue={setCode}
              placeholder={"6-digit code"}
              placeholderTextColor={colors.muted}
              keyboardType={"number-pad"}
              maxLength={RESET_CODE_LENGTH}
              textContentType={"oneTimeCode"}
              autoComplete={"one-time-code"}
              accessibilityLabel={"6-digit reset code"}
              radius={5}
              testID="verify-code-input"
            />
          )}
        </View>
        {restartRequired ? (
          <CustomButton
            text={"Request a New Code"}
            onPress={restartHandle}
            radius={5}
            testID="verify-code-restart-btn"
          />
        ) : (
          <CustomButton
            text={"Verify Code"}
            onPress={verifyHandle}
            radius={5}
            testID="verify-code-submit-btn"
          />
        )}
        {email !== "" && (
          <View style={styles.bottomContainer}>
            {cooldown > 0 ? (
              <Text
                style={styles.disabledLinkText}
                accessibilityState={{ disabled: true }}
                testID="verify-code-resend-link"
              >
                Resend code in {cooldown}s
              </Text>
            ) : (
              <Text
                onPress={resendHandle}
                style={styles.linkText}
                accessibilityRole="link"
                testID="verify-code-resend-link"
              >
                Resend code
              </Text>
            )}
          </View>
        )}
        {email !== "" && (
          <View style={styles.bottomContainer}>
            <Text
              onPress={restartHandle}
              style={styles.linkText}
              accessibilityRole="link"
              testID="verify-code-change-email-link"
            >
              Use a different email
            </Text>
          </View>
        )}
        <View style={styles.bottomContainer}>
          <Text
            onPress={() => navigation.navigate("login")}
            style={styles.linkText}
            accessibilityRole="link"
            testID="verify-code-login-link"
          >
            Back to login
          </Text>
        </View>
      </View>
    </ConnectionAlert>
  );
};

export default VerifyResetCodeScreen;

const styles = StyleSheet.create({
  container: {
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
  },
  bottomContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  disabledLinkText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
  },
});
