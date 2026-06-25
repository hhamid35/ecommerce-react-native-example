import {
  StyleSheet,
  StatusBar,
  View,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors } from "../../constants";
import { network } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import { category, slides } from "../../constants/AppData";
import HomeHeader from "../../components/HomeScreen/HomeHeader";
import SearchBar from "../../components/HomeScreen/SearchBar";
import PromotionSlider from "../../components/HomeScreen/PromotionSlider";
import CategoryList from "../../components/HomeScreen/CategoryList";
import NewArrivals from "../../components/HomeScreen/NewArrivals";

const HomeScreen = ({ navigation, route }) => {
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();

  const { addCartItem } = bindActionCreators(actionCreaters, dispatch);

  const { user } = route.params;
  const [products, setProducts] = useState([]);
  const [refeshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [searchItems, setSearchItems] = useState([]);
  const [prefillSearch, setPrefillSearch] = useState("");

  //method to convert the authUser to json object
  const convertToJSON = (obj) => {
    try {
      setUserInfo(JSON.parse(obj));
    } catch (e) {
      setUserInfo(obj);
    }
  };

  //method to navigate to product detail screen of a specific product
  const handleProductPress = (product) => {
    navigation.navigate("productdetail", { product: product });
  };

  const handleScanPress = () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Scan unavailable",
        "Barcode scanning is available on iOS and Android."
      );
      return;
    }
    navigation.navigate("scan");
  };

  //method to add to cart (redux)
  const handleAddToCat = (product) => {
    addCartItem(product);
  };

  var headerOptions = {
    method: "GET",
    redirect: "follow",
  };

  const fetchProduct = () => {
    fetch(`${network.serverip}/products`, headerOptions) //API call
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setProducts(result.data);
          setError("");
          let payload = [];
          result.data.forEach((cat, index) => {
            let searchableItem = { ...cat, id: ++index, name: cat.title };
            payload.push(searchableItem);
          });
          setSearchItems(payload);
        } else {
          setError(result.message);
        }
      })
      .catch((error) => {
        setError(error.message);
        console.log("error", error);
      });
  };

  //method call on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchProduct();
    setRefreshing(false);
  };

  //convert user to json and fetch products in initial render
  useEffect(() => {
    convertToJSON(user);
    fetchProduct();
  }, []);

  useEffect(() => {
    if (route.params?.prefillSearch) {
      setPrefillSearch(route.params.prefillSearch);
      navigation.setParams({ prefillSearch: undefined });
    }
  }, [route.params?.prefillSearch]);

  return (
    <View style={styles.container} testID="home-screen">
      <StatusBar testID="home-status-bar"></StatusBar>
      <HomeHeader navigation={navigation} cartproduct={cartproduct} />
      <View style={styles.bodyContainer} testID="home-body">
        <SearchBar
          searchItems={searchItems}
          handleProductPress={handleProductPress}
          onScanPress={handleScanPress}
          prefillSearch={prefillSearch}
        />
        <ScrollView nestedScrollEnabled={true} testID="home-scroll">
          <PromotionSlider slides={slides} />
          <CategoryList category={category} navigation={navigation} />
          <NewArrivals
            products={products}
            handleProductPress={handleProductPress}
            handleAddToCat={handleAddToCat}
            refeshing={refeshing}
            handleOnRefresh={handleOnRefresh}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default HomeScreen;

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
  bodyContainer: {
    width: "100%",
    flexDirecion: "row",
    paddingBottom: 0,
    flex: 1,
  },
});
