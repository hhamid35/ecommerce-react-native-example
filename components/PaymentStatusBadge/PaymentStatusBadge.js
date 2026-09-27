import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import {
  getPaymentMethod,
  getPaymentStatus,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getPaymentSummary,
} from "../../utils/payment";

const STATUS_COLORS = {
  paid: colors.success,
  pending: colors.warning,
  failed: colors.danger,
};

const PaymentStatusBadge = ({ order, testID, showSummary = false }) => {
  const status = getPaymentStatus(order);
  const methodLabel = getPaymentMethodLabel(getPaymentMethod(order));
  const statusLabel = getPaymentStatusLabel(status);

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Payment: ${methodLabel}, ${statusLabel}`}
      testID={testID}
    >
      <View style={styles.row}>
        <Text style={styles.method} testID={testID ? `${testID}-method` : undefined}>
          {methodLabel}
        </Text>
        <Text
          style={[styles.pill, { backgroundColor: STATUS_COLORS[status] }]}
          testID={testID ? `${testID}-status` : undefined}
        >
          {statusLabel}
        </Text>
      </View>
      {showSummary && (
        <Text style={styles.summary} testID={testID ? `${testID}-summary` : undefined}>
          {getPaymentSummary(order)}
        </Text>
      )}
    </View>
  );
};

export default PaymentStatusBadge;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  method: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "bold",
  },
  pill: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.dark,
    borderRadius: 10,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  summary: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
});
