import { Platform } from "react-native";

/**
 * Push notifications — native only.
 * On web, all functions are no-ops so the build succeeds.
 */

// Set up notification handler (native only)
if (Platform.OS !== "web") {
  import("expo-notifications").then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    const Notifications = await import("expo-notifications");
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
      });
      await Notifications.setNotificationChannelAsync("events", {
        name: "Events",
        importance: Notifications.AndroidImportance.MAX,
        description: "Notifications about upcoming events",
      });
    }

    return token;
  } catch (err) {
    console.warn("[Notifications] Failed to register:", err);
    return null;
  }
}

export async function scheduleEventReminder(
  eventTitle: string,
  eventDate: Date
): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const Notifications = await import("expo-notifications");
    const reminderDate = new Date(eventDate.getTime() - 60 * 60 * 1000);
    if (reminderDate <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Event Reminder 🎉",
        body: `${eventTitle} starts in 1 hour!`,
        sound: true,
      },
      trigger: { date: reminderDate },
    });
  } catch (err) {
    console.warn("[Notifications] Failed to schedule:", err);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const Notifications = await import("expo-notifications");
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
