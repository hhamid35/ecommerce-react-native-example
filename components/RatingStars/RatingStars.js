import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";

const RatingStars = ({
  value = 0,
  onChange,
  size = 24,
  interactive = false,
  testID,
}) => {
  const stars = [1, 2, 3, 4, 5];

  const renderStar = (starValue) => {
    const filled = starValue <= Math.round(value);
    const iconName = filled ? "star" : "star-outline";

    if (interactive && onChange) {
      return (
        <TouchableOpacity
          key={starValue}
          onPress={() => onChange(starValue)}
          style={styles.starButton}
          testID={testID ? `${testID}-star-${starValue}` : undefined}
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        >
          <Ionicons name={iconName} size={size} color={colors.warning} />
        </TouchableOpacity>
      );
    }

    return (
      <Ionicons
        key={starValue}
        name={iconName}
        size={size}
        color={colors.warning}
        testID={testID ? `${testID}-star-${starValue}` : undefined}
      />
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      {stars.map(renderStar)}
    </View>
  );
};

export default RatingStars;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
