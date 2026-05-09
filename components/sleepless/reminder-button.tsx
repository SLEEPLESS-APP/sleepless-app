import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Alert, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useReminders, type Reminder } from "@/lib/reminders-context";
import { getEventById } from "@/data/mock-data";

interface ReminderButtonProps {
  eventId: string;
  size?: number;
}

type ReminderTime = Reminder["reminderTime"];

const reminderOptions: { value: ReminderTime; label: string }[] = [
  { value: "1hour", label: "1 hour before" },
  { value: "1day", label: "1 day before" },
  { value: "1week", label: "1 week before" },
];

export function ReminderButton({ eventId, size = 24 }: ReminderButtonProps) {
  const { hasReminderForEvent, getReminderForEvent, addReminder, removeReminder } = useReminders();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const hasReminder = hasReminderForEvent(eventId);
  const existingReminder = getReminderForEvent(eventId);
  const event = getEventById(eventId);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (hasReminder) {
      // Show confirmation to remove reminder
      Alert.alert(
        "Remove Reminder",
        "Do you want to remove the reminder for this event?",
        [
          { text: "Keep", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              if (existingReminder) {
                await removeReminder(existingReminder.id);
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }
            },
          },
        ]
      );
    } else {
      setIsModalVisible(true);
    }
  };

  const handleSetReminder = async (reminderTime: ReminderTime) => {
    if (!event) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await addReminder({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      reminderTime,
    });

    setIsModalVisible(false);

    const label = reminderOptions.find((o) => o.value === reminderTime)?.label || "";
    Alert.alert(
      "Reminder Set",
      `You'll be notified ${label} the event starts.`,
      [{ text: "OK" }]
    );
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <MaterialIcons
          name={hasReminder ? "notifications-active" : "notifications-none"}
          size={size}
          color={hasReminder ? "#fbbf24" : "rgba(255, 255, 255, 0.7)"}
        />
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="notifications" size={28} color="#ff6b6b" />
              <Text style={styles.modalTitle}>Set Reminder</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              When do you want to be reminded?
            </Text>

            <View style={styles.optionsContainer}>
              {reminderOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSetReminder(option.value)}
                  style={({ pressed }) => [styles.optionButton, pressed && styles.optionPressed]}
                >
                  <MaterialIcons name="alarm" size={20} color="#ff6b6b" />
                  <Text style={styles.optionText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => setIsModalVisible(false)}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 8,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  optionPressed: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderColor: "#ff6b6b",
  },
  optionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
});
