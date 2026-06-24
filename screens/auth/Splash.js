import { StyleSheet, Image, View } from "react-native";
import React, { useEffect } from "react";
import { colors } from "../../constants";
import logo from "../../assets/logo/logo_white.png";
import * as authStorage from "../../utils/authStorage";

const Splash = ({ navigation }) => {
  const goToLogin = () => {
    setTimeout(() => {
      navigation.replace("login");
    }, 2000);
  };

  //method to fetch the authUser data from secure storage if there is any and login the Dashboard or Home Screen according to the user type
  const _retrieveData = async () => {
    try {
      const value = await authStorage.getItem("authUser");
      if (value !== null) {
        let user = JSON.parse(value); // covert the authUser value to json
        if (user.userType === "ADMIN") {
          setTimeout(() => {
            navigation.replace("dashboard", { authUser: JSON.parse(value) }); // navigate to Admin dashboard
          }, 2000);
        } else {
          setTimeout(() => {
            navigation.replace("tab", { user: JSON.parse(value) }); // navigate to User Home screen
          }, 2000);
        }
      } else {
        goToLogin();
      }
    } catch (error) {
      console.log(error);
      goToLogin();
    }
  };

  // check the authUser and navigate to screens accordingly on initial render
  useEffect(() => {
    _retrieveData();
  }, []);

  return (
    <View style={styles.container} testID="splash-screen">
      <Image style={styles.logo} source={logo} testID="splash-logo" />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  splashText: {
    color: colors.light,
    fontSize: 50,
    fontWeight: "bold",
  },
  logo: {
    resizeMode: "contain",
    width: 80,
    height: 80,
  },
});
