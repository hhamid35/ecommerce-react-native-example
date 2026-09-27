import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { PAYMENT_METHOD_OPTIONS } from "../../constants/Payment";

const PaymentMethodSelector = ({
  value,
  onChange,
  options = PAYMENT_METHOD_OPTIONS,
  disabled = false,
  testID,
}) => {
  return (
    <View accessibilityRole="radiogroup" testID={testID}>
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <TouchableOpacity
            key={o.value}
            style={styles.option}
            accessibilityRole="radio"
            accessibilityState={{ checked, disabled }}
            accessibilityLabel={`${o.label}. ${o.description}`}
            testID={testID ? `${testID}-option-${o.value}` : undefined}
            onPress={() => {
              if (!disabled) onChange(o.value);
            }}
          >
            <Ionicons
              name={checked ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={checked ? colors.primary : colors.muted}
            />
            <View style={styles.optionText}>
              <Text style={styles.label}>{o.label}</Text>
              <Text style={styles.description}>{o.description}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default PaymentMethodSelector;

const styles = StyleSheet.create({
  option: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
  },
  optionText: {
    marginLeft: 10,
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
  },
  description: {
    fontSize: 12,
    color: colors.muted,
  },
});
