import { Pressable, StyleSheet, Platform, Share, Alert } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { getEventById } from "@/data/mock-data";

interface ShareButtonProps {
  eventId: string;
  size?: number;
  style?: object;
}

export function ShareButton({ eventId, size = 28, style }: ShareButtonProps) {
  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const event = getEventById(eventId);
    if (!event) {
      Alert.alert("Error", "Event not found");
      return;
    }

    const shareMessage = `🎉 Check out ${event.name}!\n\n📅 Date: ${event.date}\n📍 Venue: ${event.venue}\n⏰ Time: ${event.time}\n\n🎵 Line up: ${event.lineup.join(", ")}\n\nDownload Sleepless to discover more events! 🌙`;

    try {
      const result = await Share.share({
        message: shareMessage,
        title: `Sleepless - ${event.name}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log("Shared with:", result.activityType);
        } else {
          // Shared
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share event");
    }
  };

  return (
    <Pressable
      onPress={handleShare}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <MaterialIcons
        name="share"
        size={size}
        color="rgba(255,255,255,0.8)"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
