import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants";
import CustomButton from "../CustomButton";

const CameraPermissionGate = ({
  onRequestPermission,
  onOpenSettings,
  onCancel,
  status,
}) => {
  const isDenied = status === "denied";

  return (
    <View style={styles.container} testID="camera-permission-gate">
      <View style={styles.card}>
        <Text style={styles.title} testID="camera-permission-title">
          {isDenied ? "Camera access denied" : "Camera access needed"}
        </Text>
        <Text style={styles.body} testID="camera-permission-body">
          Scan product barcodes to find items faster.
        </Text>
        {isDenied ? (
          <>
            <CustomButton
              text="Open Settings"
              onPress={onOpenSettings}
              testID="camera-permission-settings-btn"
            />
            <CustomButton
              text="Search instead"
              onPress={onCancel}
              testID="camera-permission-search-btn"
            />
          </>
        ) : (
          <>
            <CustomButton
              text="Allow camera"
              onPress={onRequestPermission}
              testID="camera-permission-allow-btn"
            />
            <CustomButton
              text="Search instead"
              onPress={onCancel}
              testID="camera-permission-cancel-btn"
            />
          </>
        )}
      </View>
    </View>
  );
};

export default CameraPermissionGate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 360,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
});
