import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { colors } from "../../constants";
import RatingStars from "../RatingStars";

const ReviewCard = ({ review, testID }) => {
  const formattedDate = review.updatedAt
    ? format(new Date(review.updatedAt), "dd MMM yyyy")
    : "";

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.nameText} testID={testID ? `${testID}-name` : undefined}>
          {review.user?.name || "Anonymous"}
        </Text>
        <Text style={styles.dateText} testID={testID ? `${testID}-date` : undefined}>
          {formattedDate}
        </Text>
      </View>
      <RatingStars value={review.rating} size={16} testID={testID ? `${testID}-rating` : undefined} />
      {review.text ? (
        <Text style={styles.reviewText} testID={testID ? `${testID}-text` : undefined}>
          {review.text}
        </Text>
      ) : (
        <Text style={styles.ratingOnlyText} testID={testID ? `${testID}-rating-only` : undefined}>
          Rating only
        </Text>
      )}
      <View style={styles.badgeRow}>
        {review.verifiedPurchase && (
          <View style={styles.verifiedBadge} testID={testID ? `${testID}-verified` : undefined}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.verifiedText}>Verified Purchase</Text>
          </View>
        )}
        {review.visibility === "hidden" && (
          <View style={styles.hiddenChip} testID={testID ? `${testID}-hidden` : undefined}>
            <Text style={styles.hiddenText}>Hidden by moderator</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
  },
  reviewText: {
    fontSize: 14,
    color: colors.dark,
    marginTop: 8,
    lineHeight: 20,
  },
  ratingOnlyText: {
    fontSize: 13,
    color: colors.muted,
    fontStyle: "italic",
    marginTop: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    color: colors.success,
    marginLeft: 4,
    fontWeight: "600",
  },
  hiddenChip: {
    backgroundColor: colors.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hiddenText: {
    fontSize: 11,
    color: colors.muted,
    fontStyle: "italic",
  },
});
