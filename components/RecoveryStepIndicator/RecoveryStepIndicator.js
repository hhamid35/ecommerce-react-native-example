import React from "react";
import { View, StyleSheet } from "react-native";
import StepIndicator from "react-native-step-indicator";
import { colors } from "../../constants";

const LABELS = ["Email", "Verify", "Reset"];

const customStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: colors.primary,
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: colors.primary,
  stepStrokeUnFinishedColor: "#aaaaaa",
  separatorFinishedColor: "#fe7013",
  separatorUnFinishedColor: "#aaaaaa",
  stepIndicatorFinishedColor: "#fe7013",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: colors.white,
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: "#fe7013",
  stepIndicatorLabelFinishedColor: "#ffffff",
  stepIndicatorLabelUnFinishedColor: "#aaaaaa",
  labelColor: "#999999",
  labelSize: 13,
  currentStepLabelColor: "#fe7013",
};

const RecoveryStepIndicator = ({ currentStep = 0 }) => {
  return (
    <View style={styles.container} testID="recovery-step-indicator">
      <StepIndicator
        customStyles={customStyles}
        currentPosition={currentStep}
        stepCount={LABELS.length}
        labels={LABELS}
      />
    </View>
  );
};

export default RecoveryStepIndicator;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },
});
