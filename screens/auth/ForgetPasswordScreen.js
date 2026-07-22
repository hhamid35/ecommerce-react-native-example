import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import * as api from "../../api";

const NEUTRAL_SUCCESS_MESSAGE =
  "If an account exists for that email, password reset instructions have been sent.";

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      return "Please enter your email";
    }
    if (!email.includes("@")) {
      return "Email is not valid";
    }
    if (email.length < 6) {
      return "Email is too short";
    }
    return null;
  };

  const sendInstructionsHandle = async () => {
    const validationError = validateEmail();
    if (validationError) {
      setAlertType("error");
      setMessage(validationError);
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      const result = await api.requestPasswordReset(email);
      if (result.success) {
        setAlertType("success");
        setMessage(result.message || NEUTRAL_SUCCESS_MESSAGE);
        setRequestSent(true);
      } else {
        setAlertType("error");
        setMessage(
          result.message || "Unable to send reset instructions. Please try again."
        );
      }
    } catch (err) {
      setAlertType("error");
      setMessage(err.message || "Unable to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const continueToReset = () => {
    navigation.navigate("resetpassword", { email });
  };

  return (
    <View style={styles.container} testID="forget-password-screen">
      <ProgressDialog visible={isLoading} label="Sending instructions..." />
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
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="forget-password-heading">
            Reset Password
          </Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="forget-password-instruction">
            Enter the email associated with your account and we'll send an email
            with instruction to reset the password.
          </Text>
        </View>
      </View>
      <View style={styles.formContainer}>
        <CustomAlert message={message} type={alertType} testID="forget-password-alert" />
        <CustomInput
          value={email}
          setValue={setEmail}
          placeholder={"Enter your Email Address"}
          keyboardType="email-address"
          testID="forget-password-email-input"
        />
      </View>
      {requestSent ? (
        <CustomButton
          text={"Continue"}
          onPress={continueToReset}
          radius={5}
          testID="forget-password-continue-btn"
        />
      ) : (
        <CustomButton
          text={"Send Instruction"}
          onPress={sendInstructionsHandle}
          radius={5}
          testID="forget-password-submit-btn"
        />
      )}
    </View>
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
