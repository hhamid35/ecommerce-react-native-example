import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import ReviewCard from "../ReviewCard";

const ReviewList = ({ reviews = [], testID }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty` : undefined}>
          No reviews to display yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {reviews.map((review, index) => (
        <ReviewCard
          key={review._id || index}
          review={review}
          testID={testID ? `${testID}-item-${index}` : undefined}
        />
      ))}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  emptyContainer: {
    paddingVertical: 10,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
  },
});
