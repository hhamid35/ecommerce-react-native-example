import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../../constants";
import RatingStars from "../RatingStars";
import CustomButton from "../CustomButton";

const MAX_TEXT_LENGTH = 500;

const ReviewForm = ({
  initialRating = 0,
  initialText = "",
  onSubmit,
  loading = false,
  isEdit = false,
  testID,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);
  const [ratingError, setRatingError] = useState("");

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      setRatingError("Please select a star rating");
      return;
    }
    setRatingError("");
    onSubmit({ rating, text: text.trim() });
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>Your Rating</Text>
      <RatingStars
        value={rating}
        onChange={setRating}
        interactive
        size={32}
        testID={testID ? `${testID}-stars` : undefined}
      />
      {ratingError ? (
        <Text style={styles.errorText} testID={testID ? `${testID}-rating-error` : undefined}>
          {ratingError}
        </Text>
      ) : null}
      <Text style={styles.label}>Your Review (optional)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Share your experience (optional)"
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={5}
        maxLength={MAX_TEXT_LENGTH}
        value={text}
        onChangeText={setText}
        testID={testID ? `${testID}-text-input` : undefined}
      />
      <Text style={styles.charCounter} testID={testID ? `${testID}-char-count` : undefined}>
        {text.length}/{MAX_TEXT_LENGTH}
      </Text>
      <CustomButton
        text={isEdit ? "Update Review" : "Submit Review"}
        onPress={handleSubmit}
        disabled={loading}
        testID={testID ? `${testID}-submit` : undefined}
      />
    </View>
  );
};

export default ReviewForm;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
    marginTop: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.shadow,
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 14,
    color: colors.dark,
    backgroundColor: colors.white,
  },
  charCounter: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "right",
    marginTop: 4,
    marginBottom: 12,
  },
});
