import { Modal, StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors } from "../../constants";
import CustomInput from "../CustomInput";
import CustomButton from "../CustomButton";

const MockCardForm = ({
  visible,
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvv,
  setCvv,
  onClose,
  testID,
}) => {
  return (
    <Modal
      testID={testID || "checkout-card-modal"}
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modelBody}>
        <View style={styles.modelAddressContainer}>
          <Text style={styles.title}>Enter card details (demo)</Text>
          <CustomInput
            testID={testID ? `${testID}-number` : "checkout-card-number"}
            value={cardNumber}
            setValue={setCardNumber}
            placeholder={"1234 5678 9012 3456"}
            keyboardType={"number-pad"}
          />
          <CustomInput
            testID={testID ? `${testID}-expiry` : "checkout-card-expiry"}
            value={expiry}
            setValue={setExpiry}
            placeholder={"MM/YY"}
          />
          <CustomInput
            testID={testID ? `${testID}-cvv` : "checkout-card-cvv"}
            value={cvv}
            setValue={setCvv}
            placeholder={"123"}
            keyboardType={"number-pad"}
            secureTextEntry={true}
          />
          <CustomButton
            testID={testID ? `${testID}-close` : "checkout-card-close"}
            onPress={onClose}
            text={"Done"}
          />
        </View>
      </View>
    </Modal>
  );
};

export default MockCardForm;

const styles = StyleSheet.create({
  modelBody: {
    flex: 1,
    display: "flex",
    flexL: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  modelAddressContainer: {
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
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.muted,
  },
});
