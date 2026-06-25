import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import { PAYMENT_METHOD_OPTIONS } from "../../constants/payment";

const PaymentMethodSelector = ({ selectedMethod, onSelect, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      {PAYMENT_METHOD_OPTIONS.map((option) => {
        const isSelected = selectedMethod === option.value;
        const optionTestId =
          option.value === "cod"
            ? testID
              ? `${testID}-cod`
              : "checkout-payment-cod"
            : testID
              ? `${testID}-card`
              : "checkout-payment-card";

        return (
          <TouchableOpacity
            key={option.value}
            style={styles.list}
            onPress={() => onSelect(option.value)}
            testID={optionTestId}
          >
            <Text style={styles.secondaryTextSm}>{option.label}</Text>
            <View
              style={[
                styles.radioOuter,
                isSelected && styles.radioOuterSelected,
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PaymentMethodSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  list: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
  },
  secondaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});
