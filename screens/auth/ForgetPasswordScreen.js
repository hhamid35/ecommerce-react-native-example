import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";

const ForgetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [isloading, setIsloading] = useState(false);
  const [devResetToken, setDevResetToken] = useState(null);
  const [devResetUrl, setDevResetUrl] = useState(null);

  const sendInstructionsHandle = () => {
    setIsloading(true);
    setDevResetToken(null);
    setDevResetUrl(null);

    if (email == "") {
      setIsloading(false);
      setAlertType("error");
      return setMessage("Please enter your email");
    }
    if (!email.includes("@")) {
      setIsloading(false);
      setAlertType("error");
      return setMessage("Email is not valid");
    }
    if (email.length < 6) {
      setIsloading(false);
      setAlertType("error");
      return setMessage("Email is too short");
    }

    fetch(network.serverip + "/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((result) => {
        setIsloading(false);
        if (result.success) {
          setAlertType("success");
          setMessage(
            result.message ||
              "If an account exists for that email, reset instructions have been sent."
          );
          if (result.data && result.data.devResetToken) {
            setDevResetToken(result.data.devResetToken);
            setDevResetUrl(result.data.devResetUrl || null);
          }
        } else {
          setAlertType("error");
          setMessage(result.message || "Unable to send reset instructions. Please try again.");
        }
      })
      .catch((error) => {
        setIsloading(false);
        setAlertType("error");
        setMessage("Unable to send reset instructions. Please try again.");
        console.log("error", error.message);
      });
  };

  return (
    <View style={styles.container} testID="forget-password-screen">
      <ProgressDialog visible={isloading} label={"Sending instructions ..."} />
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
        <CustomAlert
          message={message}
          type={alertType}
          testID="forget-password-alert"
        />
        <CustomInput
          value={email}
          setValue={setEmail}
          placeholder={"Enter your Email Address"}
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          testID="forget-password-email-input"
        />
      </View>
      <CustomButton
        text={"Send Instruction"}
        onPress={sendInstructionsHandle}
        radius={5}
        testID="forget-password-submit-btn"
      />
      {devResetToken ? (
        <View style={styles.demoContainer}>
          <Text style={styles.demoLabel} testID="forget-password-demo-label">
            Demo only: open reset link without email delivery
          </Text>
          <CustomButton
            text={"Open Demo Reset Link"}
            onPress={() =>
              navigation.navigate("resetpassword", { token: devResetToken })
            }
            radius={5}
            testID="forget-password-demo-reset-btn"
          />
          {devResetUrl ? (
            <Text style={styles.demoUrl} testID="forget-password-demo-url">
              {devResetUrl}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.loginLinkContainer}>
        <Text
          onPress={() => navigation.navigate("login")}
          style={styles.loginLink}
          testID="forget-password-login-link"
        >
          Return to login
        </Text>
      </View>
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
  demoContainer: {
    marginTop: 20,
    width: "100%",
  },
  demoLabel: {
    fontSize: 13,
    color: colors.primary_shadow,
    marginBottom: 8,
  },
  demoUrl: {
    marginTop: 8,
    fontSize: 12,
    color: colors.muted,
  },
  loginLinkContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
});
