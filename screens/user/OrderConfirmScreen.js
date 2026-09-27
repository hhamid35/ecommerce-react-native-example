import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as session from "../../utils/session";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import { PAYMENT_METHODS } from "../../constants/Payment";
import { formatAmount, getPaymentMethod } from "../../utils/payment";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const order = route?.params?.order;

  //method to get authUser from session
  const getUserData = async () => {
    const value = await session.getUser();
    setUser(value);
  };

  //fetch user data on initial render
  useEffect(() => {
    getUserData();
  }, []);

  return (
    <View style={styles.container} testID="order-confirm-screen">
      <StatusBar testID="order-confirm-status-bar"></StatusBar>
      <View style={styles.imageConatiner}>
        <Image source={SuccessImage} style={styles.Image} testID="order-confirm-image" />
      </View>
      <Text style={styles.secondaryText} testID="order-confirm-text">Order has be confirmed</Text>
      {order && (
        <View style={styles.detailsContainer} testID="order-confirm-details">
          <Text style={styles.primaryTextSm} testID="order-confirm-order-id">
            Order # {order.orderId}
          </Text>
          <Text style={styles.secondaryTextSm} testID="order-confirm-total">
            Total: {formatAmount(order.amount)}
          </Text>
          <PaymentStatusBadge
            order={order}
            showSummary
            testID="order-confirm-payment"
          />
          {getPaymentMethod(order) === PAYMENT_METHODS.CARD_DEMO &&
            order.payment_reference && (
              <Text
                style={styles.secondaryTextSm}
                testID="order-confirm-payment-reference"
              >
                Reference: {order.payment_reference}
              </Text>
            )}
        </View>
      )}
      <View>
        <CustomButton
          testID="order-confirm-home-btn"
          text={"Back to Home"}
          onPress={() => navigation.replace("tab", { user: user })}
        />
      </View>
    </View>
  );
};

export default OrderConfirmScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
    flex: 1,
  },
  imageConatiner: {
    width: "100%",
  },
  Image: {
    width: 400,
    height: 300,
  },
  secondaryText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  detailsContainer: {
    width: "85%",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
  },
  primaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  secondaryTextSm: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
