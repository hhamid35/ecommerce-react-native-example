import {
  StyleSheet,
  StatusBar,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useRef } from "react";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import { colors } from "../../constants";
import CustomButton from "../../components/CustomButton";
import { useSelector, useDispatch } from "react-redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { bindActionCreators } from "redux";
import * as api from "../../api";
import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import PaymentMethodSelector from "../../components/PaymentMethodSelector";
import DemoPaymentSheet from "../../components/DemoPaymentSheet";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_OPTIONS,
  isDigitalPaymentsEnabled,
} from "../../constants/Payment";
import {
  createIdempotencyKey,
  getCheckoutErrorMessage,
  getPaymentMethodLabel,
} from "../../utils/payment";

const CheckoutScreen = ({ navigation, route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);

  const [deliveryCost, setDeliveryCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");

  const digitalEnabled = isDigitalPaymentsEnabled();
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "error" });
  const [loadingLabel, setLoadingLabel] = useState("Placing Order...");
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef(createIdempotencyKey());

  //method to build the checkout payload from the cart, address and payment choice
  const buildOrderPayload = (token) => {
    let items = [];
    let totalamount = 0;

    // fetch the cart items from redux and set the total cost
    cartproduct.forEach((product) => {
      let obj = {
        productId: product._id,
        price: product.price,
        quantity: product.quantity,
      };
      totalamount += Number(product.price) * Number(product.quantity);
      items.push(obj);
    });

    const payload = {
      items: items,
      amount: Math.round(totalamount * 100) / 100,
      discount: 0,
      payment_type: paymentMethod,
      idempotency_key: idempotencyKeyRef.current,
      country: country,
      status: "pending",
      city: city,
      zipcode: zipcode,
      shippingAddress: streetAddress,
    };
    if (paymentMethod === PAYMENT_METHODS.CARD_DEMO) {
      payload.payment = { token };
    }
    return payload;
  };

  //method to handle the submit button: open the demo payment sheet or place a COD order
  const handleSubmitPress = () => {
    if (submittingRef.current) return;
    setAlert({ message: "", type: "error" });
    if (paymentMethod === PAYMENT_METHODS.CARD_DEMO) {
      setPaymentSheetVisible(true);
    } else {
      placeOrder(null);
    }
  };

  //method to place the order using API call
  const placeOrder = (token) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const method = paymentMethod;
    setLoadingLabel(
      method === PAYMENT_METHODS.CARD_DEMO
        ? "Processing payment..."
        : "Placing Order..."
    );
    setIsloading(true);
    console.log("[payment] checkout_submitted", { method, hasKey: true });

    return api
      .checkout(buildOrderPayload(token)) //API call
      .then((result) => {
        if (result?.success === true) {
          console.log("[payment] checkout_succeeded", {
            method,
            orderId: result?.data?.orderId,
            payment_status: result?.data?.payment_status,
            duplicate: !!result.duplicate,
          });
          emptyCart("empty");
          setPaymentSheetVisible(false);
          navigation.replace("orderconfirm", { order: result.data });
        } else {
          // the server definitively rejected this attempt, so the next one is new
          console.log("[payment] checkout_rejected", {
            method,
            code: result?.code || "unknown",
          });
          idempotencyKeyRef.current = createIdempotencyKey();
          setPaymentSheetVisible(false);
          setAlert({ message: getCheckoutErrorMessage(result), type: "error" });
        }
      })
      .catch(() => {
        // keep the same idempotency key so a retry replays the order that may already exist
        console.log("[payment] checkout_error", { method, reason: "network" });
        setPaymentSheetVisible(false);
        setAlert({
          message: getCheckoutErrorMessage({ code: "network_error" }),
          type: "error",
        });
      })
      .finally(() => {
        submittingRef.current = false;
        setIsloading(false);
      });
  };

  //method to handle cancelling the demo payment sheet
  const handleCancelPayment = () => {
    if (submittingRef.current) return;
    setPaymentSheetVisible(false);
    setAlert({
      message:
        "Payment cancelled. Your cart is unchanged — try again or choose Cash on Delivery.",
      type: "error",
    });
    console.log("[payment] payment_cancelled", { method: "card_demo" });
  };

  // set the address and total cost on initital render
  useEffect(() => {
    if (streetAddress && city && country != "") {
      setAddress(`${streetAddress}, ${city},${country}`);
    } else {
      setAddress("");
    }
    setTotalCost(
      cartproduct.reduce((accumulator, object) => {
        return accumulator + object.price * object.quantity;
      }, 0)
    );
  }, []);

  const submitText =
    paymentMethod === PAYMENT_METHODS.CARD_DEMO
      ? "Continue to Payment"
      : "Submit Order";

  return (
    <View style={styles.container} testID="checkout-screen">
      <StatusBar testID="checkout-status-bar"></StatusBar>
      <ProgressDialog visible={isloading} label={loadingLabel} />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="checkout-back-btn"
          onPress={() => {
            if (isloading) return;
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
        <View></View>
        <View></View>
      </View>
      <CustomAlert message={alert.message} type={alert.type} testID="checkout-alert" />
      <ScrollView style={styles.bodyContainer} nestedScrollEnabled={true} testID="checkout-scroll">
        <Text style={styles.primaryText} testID="checkout-summary-heading">Order Summary</Text>
        <ScrollView
          style={styles.orderSummaryContainer}
          nestedScrollEnabled={true}
          testID="checkout-summary-scroll"
        >
          {cartproduct.map((product, index) => (
            <BasicProductList
              testID={`checkout-product-${index}`}
              key={index}
              title={product.title}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </ScrollView>
        <Text style={styles.primaryText} testID="checkout-total-heading">Total</Text>
        <View style={styles.totalOrderInfoContainer}>
          <View style={styles.list}>
            <Text testID="checkout-order-label">Order</Text>
            <Text testID="checkout-order-value">{totalCost}$</Text>
          </View>
          <View style={styles.list}>
            <Text testID="checkout-delivery-label">Delivery</Text>
            <Text testID="checkout-delivery-value">{deliveryCost}$</Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.primaryTextSm} testID="checkout-grand-total-label">Total</Text>
            <Text style={styles.secondaryTextSm} testID="checkout-grand-total-value">
              {totalCost + deliveryCost}$
            </Text>
          </View>
        </View>
        <Text style={styles.primaryText} testID="checkout-contact-heading">Contact</Text>
        <View style={styles.listContainer}>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-email-label">Email</Text>
            <Text style={styles.secondaryTextSm} testID="checkout-email-value">
              bukhtyar.haider1@gmail.com
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-phone-label">Phone</Text>
            <Text style={styles.secondaryTextSm} testID="checkout-phone-value">+92 3410988683</Text>
          </View>
        </View>
        <Text style={styles.primaryText} testID="checkout-address-heading">Address</Text>
        <View style={styles.listContainer}>
          <TouchableOpacity
            testID="checkout-address-btn"
            style={styles.list}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.secondaryTextSm} testID="checkout-address-label">Address</Text>
            <View>
              {country || city || streetAddress != "" ? (
                <Text
                  testID="checkout-address-value"
                  style={styles.secondaryTextSm}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {address.length < 25
                    ? `${address}`
                    : `${address.substring(0, 25)}...`}
                </Text>
              ) : (
                <Text style={styles.primaryTextSm} testID="checkout-address-add">Add</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.primaryText} testID="checkout-payment-heading">Payment</Text>
        <View style={styles.listContainer}>
          <View style={styles.list}>
            <Text style={styles.secondaryTextSm} testID="checkout-method-label">Method</Text>
            <Text style={styles.primaryTextSm} testID="checkout-method-value">
              {getPaymentMethodLabel(paymentMethod)}
            </Text>
          </View>
          {digitalEnabled && (
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={PAYMENT_METHOD_OPTIONS}
              disabled={isloading}
              testID="checkout-payment-selector"
            />
          )}
        </View>

        <View style={styles.emptyView}></View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        {country && city && streetAddress != "" && !isloading ? (
          <CustomButton
            testID="checkout-submit-btn"
            text={submitText}
            onPress={() => {
              handleSubmitPress();
            }}
          />
        ) : (
          <CustomButton testID="checkout-submit-btn" text={submitText} disabled />
        )}
      </View>
      <Modal
        testID="checkout-address-modal"
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modelBody}>
          <View style={styles.modelAddressContainer}>
            <CustomInput
              testID="checkout-country-input"
              value={country}
              setValue={setCountry}
              placeholder={"Enter Country"}
            />
            <CustomInput
              testID="checkout-city-input"
              value={city}
              setValue={setCity}
              placeholder={"Enter City"}
            />
            <CustomInput
              testID="checkout-street-input"
              value={streetAddress}
              setValue={setStreetAddress}
              placeholder={"Enter Street Address"}
            />
            <CustomInput
              testID="checkout-zipcode-input"
              value={zipcode}
              setValue={setZipcode}
              placeholder={"Enter ZipCode"}
              keyboardType={"number-pad"}
            />
            {streetAddress || city || country != "" ? (
              <CustomButton
                testID="checkout-save-address-btn"
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setAddress(`${streetAddress}, ${city},${country}`);
                }}
                text={"save"}
              />
            ) : (
              <CustomButton
                testID="checkout-close-modal-btn"
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
                text={"close"}
              />
            )}
          </View>
        </View>
      </Modal>
      <DemoPaymentSheet
        visible={paymentSheetVisible}
        amount={totalCost + deliveryCost}
        processing={isloading}
        onPay={(token) => placeOrder(token)}
        onCancel={handleCancelPayment}
        testID="checkout-payment-sheet"
      />
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 0,
    flex: 1,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  toBarText: {
    fontSize: 15,
    fontWeight: "600",
  },
  bodyContainer: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  orderSummaryContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    maxHeight: 220,
  },
  totalOrderInfoContainer: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.white,
  },
  primaryText: {
    marginBottom: 5,
    marginTop: 5,
    fontSize: 20,
    fontWeight: "bold",
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
  primaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
  },
  secondaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
  },
  listContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  buttomContainer: {
    width: "100%",
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
  },
  emptyView: {
    width: "100%",
    height: 20,
  },
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
    height: 400,
    backgroundColor: colors.white,
    borderRadius: 20,
    elevation: 3,
  },
});
