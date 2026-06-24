import "react-native-gesture-handler";
import Routes from "./routes/Routes";
import { Provider } from "react-redux";
import { store } from "./states/store";
export default function App() {
  console.reportErrorsAsExceptions = false;
  return (
    <Provider store={store} testID="app-provider">
      <Routes testID="app-routes" />
    </Provider>
  );
}
