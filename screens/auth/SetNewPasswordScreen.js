import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ProgressDialog from "react-native-progress-dialog";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ConnectionAlert from "../../components/ConnectionAlert/ConnectionAlert";
import * as api from "../../api";
import {
  PASSWORD_RULE_TEXT,
  validatePassword,
  validatePasswordConfirmation,
} from "../../utils/passwordPolicy";
import {
  RECOVERY_MESSAGES,
  isRestartRequired,
  messageForRecoveryError,
} from "../../utils/passwordRecovery";

const SetNewPasswordScreen = ({ navigation, route }) => {
  const email = route?.params?.email;
  const resetToken = route?.params?.resetToken;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(
    resetToken ? "" : RECOVERY_MESSAGES.tokenInvalid
  );
  const [isLoading, setIsLoading] = useState(false);
  const [restartRequired, setRestartRequired] = useState(!resetToken);

  // method to set the new password with the reset token and return to login
  const submitHandle = async () => {
    const validationError =
      validatePassword(newPassword) ||
      validatePasswordConfirmation(newPassword, confirmPassword);
    if (validationError) return setError(validationError);
    setIsLoading(true);
    setError("");
    try {
      const result = await api.setNewPassword(resetToken, newPassword);
      if (result.success) {
        // Reset the stack so Back can't return to a used reset token.
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "login",
              params: { successMessage: RECOVERY_MESSAGES.success, email },
            },
          ],
        });
      } else {
        setError(messageForRecoveryError(result));
        setRestartRequired(isRestartRequired(result.err));
      }
    } catch (err) {
      console.warn("[password-reset] network error", err?.message);
      setError(RECOVERY_MESSAGES.network);
    } finally {
      setIsLoading(false);
    }
  };

  const restartHandle = () => {
    navigation.navigate("forgetpassword", { email });
  };

  return (
    <ConnectionAlert onChange={() => {}}>
      <View style={styles.container} testID="set-password-screen">
        <ProgressDialog visible={isLoading} label={"Saving ..."} />
        <View style={styles.TopBarContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            testID="set-password-back-btn"
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
            <Text style={styles.screenNameText} testID="set-password-heading">New Password</Text>
          </View>
          <View>
            <Text style={styles.screenNameParagraph} testID="set-password-rule">
              {PASSWORD_RULE_TEXT}
            </Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={error} type={"error"} testID="set-password-alert" />
          <CustomInput
            value={newPassword}
            setValue={setNewPassword}
            placeholder={"New Password"}
            placeholderTextColor={colors.muted}
            secureTextEntry={true}
            textContentType={"newPassword"}
            autoCapitalize={"none"}
            accessibilityLabel={"New password"}
            radius={5}
            testID="set-password-new-input"
          />
          <CustomInput
            value={confirmPassword}
            setValue={setConfirmPassword}
            placeholder={"Confirm New Password"}
            placeholderTextColor={colors.muted}
            secureTextEntry={true}
            textContentType={"newPassword"}
            autoCapitalize={"none"}
            accessibilityLabel={"Confirm new password"}
            radius={5}
            testID="set-password-confirm-input"
          />
        </View>
        {restartRequired ? (
          <CustomButton
            text={"Request a New Code"}
            onPress={restartHandle}
            radius={5}
            testID="set-password-restart-btn"
          />
        ) : (
          <CustomButton
            text={"Reset Password"}
            onPress={submitHandle}
            radius={5}
            testID="set-password-submit-btn"
          />
        )}
        <View style={styles.bottomContainer}>
          <Text
            onPress={() => navigation.navigate("login")}
            style={styles.linkText}
            accessibilityRole="link"
            testID="set-password-login-link"
          >
            Back to login
          </Text>
        </View>
      </View>
    </ConnectionAlert>
  );
};

export default SetNewPasswordScreen;

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
});
