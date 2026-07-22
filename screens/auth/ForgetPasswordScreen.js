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

function validateEmail(value) {
  if (!value || value.trim() === "") {
    return "Please enter your email";
  }
  if (!value.includes("@")) {
    return "Email is not valid";
  }
  if (value.length < 6) {
    return "Email is too short";
  }
  return null;
}

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isLoading, setIsLoading] = useState(false);

  const sendInstructionsHandle = async () => {
    setIsLoading(true);
    const validationError = validateEmail(email);
    if (validationError) {
      setAlertType("error");
      setMessage(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const result = await api.requestPasswordReset(email.trim().toLowerCase());
      if (result.success) {
        setAlertType("success");
        setMessage(result.message);
        setIsLoading(false);
        navigation.navigate("resetforgottenpassword", {
          email: email.trim().toLowerCase(),
        });
      } else {
        setAlertType("error");
        setMessage(result.message || "Failed to send reset instructions");
        setIsLoading(false);
      }
    } catch (err) {
      setAlertType("error");
      setMessage(err.message || "Failed to send reset instructions");
      setIsLoading(false);
    }
  };

  return (
    <ConnectionAlert onChange={() => {}}>
      <View style={styles.container} testID="forget-password-screen">
        <ProgressDialog visible={isLoading} label={"Sending instructions ..."} />
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
              Enter your email and we will send a 6-digit reset code if an account
              exists.
            </Text>
          </View>
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={message} type={alertType} testID="forget-password-alert" />
          <CustomInput
            value={email}
            setValue={setEmail}
            placeholder={"Enter your Email Address"}
            testID="forget-password-email-input"
          />
        </View>
        <CustomButton
          text={"Send Instruction"}
          onPress={sendInstructionsHandle}
          radius={5}
          testID="forget-password-submit-btn"
          disabled={isLoading}
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
