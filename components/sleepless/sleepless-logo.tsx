import { View, Text, StyleSheet } from "react-native";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";

interface SleeplessLogoProps {
  size?: "small" | "medium" | "large";
}

export function SleeplessLogo({ size = "medium" }: SleeplessLogoProps) {
  const [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  const fontSize = size === "small" ? 36 : size === "medium" ? 52 : 72;

  // Use fallback font if Pacifico hasn't loaded yet
  const fontFamily = fontsLoaded ? "Pacifico_400Regular" : "System";

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, { fontSize, fontFamily }]}>Sleepless</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  logo: {
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
});
