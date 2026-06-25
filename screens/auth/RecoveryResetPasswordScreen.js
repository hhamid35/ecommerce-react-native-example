import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ConnectionAlert from "../../components/ConnectionAlert/ConnectionAlert";
import ProgressDialog from "react-native-progress-dialog";
import { validatePasswordPair } from "../../utils/passwordValidation";

const RecoveryResetPasswordScreen = ({ navigation, route }) => {
  const { email, resetToken } = route.params || {};
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);

  const resetHandle = () => {
    const validation = validatePasswordPair(newPassword, confirmPassword);
    if (!validation.valid) {
      setAlertType("error");
      return setError(validation.error);
    }

    setError("");
    setIsLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch(network.serverip + "/password-recovery/reset", {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        email,
        resetToken,
        newPassword,
        confirmPassword,
      }),
    })
      .then((response) => response.json().then((result) => ({ status: response.status, result })))
      .then(({ result }) => {
        setIsLoading(false);
        if (!result.success) {
          setAlertType("error");
          return setError(result.message || "Recovery session expired. Please start again.");
        }
        setAlertType("success");
        setError("Password reset successfully.");
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "login", params: { recoverySuccess: true } }],
          });
        }, 2000);
      })
      .catch((fetchError) => {
        setIsLoading(false);
        setAlertType("error");
        console.log("error", fetchError);
        setError(fetchError.message || "Network error");
      });
  };

  return (
    <ConnectionAlert onChange={() => {}}>
      <View style={styles.container} testID="recovery-reset-password-screen">
        <ProgressDialog visible={isLoading} label={"Resetting password ..."} />
        <View style={styles.TopBarContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            testID="recovery-reset-password-back-btn"
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.screenNameContainer}>
          <Text style={styles.screenNameText} testID="recovery-reset-password-heading">
            Create New Password
          </Text>
          <Text style={styles.screenNameParagraph} testID="recovery-reset-password-instruction">
            Must be at least 6 characters.
          </Text>
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={error} type={alertType} testID="recovery-reset-password-alert" />
          <CustomInput
            value={newPassword}
            setValue={setNewPassword}
            placeholder={"New Password"}
            secureTextEntry={true}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="recovery-reset-password-new-input"
          />
          <CustomInput
            value={confirmPassword}
            setValue={setConfirmPassword}
            placeholder={"Confirm Password"}
            secureTextEntry={true}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="recovery-reset-password-confirm-input"
          />
        </View>
        <CustomButton
          text={"Reset Password"}
          onPress={resetHandle}
          radius={5}
          testID="recovery-reset-password-submit-btn"
        />
        <View style={styles.linkRow}>
          <Text
            onPress={() => navigation.navigate("forgetpassword")}
            style={styles.linkText}
            testID="recovery-reset-password-start-over"
          >
            Start over
          </Text>
        </View>
      </View>
    </ConnectionAlert>
  );
};

export default RecoveryResetPasswordScreen;

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
});
