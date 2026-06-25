import {
  StyleSheet,
  Image,
  Text,
  View,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";

import React, { useState } from "react";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import header_logo from "../../assets/logo/logo.png";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import ConnectionAlert from "../../components/ConnectionAlert/ConnectionAlert";
import * as authStorage from "../../utils/authStorage";

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    route.params?.recoverySuccess
      ? "Password updated. Sign in with your new password."
      : ""
  );
  const [isloading, setIsloading] = useState(false);

  const _storeData = async (user) => {
    try {
      await authStorage.setItem("authUser", JSON.stringify(user));
    } catch (storageError) {
      console.log(storageError);
      setError(storageError.message || "Failed to save session");
    }
  };

  const loginHandle = () => {
    setIsloading(true);
    setSuccessMessage("");
    if (email == "") {
      setIsloading(false);
      return setError("Please enter your email");
    }
    if (password == "") {
      setIsloading(false);
      return setError("Please enter your password");
    }
    if (!email.includes("@")) {
      setIsloading(false);
      return setError("Email is not valid");
    }
    if (email.length < 6) {
      setIsloading(false);
      return setError("Email is too short");
    }
    if (password.length < 6) {
      setIsloading(false);
      return setError("Password must be 6 characters long");
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch(network.serverip + "/login", {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((result) => {
        setIsloading(false);
        if (result.success && result.data) {
          _storeData(result.data);
          if (result.data.userType === "ADMIN") {
            navigation.replace("dashboard", { authUser: result.data });
          } else {
            navigation.replace("tab", { user: result.data });
          }
        } else {
          setError(result.message || "Invalid email or password");
        }
      })
      .catch((fetchError) => {
        setIsloading(false);
        console.log("error", fetchError);
        setError(fetchError.message || "Network error");
      });
  };

  return (
    <ConnectionAlert onChange={() => {}}>
      <KeyboardAvoidingView
        style={styles.container}
        testID="login-screen"
      >
        <ScrollView style={{ flex: 1, width: "100%" }} testID="login-scroll">
          <ProgressDialog visible={isloading} label={"Login ..."} />
          <StatusBar testID="login-status-bar"></StatusBar>
          <View style={styles.welconeContainer}>
            <View>
              <Text style={styles.welcomeText} testID="login-welcome-text">Welcome to EasyBuy</Text>
              <Text style={styles.welcomeParagraph} testID="login-subtitle">
                make your ecommerce easy
              </Text>
            </View>
            <View>
              <Image style={styles.logo} source={header_logo} testID="login-logo" />
            </View>
          </View>
          <View style={styles.screenNameContainer}>
            <Text style={styles.screenNameText} testID="login-heading">Login</Text>
          </View>
          <View style={styles.formContainer}>
            {successMessage ? (
              <CustomAlert message={successMessage} type={"success"} testID="login-success-alert" />
            ) : null}
            <CustomAlert message={error} type={"error"} testID="login-alert" />
            <CustomInput
              value={email}
              setValue={setEmail}
              placeholder={"Username"}
              placeholderTextColor={colors.muted}
              radius={5}
              testID="login-email-input"
            />
            <CustomInput
              value={password}
              setValue={setPassword}
              secureTextEntry={true}
              placeholder={"Password"}
              placeholderTextColor={colors.muted}
              radius={5}
              testID="login-password-input"
            />
            <View style={styles.forgetPasswordContainer}>
              <Text
                onPress={() => navigation.navigate("forgetpassword")}
                style={styles.ForgetText}
                testID="login-forget-password"
              >
                Forget Password?
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.buttomContainer}>
          <CustomButton text={"Login"} onPress={loginHandle} testID="login-submit-btn" />
        </View>
        <View style={styles.bottomContainer}>
          <Text testID="login-signup-prompt">Don't have an account?</Text>
          <Text
            onPress={() => navigation.navigate("signup")}
            style={styles.signupText}
            testID="login-signup-link"
          >
            signup
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ConnectionAlert>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  welconeContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: "30%",
  },
  formContainer: {
    flex: 3,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    flexDirecion: "row",
    padding: 5,
  },
  logo: {
    resizeMode: "contain",
    width: 80,
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.muted,
  },
  welcomeParagraph: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.primary_shadow,
  },
  forgetPasswordContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  ForgetText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttomContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  bottomContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    marginLeft: 2,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
});
