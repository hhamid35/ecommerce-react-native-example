import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";

const ScanResultState = ({
  testID,
  title,
  message,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  tertiaryLabel,
  onTertiaryPress,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {primaryLabel ? (
        <CustomButton
          text={primaryLabel}
          onPress={onPrimaryPress}
          testID={`${testID}-primary-btn`}
        />
      ) : null}
      {secondaryLabel ? (
        <CustomButton
          text={secondaryLabel}
          onPress={onSecondaryPress}
          testID={`${testID}-secondary-btn`}
        />
      ) : null}
      {tertiaryLabel ? (
        <CustomButton
          text={tertiaryLabel}
          onPress={onTertiaryPress}
          testID={`${testID}-tertiary-btn`}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.light,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.dark,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
});

export default ScanResultState;
