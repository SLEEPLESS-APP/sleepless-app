import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface BackButtonProps {
  style?: object;
  onPress?: () => void;
}

export function BackButton({ style, onPress }: BackButtonProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <MaterialIcons name="arrow-back" size={28} color="rgba(255,255,255,0.8)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
