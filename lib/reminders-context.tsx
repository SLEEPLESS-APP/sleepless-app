import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const REMINDERS_KEY = "sleepless_reminders";

export interface Reminder {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  reminderTime: "1hour" | "1day" | "1week";
  notificationId?: string;
  createdAt: string;
}

interface RemindersContextType {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, "id" | "createdAt" | "notificationId">) => Promise<Reminder>;
  removeReminder: (reminderId: string) => Promise<void>;
  hasReminderForEvent: (eventId: string) => boolean;
  getReminderForEvent: (eventId: string) => Reminder | undefined;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getReminderDate(eventDateStr: string, eventTime: string, reminderTime: Reminder["reminderTime"]): Date {
  // Parse event date (format: "Sat, 14 June 2025")
  const months: { [key: string]: number } = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  
  const parts = eventDateStr.replace(/,/g, "").split(" ");
  const day = parseInt(parts[1]);
  const month = months[parts[2]];
  const year = parseInt(parts[3]);
  
  // Parse time (format: "21:00 - 04:00")
  const startTime = eventTime.split(" - ")[0];
  const [hours, minutes] = startTime.split(":").map(Number);
  
  const eventDate = new Date(year, month, day, hours, minutes);
  
  // Calculate reminder time
  switch (reminderTime) {
    case "1hour":
      return new Date(eventDate.getTime() - 60 * 60 * 1000);
    case "1day":
      return new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
    case "1week":
      return new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    default:
      return eventDate;
  }
}

function getReminderLabel(reminderTime: Reminder["reminderTime"]): string {
  switch (reminderTime) {
    case "1hour":
      return "1 hour";
    case "1day":
      return "1 day";
    case "1week":
      return "1 week";
    default:
      return "";
  }
}

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    loadReminders();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    if (Platform.OS === "web") return;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === "granted";
  };

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDERS_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
    }
  };

  const saveReminders = async (newReminders: Reminder[]) => {
    try {
      await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(newReminders));
    } catch (error) {
      console.error("Error saving reminders:", error);
    }
  };

  const addReminder = async (reminderData: Omit<Reminder, "id" | "createdAt" | "notificationId">): Promise<Reminder> => {
    let notificationId: string | undefined;

    // Schedule notification (only on native platforms)
    if (Platform.OS !== "web") {
      const reminderDate = getReminderDate(
        reminderData.eventDate,
        reminderData.eventTime,
        reminderData.reminderTime
      );

      // Only schedule if reminder date is in the future
      if (reminderDate > new Date()) {
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "🎉 Event Reminder",
            body: `${reminderData.eventName} starts in ${getReminderLabel(reminderData.reminderTime)}!`,
            data: { eventId: reminderData.eventId },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          },
        });
      }
    }

    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      notificationId,
    };

    const newReminders = [...reminders, newReminder];
    setReminders(newReminders);
    await saveReminders(newReminders);
    return newReminder;
  };

  const removeReminder = async (reminderId: string) => {
    const reminder = reminders.find((r) => r.id === reminderId);
    
    // Cancel scheduled notification
    if (reminder?.notificationId && Platform.OS !== "web") {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    }

    const newReminders = reminders.filter((r) => r.id !== reminderId);
    setReminders(newReminders);
    await saveReminders(newReminders);
  };

  const hasReminderForEvent = (eventId: string): boolean => {
    return reminders.some((r) => r.eventId === eventId);
  };

  const getReminderForEvent = (eventId: string): Reminder | undefined => {
    return reminders.find((r) => r.eventId === eventId);
  };

  return (
    <RemindersContext.Provider
      value={{ reminders, addReminder, removeReminder, hasReminderForEvent, getReminderForEvent }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error("useReminders must be used within a RemindersProvider");
  }
  return context;
}
