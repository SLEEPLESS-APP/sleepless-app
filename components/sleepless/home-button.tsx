import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface HomeButtonProps {
  style?: object;
}

export function HomeButton({ style }: HomeButtonProps) {
  const handlePress = () => {
    router.replace("/(tabs)" as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <MaterialIcons name="home" size={28} color="rgba(255,255,255,0.8)" />
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
