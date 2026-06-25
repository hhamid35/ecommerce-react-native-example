import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomInput from "../../components/CustomInput";
import ProgressDialog from "react-native-progress-dialog";
import RatingStars from "../../components/RatingStars";
import { getAdminReviews, patchReviewVisibility } from "../../services/reviews";

const VISIBILITY_COLORS = {
  published: colors.success,
  hidden: colors.warning,
  removed: colors.danger,
};

const ViewReviewsScreen = ({ navigation, route }) => {
  const { authUser } = route.params;
  const [isloading, setIsloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");

  const getToken = (obj) => {
    try {
      return JSON.parse(obj).token;
    } catch (e) {
      return obj.token;
    }
  };

  const fetchReviews = async () => {
    setIsloading(true);
    try {
      const { ok, result } = await getAdminReviews(getToken(authUser));
      if (ok && result.success) {
        setReviews(result.data);
        setFoundItems(result.data);
        setError("");
      } else {
        setError(result?.message || "Failed to load reviews");
      }
    } catch (err) {
      setError(err.message);
    }
    setIsloading(false);
  };

  const handleVisibilityChange = (reviewId, visibility) => {
    const applyChange = async () => {
      setIsloading(true);
      setLabel("Updating...");
      try {
        const { ok, result } = await patchReviewVisibility(
          reviewId,
          { visibility },
          getToken(authUser)
        );
        if (ok && result.success) {
          setError(result.message || "Review updated");
          setAlertType("success");
          fetchReviews();
        } else {
          setError(result?.message || "Failed to update review");
          setAlertType("error");
        }
      } catch (err) {
        setError(err.message);
        setAlertType("error");
      }
      setIsloading(false);
    };
    applyChange();
  };

  const filter = () => {
    const keyword = filterItem.toLowerCase();
    if (keyword !== "") {
      const results = reviews.filter(
        (item) =>
          item.productTitle?.toLowerCase().includes(keyword) ||
          item.user?.name?.toLowerCase().includes(keyword)
      );
      setFoundItems(results);
    } else {
      setFoundItems(reviews);
    }
  };

  useEffect(() => {
    filter();
  }, [filterItem, reviews]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchReviews();
    setRefreshing(false);
  };

  const truncateText = (text, max = 80) => {
    if (!text) return "Rating only";
    return text.length > max ? `${text.substring(0, max)}...` : text;
  };

  return (
    <View style={styles.container} testID="view-reviews-screen">
      <ProgressDialog visible={isloading} label={label} />
      <StatusBar />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="view-reviews-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText} testID="view-reviews-heading">
          Reviews
        </Text>
        <Text style={styles.screenNameParagraph} testID="view-reviews-subtitle">
          Moderate customer reviews
        </Text>
      </View>
      <CustomAlert message={error} type={alertType} testID="view-reviews-alert" />
      <CustomInput
        radius={5}
        placeholder={"Search by product or reviewer..."}
        value={filterItem}
        setValue={setFilterItem}
        testID="view-reviews-search-input"
      />
      <ScrollView
        testID="view-reviews-scroll"
        style={{ flex: 1, width: "100%", padding: 2 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />
        }
      >
        {foundItems.length === 0 ? (
          <Text testID="view-reviews-empty-text">No reviews found.</Text>
        ) : (
          foundItems.map((review, index) => (
            <View
              key={review._id}
              style={styles.reviewRow}
              testID={`view-reviews-item-${index}`}
            >
              <View style={styles.reviewHeader}>
                <Text style={styles.productTitle}>{review.productTitle}</Text>
                <View
                  style={[
                    styles.visibilityBadge,
                    { backgroundColor: VISIBILITY_COLORS[review.visibility] || colors.muted },
                  ]}
                >
                  <Text style={styles.visibilityText}>{review.visibility}</Text>
                </View>
              </View>
              <Text style={styles.reviewerName}>{review.user?.name}</Text>
              <RatingStars value={review.rating} size={14} />
              <Text style={styles.reviewExcerpt}>{truncateText(review.text)}</Text>
              <View style={styles.actionRow}>
                {review.visibility !== "hidden" && review.visibility !== "removed" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.hideBtn]}
                    onPress={() => handleVisibilityChange(review._id, "hidden")}
                    testID={`view-reviews-hide-${index}`}
                  >
                    <Text style={styles.actionBtnText}>Hide</Text>
                  </TouchableOpacity>
                )}
                {review.visibility === "hidden" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.publishBtn]}
                    onPress={() => handleVisibilityChange(review._id, "published")}
                    testID={`view-reviews-publish-${index}`}
                  >
                    <Text style={styles.actionBtnText}>Publish</Text>
                  </TouchableOpacity>
                )}
                {review.visibility !== "removed" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.removeBtn]}
                    onPress={() => handleVisibilityChange(review._id, "removed")}
                    testID={`view-reviews-remove-${index}`}
                  >
                    <Text style={styles.actionBtnText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ViewReviewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  topBarContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
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
  reviewRow: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.dark,
    flex: 1,
  },
  visibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  visibilityText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  reviewerName: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 4,
  },
  reviewExcerpt: {
    fontSize: 13,
    color: colors.dark,
    marginTop: 6,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  hideBtn: {
    backgroundColor: colors.warning,
  },
  publishBtn: {
    backgroundColor: colors.success,
  },
  removeBtn: {
    backgroundColor: colors.danger,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
});
