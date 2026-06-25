import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import RatingStars from "../RatingStars";

const STAR_LEVELS = [5, 4, 3, 2, 1];

const ReviewSummary = ({ summary, testID }) => {
  if (!summary || summary.totalCount === 0) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.emptyText} testID={testID ? `${testID}-empty` : undefined}>
          No reviews yet — be the first to share your experience!
        </Text>
      </View>
    );
  }

  const { averageRating, totalCount, distribution } = summary;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.averageText} testID={testID ? `${testID}-average` : undefined}>
          {averageRating.toFixed(1)}
        </Text>
        <View style={styles.headerDetails}>
          <RatingStars value={averageRating} size={18} testID={testID ? `${testID}-stars` : undefined} />
          <Text style={styles.countText} testID={testID ? `${testID}-count` : undefined}>
            ({totalCount} {totalCount === 1 ? "review" : "reviews"})
          </Text>
        </View>
      </View>
      <View style={styles.distributionContainer}>
        {STAR_LEVELS.map((level) => {
          const count = distribution[level] || 0;
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <View key={level} style={styles.distributionRow} testID={testID ? `${testID}-bar-${level}` : undefined}>
              <Text style={styles.starLabel}>{level}★</Text>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.barCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ReviewSummary;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 10,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  averageText: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.dark,
    marginRight: 12,
  },
  headerDetails: {
    flex: 1,
  },
  countText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  distributionContainer: {
    width: "100%",
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starLabel: {
    width: 28,
    fontSize: 12,
    color: colors.muted,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.light,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: 4,
  },
  barCount: {
    width: 24,
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
  },
});
