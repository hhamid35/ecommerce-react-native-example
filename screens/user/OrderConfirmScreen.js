import { StyleSheet, Image, Text, View, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png";
import CustomButton from "../../components/CustomButton";
import * as authStorage from "../../utils/authStorage";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../utils/paymentLabels";

const OrderConfirmScreen = ({ navigation, route }) => {
  const [user, setUser] = useState({});
  const { paymentType, paymentStatus, orderId } = route.params || {};

  //method to get authUser from async storage
  const getUserData = async () => {
    const value = await authStorage.getItem("authUser");
    setUser(JSON.parse(value));
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
      {orderId ? (
        <Text style={styles.paymentText} testID="order-confirm-order-id">
          Order # {orderId}
        </Text>
      ) : null}
      {paymentType ? (
        <Text style={styles.paymentText} testID="order-confirm-payment-method">
          Payment method: {getPaymentMethodLabel(paymentType)}
        </Text>
      ) : null}
      {paymentStatus || paymentType ? (
        <Text style={styles.paymentText} testID="order-confirm-payment-status">
          Payment status: {getPaymentStatusLabel(paymentStatus, paymentType)}
        </Text>
      ) : null}
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
  paymentText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 5,
  },
});
