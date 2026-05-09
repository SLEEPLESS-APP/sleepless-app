import { Pressable, StyleSheet, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { useFavorites } from "@/lib/favorites-context";

interface FavoriteButtonProps {
  eventId: string;
  size?: number;
  style?: object;
}

export function FavoriteButton({ eventId, size = 28, style }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(eventId);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(eventId);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <MaterialIcons
        name={favorited ? "favorite" : "favorite-border"}
        size={size}
        color={favorited ? "#ff6b6b" : "rgba(255,255,255,0.8)"}
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
