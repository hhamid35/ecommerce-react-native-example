import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { colors } from "../../constants";

const CustomButton = ({ text, onPress, disabled = false, testID }) => {
  return (
    <>
      {disabled == true ? (
        <TouchableOpacity
          disabled
          style={styles.containerDisabled}
          onPress={onPress}
          testID={testID}
        >
          <Text style={styles.buttonTextDisabled} testID={testID ? `${testID}-text` : undefined}>{text}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.container} onPress={onPress} testID={testID}>
          <Text style={styles.buttonText} testID={testID ? `${testID}-text` : undefined}>{text}</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
  },
  containerDisabled: {
    padding: 15,
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: colors.muted,
  },
  buttonTextDisabled: {
    fontWeight: "bold",
    color: colors.light,
  },
});
