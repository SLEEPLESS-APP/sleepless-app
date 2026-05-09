import { StyleSheet, Pressable, Text, View, Platform, ActivityIndicator } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

interface SocialLoginButtonProps {
  provider: "google" | "apple";
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SocialLoginButton({ provider, onPress, isLoading, disabled }: SocialLoginButtonProps) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const isGoogle = provider === "google";
  const icon = isGoogle ? "g-mobiledata" : "apple";
  const label = isGoogle ? "Continue with Google" : "Continue with Apple";
  const bgColor = isGoogle ? "#ffffff" : "#000000";
  const textColor = isGoogle ? "#1f1f1f" : "#ffffff";
  const iconColor = isGoogle ? "#4285F4" : "#ffffff";

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          <View style={styles.iconContainer}>
            {isGoogle ? (
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
            ) : (
              <MaterialIcons name="apple" size={22} color={iconColor} />
            )}
          </View>
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
