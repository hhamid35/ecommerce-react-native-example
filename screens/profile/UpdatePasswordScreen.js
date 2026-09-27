import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import * as api from "../../api";
import {
  PASSWORD_RULE_TEXT,
  validatePassword,
  validatePasswordConfirmation,
} from "../../utils/passwordPolicy";

const UpdatePasswordScreen = ({ navigation, route }) => {
  const { userID } = route.params;
  const [error, setError] = useState("");
  const [currnetPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setCconfirmPassword] = useState("");
  const [alertType, setAlertType] = useState("error");

  // method to update the password by the check the current password
  const updatePasswordHandle = () => {
    const passwordError =
      validatePassword(newPassword) ||
      validatePasswordConfirmation(newPassword, confirmPassword);
    if (currnetPassword == newPassword) {
      setAlertType("error");
      setError("You are not allowed to set the previous used password");
    } else if (passwordError) {
      setAlertType("error");
      setError(passwordError);
    } else {
      setError("");
      api
        .resetPassword(userID, {
          password: currnetPassword,
          newPassword: newPassword,
        }) // API call
        .then((result) => {
          if (result.success) {
            setAlertType("success");
            setError("Password is updated successfully ");
          } else {
            setAlertType("error");
            setError(result.message);
          }
        })
        .catch((error) => {
          setAlertType("error");
          setError(error.message);
          console.log("error", error.message);
        });
    }
  };

  return (
    <View style={styles.container} testID="update-password-screen">
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="update-password-back-btn"
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
          <Text style={styles.screenNameText} testID="update-password-heading">Update Password</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="update-password-instruction">
            Your new password must be different from previous used password
          </Text>
          <Text style={styles.screenNameParagraph} testID="update-password-rule">
            {PASSWORD_RULE_TEXT}
          </Text>
        </View>
      </View>
      <View style={styles.formContainer}>
        <CustomAlert message={error} type={alertType} testID="update-password-alert" />
        <CustomInput
          value={currnetPassword}
          setValue={setCurrentPassword}
          placeholder={"Current Password"}
          secureTextEntry={true}
          testID="update-password-current-input"
        />
        <CustomInput
          value={newPassword}
          setValue={setNewPassword}
          placeholder={"New Password"}
          secureTextEntry={true}
          testID="update-password-new-input"
        />
        <CustomInput
          value={confirmPassword}
          setValue={setCconfirmPassword}
          placeholder={"Confirm New Password"}
          secureTextEntry={true}
          testID="update-password-confirm-input"
        />
      </View>
      <CustomButton
        text={"Update Password"}
        onPress={updatePasswordHandle}
        radius={5}
        testID="update-password-submit-btn"
      />
    </View>
  );
};

export default UpdatePasswordScreen;

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
