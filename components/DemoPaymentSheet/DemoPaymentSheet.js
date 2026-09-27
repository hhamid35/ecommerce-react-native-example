import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import { DEMO_CARDS } from "../../constants/Payment";
import { formatAmount } from "../../utils/payment";
import CustomButton from "../CustomButton";

// Simulated card payment step. Offers fixed test cards only — there is
// deliberately no text input, so no real card data can be entered.
const DemoPaymentSheet = ({
  visible,
  amount,
  processing,
  onPay,
  onCancel,
  testID = "demo-payment-sheet",
}) => {
  const [selectedToken, setSelectedToken] = useState(null);

  // start every opening of the sheet with no card selected
  useEffect(() => {
    if (visible) setSelectedToken(null);
  }, [visible]);

  return (
    <Modal
      testID={testID}
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        if (!processing) onCancel();
      }}
    >
      <View style={styles.modelBody}>
        <View style={styles.sheetContainer}>
          <Text style={styles.title} testID={`${testID}-title`}>
            Card payment
          </Text>
          <View
            style={styles.demoBanner}
            accessibilityRole="alert"
            testID={`${testID}-demo-banner`}
          >
            <Text style={styles.demoBannerText}>
              Demo — no money is charged. Use a test card below.
            </Text>
          </View>
          <Text style={styles.amount} testID={`${testID}-amount`}>
            Amount: {formatAmount(amount)}
          </Text>
          {DEMO_CARDS.map((card) => {
            const checked = selectedToken === card.token;
            return (
              <TouchableOpacity
                key={card.token}
                style={styles.card}
                accessibilityRole="radio"
                accessibilityState={{ checked, disabled: !!processing }}
                accessibilityLabel={`${card.label}. ${card.hint}`}
                testID={`${testID}-card-${card.last4}`}
                disabled={!!processing}
                onPress={() => setSelectedToken(card.token)}
              >
                <Ionicons
                  name={checked ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={checked ? colors.primary : colors.muted}
                />
                <View style={styles.cardText}>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardHint}>{card.hint}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={styles.buttons}>
            <CustomButton
              testID={`${testID}-pay-btn`}
              text={`Pay ${formatAmount(amount)}`}
              disabled={!selectedToken || !!processing}
              onPress={() => onPay(selectedToken)}
            />
            <CustomButton
              testID={`${testID}-cancel-btn`}
              text={"Cancel"}
              disabled={!!processing}
              onPress={() => onCancel()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DemoPaymentSheet;

const styles = StyleSheet.create({
  modelBody: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  sheetContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: 320,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  demoBanner: {
    width: "100%",
    backgroundColor: colors.warning,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  demoBannerText: {
    color: colors.dark,
    fontWeight: "bold",
    textAlign: "center",
  },
  amount: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    padding: 10,
  },
  cardText: {
    marginLeft: 10,
    flex: 1,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cardHint: {
    fontSize: 12,
    color: colors.muted,
  },
  buttons: {
    width: "100%",
    marginTop: 15,
  },
});
