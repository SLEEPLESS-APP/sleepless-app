import { View, Text, StyleSheet, Platform } from "react-native";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { useEffect } from "react";

interface SleeplessLogoProps {
  size?: "small" | "medium" | "large";
}

export function SleeplessLogo({ size = "medium" }: SleeplessLogoProps) {
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  useEffect(() => {
    if (Platform.OS === "web") {
      // Inject Pacifico via Google Fonts on web for reliable loading
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Pacifico&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const fontSize = size === "small" ? 36 : size === "medium" ? 52 : 72;

  const fontFamily = Platform.OS === "web"
    ? "Pacifico"
    : fontsLoaded ? "Pacifico_400Regular" : "System";

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, { fontSize, fontFamily }]}>Sleepless</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  logo: {
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
});
