import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PUSH_TOKEN_KEY = "sleepless_push_token";
const NOTIFICATIONS_ENABLED_KEY = "sleepless_notifications_enabled";

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  // Check if we're on a physical device (push notifications don't work on simulators)
  if (Platform.OS === "web") {
    console.log("Push notifications are not supported on web");
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return null;
  }

  // Get the token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Will use the projectId from app.json
    });
    token = tokenData.data;

    // Save token to storage
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");

    console.log("Push token:", token);
  } catch (error) {
    console.error("Error getting push token:", error);
  }

  // Configure Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B6B",
    });

    await Notifications.setNotificationChannelAsync("events", {
      name: "Event Updates",
      description: "Notifications about upcoming events and new events in your area",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B6B",
    });
  }

  return token;
}

export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return enabled === "true";
  } catch {
    return false;
  }
}

export async function disableNotifications(): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
}

export async function enableNotifications(): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
}

// Schedule a local notification (useful for event reminders)
export async function scheduleEventReminder(
  eventId: string,
  eventName: string,
  eventDate: Date,
  reminderMinutesBefore: number = 60
): Promise<string | null> {
  const triggerDate = new Date(eventDate.getTime() - reminderMinutesBefore * 60 * 1000);

  // Don't schedule if the reminder time has already passed
  if (triggerDate <= new Date()) {
    console.log("Reminder time has already passed");
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Event Reminder 🎉",
        body: `${eventName} starts in ${reminderMinutesBefore} minutes!`,
        data: { eventId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelEventReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Send a test local notification
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Sleepless 🌙",
      body: "Notifications are working! You'll receive updates about events.",
      sound: true,
    },
    trigger: null, // Send immediately
  });
}
