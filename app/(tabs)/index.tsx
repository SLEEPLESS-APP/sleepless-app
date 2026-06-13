import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientBackground, SleeplessLogo } from "@/components/sleepless";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <SleeplessLogo size="large" />
            <Text style={styles.tagline}>Discover events happening near you</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>

            {/* Browse Events */}
            <TouchableOpacity
              onPress={() => router.push("/events/provinces" as any)}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a5a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonIcon}>🎉</Text>
                <View>
                  <Text style={styles.buttonTitle}>Browse Events</Text>
                  <Text style={styles.buttonSub}>Find events near you</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Organizer Portal */}
            <TouchableOpacity
              onPress={() => router.push("/organizer/login" as any)}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={["#7c3aed", "#6d28d9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonIcon}>🎤</Text>
                <View>
                  <Text style={styles.buttonTitle}>Organizer Portal</Text>
                  <Text style={styles.buttonSub}>Create & manage events</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Admin */}
            <TouchableOpacity
              onPress={() => router.push("/admin/login" as any)}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={["#1e3a5f", "#1e2d4f"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonIcon}>🔐</Text>
                <View>
                  <Text style={styles.buttonTitle}>Admin</Text>
                  <Text style={styles.buttonSub}>Platform management</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

          </View>

          <Text style={styles.footer}>sleeplessapp.co.za</Text>

        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  tagline: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    marginTop: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  buttonIcon: {
    fontSize: 32,
  },
  buttonTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  buttonSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    letterSpacing: 1,
  },
});
