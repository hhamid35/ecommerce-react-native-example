import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ConnectionAlert from "../../components/ConnectionAlert/ConnectionAlert";
import ProgressDialog from "react-native-progress-dialog";
import RecoveryStepIndicator from "../../components/RecoveryStepIndicator";
import {
  requestRecoveryCode,
  verifyRecoveryCode,
} from "../../services/passwordRecoveryApi";

const RESEND_COOLDOWN_SEC = 60;

function maskEmail(email) {
  const atIndex = email.indexOf("@");
  if (atIndex <= 1) {
    return email;
  }
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  return `${local[0]}***${domain}`;
}

const VerifyRecoveryOtpScreen = ({ navigation, route }) => {
  const { email, devOtp } = route.params || {};
  const [otp, setOtp] = useState(devOtp || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SEC);
  const [otpInputDisabled, setOtpInputDisabled] = useState(false);

  useEffect(() => {
    if (!email) {
      navigation.replace("forgetpassword");
    }
  }, [email, navigation]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const verifyHandle = async () => {
    if (otpInputDisabled) {
      return;
    }
    if (!otp || otp.length !== 6) {
      return setError("Please enter the 6-digit code");
    }

    setError("");
    setIsLoading(true);

    const { ok, status, message, data } = await verifyRecoveryCode(email, otp);
    setIsLoading(false);

    if (status === 429) {
      setOtpInputDisabled(true);
      return setError(message || "Too many attempts. Request a new code.");
    }
    if (!ok) {
      return setError(message);
    }

    navigation.navigate("recoveryresetpassword", {
      email,
      resetToken: data.resetToken,
    });
  };

  const resendHandle = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setError("");
    setOtpInputDisabled(false);
    setIsLoading(true);

    const { ok, status, message, data } = await requestRecoveryCode(email);
    setIsLoading(false);

    if (status === 429 || !ok) {
      return setError(message);
    }

    if (data.devOtp) {
      setOtp(data.devOtp);
    }
    setResendCooldown(RESEND_COOLDOWN_SEC);
  };

  if (!email) {
    return null;
  }

  return (
    <ConnectionAlert onChange={() => {}}>
      <View style={styles.container} testID="verify-recovery-otp-screen">
        <ProgressDialog visible={isLoading} label={"Verifying ..."} />
        <View style={styles.TopBarContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="verify-recovery-otp-back-btn"
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
        <RecoveryStepIndicator currentStep={1} />
        <View style={styles.screenNameContainer}>
          <Text style={styles.screenNameText} testID="verify-recovery-otp-heading">Verify Code</Text>
          <Text style={styles.screenNameParagraph} testID="verify-recovery-otp-hint">
            Code sent to {maskEmail(email || "")}
          </Text>
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={error} type={"error"} testID="verify-recovery-otp-alert" />
          <CustomInput
            value={otp}
            setValue={otpInputDisabled ? () => {} : setOtp}
            placeholder={"6-digit code"}
            keyboardType={"number-pad"}
            maxLength={6}
            editable={!otpInputDisabled}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="verify-recovery-otp-input"
          />
        </View>
        <CustomButton
          text={"Verify"}
          onPress={verifyHandle}
          radius={5}
          testID="verify-recovery-otp-submit-btn"
        />
        <View style={styles.linkRow}>
          <Text
            onPress={resendCooldown > 0 ? undefined : resendHandle}
            style={[styles.linkText, resendCooldown > 0 && styles.linkDisabled]}
            testID="verify-recovery-otp-resend"
          >
            {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
          </Text>
        </View>
        <View style={styles.linkRow}>
          <Text
            onPress={() => navigation.navigate("forgetpassword")}
            style={styles.linkText}
            testID="verify-recovery-otp-different-email"
          >
            Use a different email
          </Text>
        </View>
      </View>
    </ConnectionAlert>
  );
};

export default VerifyRecoveryOtpScreen;

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
    width: "100%",
  },
  linkRow: {
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  linkDisabled: {
    color: colors.muted,
  },
});
