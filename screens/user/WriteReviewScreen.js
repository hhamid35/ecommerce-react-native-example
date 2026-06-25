import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import ProgressDialog from "react-native-progress-dialog";
import ReviewForm from "../../components/ReviewForm";
import * as authStorage from "../../utils/authStorage";
import {
  getEligibility,
  createReview,
  updateReview,
} from "../../services/reviews";

const WriteReviewScreen = ({ navigation, route }) => {
  const { product, existingReview: initialReview } = route.params;
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("Loading...");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [existingReview, setExistingReview] = useState(initialReview || null);
  const [eligible, setEligible] = useState(!!initialReview);

  const logout = async () => {
    await authStorage.deleteItem("authUser");
    navigation.replace("login");
  };

  useEffect(() => {
    const checkEligibility = async () => {
      if (initialReview) {
        setEligible(true);
        return;
      }
      setLoading(true);
      try {
        const value = await authStorage.getItem("authUser");
        if (!value) {
          setError("Please sign in to write a review");
          setAlertType("error");
          setLoading(false);
          return;
        }
        const user = JSON.parse(value);
        const { ok, result } = await getEligibility(product._id, user.token);
        if (result?.err === "jwt expired") {
          logout();
          return;
        }
        if (ok && result.success) {
          if (!result.data.eligible) {
            setError("Only verified purchasers can review this product.");
            setAlertType("error");
            setEligible(false);
          } else {
            setEligible(true);
            if (result.data.existingReview) {
              setExistingReview(result.data.existingReview);
            }
          }
        } else {
          setError(result?.message || "Unable to verify eligibility");
          setAlertType("error");
        }
      } catch (err) {
        setError(err.message);
        setAlertType("error");
      }
      setLoading(false);
    };
    checkEligibility();
  }, []);

  const handleSubmit = async ({ rating, text }) => {
    setLoading(true);
    setLabel("Submitting...");
    try {
      const value = await authStorage.getItem("authUser");
      const user = JSON.parse(value);
      const isEdit = !!existingReview;
      const { ok, result } = isEdit
        ? await updateReview(product._id, { rating, text }, user.token)
        : await createReview(product._id, { rating, text }, user.token);

      if (result?.err === "jwt expired") {
        logout();
        return;
      }

      if (ok && result.success) {
        setError(result.message || "Review submitted");
        setAlertType("success");
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        setError(result?.message || "Failed to submit review");
        setAlertType("error");
      }
    } catch (err) {
      setError(err.message);
      setAlertType("error");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container} testID="write-review-screen">
      <ProgressDialog visible={loading} label={label} />
      <StatusBar />
      <View style={styles.topBarContainer}>
        <TouchableOpacity
          testID="write-review-back-btn"
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.bodyContainer}
        keyboardShouldPersistTaps="handled"
        testID="write-review-scroll"
      >
        <Text style={styles.heading} testID="write-review-heading">
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </Text>
        <Text style={styles.productTitle} testID="write-review-product-title">
          {product?.title}
        </Text>
        <CustomAlert message={error} type={alertType} testID="write-review-alert" />
        {eligible && (
          <ReviewForm
            initialRating={existingReview?.rating || 0}
            initialText={existingReview?.text || ""}
            onSubmit={handleSubmit}
            loading={loading}
            isEdit={!!existingReview}
            testID="review-form"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default WriteReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 20,
  },
  topBarContainer: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 10,
  },
  bodyContainer: {
    flex: 1,
    width: "100%",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.muted,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 16,
  },
});
