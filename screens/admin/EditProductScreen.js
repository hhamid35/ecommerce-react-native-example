import {
  StyleSheet,
  Text,
  Image,
  StatusBar,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import * as ImagePicker from "expo-image-picker";
import ProgressDialog from "react-native-progress-dialog";
import { AntDesign } from "@expo/vector-icons";

const EditProductScreen = ({ navigation, route }) => {
  const { product, authUser } = route.params;
  const [isloading, setIsloading] = useState(false);
  const [label, setLabel] = useState("Updating...");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("garments");
  const [alertType, setAlertType] = useState("error");

  var myHeaders = new Headers();
  myHeaders.append("x-auth-token", authUser.token);
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    title: title,
    sku: sku,
    price: price,
    image: image,
    description: description,
    category: category,
    quantity: quantity,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  //Method for selecting the image from device gallery
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    console.log(result);
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  //Method for imput validation and post data to server to edit product using API call
  const editProductHandle = () => {
    setIsloading(true);
    if (title == "") {
      setError("Please enter the product title");
      setIsloading(false);
    } else if (price == 0) {
      setError("Please enter the product price");
      setIsloading(false);
    } else if (quantity <= 0) {
      setError("Quantity must be greater then 1");
      setIsloading(false);
    } else if (image == null) {
      setError("Please upload the product image");
      setIsloading(false);
    } else {
      console.log(`${network.serverip}"/update-product?id=${product._id}"`);
      fetch(
        `${network.serverip}/update-product?id=${product._id}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          if (result.success == true) {
            setIsloading(false);
            setError(result.message);
            setPrice("");
            setQuantity("");
            setSku("");
            setTitle("");
          }
        })
        .catch((error) => {
          setIsloading(false);
          setError(error.message);
          console.log("error", error);
        });
    }
  };

  // set all the input fields and image on initial render
  useEffect(() => {
    setImage(`${network.serverip}/uploads/${product?.image}`);
    setTitle(product.title);
    setSku(product.sku);
    setQuantity(product.quantity.toString());
    setPrice(product.price.toString());
    setDescription(product.description);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} testID="edit-product-screen">
      <StatusBar testID="edit-product-status-bar"></StatusBar>
      <ProgressDialog visible={isloading} label={label} />
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          testID="edit-product-back-btn"
          onPress={() => {
            // navigation.replace("viewproduct", { authUser: authUser });
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText} testID="edit-product-heading">Edit Product</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph} testID="edit-product-subtitle">Edit product details</Text>
        </View>
      </View>
      <CustomAlert message={error} type={"error"} testID="edit-product-alert" />
      <ScrollView style={{ flex: 1, width: "100%" }} testID="edit-product-scroll">
        <View style={styles.formContainer}>
          <View style={styles.imageContainer}>
            {image ? (
              <TouchableOpacity style={styles.imageHolder} onPress={pickImage} testID="edit-product-image-picker">
                <Image
                  source={{ uri: image }}
                  style={{ width: 200, height: 200 }}
                  testID="edit-product-image-preview"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.imageHolder} onPress={pickImage} testID="edit-product-image-picker">
                <AntDesign name="pluscircle" size={50} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
          <CustomInput
            value={sku}
            setValue={setSku}
            placeholder={"SKU"}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="edit-product-sku-input"
          />
          <CustomInput
            value={title}
            setValue={setTitle}
            placeholder={"Title"}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="edit-product-title-input"
          />
          <CustomInput
            value={price}
            setValue={setPrice}
            placeholder={"Price"}
            keyboardType={"number-pad"}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="edit-product-price-input"
          />
          <CustomInput
            value={quantity}
            setValue={setQuantity}
            placeholder={"Quantity"}
            keyboardType={"number-pad"}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="edit-product-quantity-input"
          />
          <CustomInput
            value={description}
            setValue={setDescription}
            placeholder={"Description"}
            placeholderTextColor={colors.muted}
            radius={5}
            testID="edit-product-description-input"
          />
        </View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        <CustomButton text={"Edit Product"} onPress={editProductHandle} testID="edit-product-submit-btn" />
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditProductScreen;

const styles = StyleSheet.create({
  container: {
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  formContainer: {
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    flexDirecion: "row",
    padding: 5,
  },

  buttomContainer: {
    width: "100%",
  },
  bottomContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 5,
    fontSize: 15,
  },
  imageContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    height: 250,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
  imageHolder: {
    height: 200,
    width: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
    borderRadius: 10,
    elevation: 5,
  },
});
