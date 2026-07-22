jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Icon = (props) => <Text testID={props.testID}>{props.name}</Text>;

  return {
    Ionicons: Icon,
    MaterialIcons: Icon,
    AntDesign: Icon,
    MaterialCommunityIcons: Icon,
  };
});
