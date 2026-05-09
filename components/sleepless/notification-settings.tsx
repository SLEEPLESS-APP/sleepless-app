import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, Pressable, Platform, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import {
  registerForPushNotifications,
  areNotificationsEnabled,
  enableNotifications,
  disableNotifications,
  sendTestNotification,
} from "@/lib/notifications";

export function NotificationSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const enabled = await areNotificationsEnabled();
    setIsEnabled(enabled);
    setIsLoading(false);
  };

  const handleToggle = async (value: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (value) {
      // Enable notifications
      const token = await registerForPushNotifications();
      if (token) {
        await enableNotifications();
        setIsEnabled(true);
        Alert.alert(
          "Notifications Enabled",
          "You'll receive updates about events in your area!"
        );
      } else {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive event updates."
        );
      }
    } else {
      // Disable notifications
      await disableNotifications();
      setIsEnabled(false);
    }
  };

  const handleTestNotification = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!isEnabled) {
      Alert.alert("Enable Notifications", "Please enable notifications first.");
      return;
    }

    await sendTestNotification();
    Alert.alert("Test Sent", "Check your notifications!");
  };

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <MaterialIcons name="notifications" size={24} color="#ff6b6b" />
          <Text style={styles.label}>Push Notifications</Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: "rgba(255,255,255,0.2)", true: "#ff6b6b" }}
          thumbColor={isEnabled ? "#ffffff" : "#f4f3f4"}
        />
      </View>

      <Text style={styles.description}>
        Get notified about new events, reminders, and updates
      </Text>

      {isEnabled && (
        <Pressable
          onPress={handleTestNotification}
          style={({ pressed }) => [styles.testButton, pressed && styles.pressed]}
        >
          <MaterialIcons name="send" size={18} color="#ffffff" />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  label: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 8,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 107, 107, 0.3)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  testButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
});
