import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export function OrganizerButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push("/organizer" as any)}
    >
      <Text style={styles.icon}>🎤</Text>
      <Text style={styles.text}>Organizer Portal</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "rgba(255, 107, 129, 0.8)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
