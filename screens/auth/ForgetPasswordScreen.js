import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ConnectionAlert from "../../components/ConnectionAlert/ConnectionAlert";
import ProgressDialog from "react-native-progress-dialog";
import RecoveryStepIndicator from "../../components/RecoveryStepIndicator";
import { validateEmail } from "../../utils/passwordValidation";
import { requestRecoveryCode } from "../../services/passwordRecoveryApi";

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendCodeHandle = async () => {
    const validation = validateEmail(email);
    if (!validation.valid) {
      return setError(validation.error);
    }

    setError("");
    setIsLoading(true);

    const { ok, status, message, data } = await requestRecoveryCode(email);
    setIsLoading(false);

    if (status === 429 || !ok) {
      return setError(message);
    }

    navigation.navigate("verifyrecoveryotp", {
      email: email.trim().toLowerCase(),
      devOtp: data.devOtp,
    });
  };

  return (
    <ConnectionAlert onChange={() => {}}>
      <View style={styles.container} testID="forget-password-screen">
        <ProgressDialog visible={isLoading} label={"Sending code ..."} />
        <View style={styles.TopBarContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            testID="forget-password-back-btn"
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
        </View>
        <RecoveryStepIndicator currentStep={0} />
        <View style={styles.screenNameContainer}>
          <View>
            <Text style={styles.screenNameText} testID="forget-password-heading">Reset Password</Text>
          </View>
          <View>
            <Text style={styles.screenNameParagraph} testID="forget-password-instruction">
              Enter the email associated with your account. If an account exists, you will receive a verification code.
            </Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={error} type={"error"} testID="forget-password-alert" />
          <CustomInput
            value={email}
            setValue={setEmail}
            placeholder={"Enter your Email Address"}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="forget-password-email-input"
          />
        </View>
        <CustomButton
          text={"Send Code"}
          onPress={sendCodeHandle}
          radius={5}
          testID="forget-password-submit-btn"
        />
      </View>
    </ConnectionAlert>
  );
};

export default ForgetPasswordScreen;

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
});
