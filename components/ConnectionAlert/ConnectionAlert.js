import { Platform } from "react-native";
import InternetConnectionAlert from "react-native-internet-connection-alert";

const ConnectionAlert = ({ children, onChange }) => {
  if (Platform.OS === "web") {
    return children;
  }
  return (
    <InternetConnectionAlert onChange={onChange}>{children}</InternetConnectionAlert>
  );
};

export default ConnectionAlert;
 