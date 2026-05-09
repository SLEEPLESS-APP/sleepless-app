import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, SleeplessLogo } from "@/components/sleepless";
import { useOrganizer } from "@/lib/organizer-context";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function OrganizerPortalIndex() {
  const router = useRouter();
  const { isOrganizer, organizer } = useOrganizer();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOrganizer && organizer) {
      router.replace("/organizer/dashboard" as any);
    }
  }, [isOrganizer, organizer]);

  const handleLogin = () => {
    console.log("[Organizer Portal] Login clicked");
    router.push("/organizer/login" as any);
  };

  const handleRegister = () => {
    console.log("[Organizer Portal] Register clicked");
    router.push("/organizer/register" as any);
  };

  const handleBackToApp = () => {
    console.log("[Organizer Portal] Back to App clicked");
    router.back();
  };

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <SleeplessLogo size="large" />
            <Text style={styles.title}>Organizer Portal</Text>
            <Text style={styles.subtitle}>Manage your events and reach thousands of attendees</Text>
          </View>

          <View style={styles.features}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📅</Text>
              <Text style={styles.featureTitle}>Create Events</Text>
              <Text style={styles.featureText}>
                Easily create and publish events with photos, descriptions, and ticket pricing
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🎫</Text>
              <Text style={styles.featureTitle}>Sell Tickets</Text>
              <Text style={styles.featureText}>
                Secure ticket sales with QR code verification and multiple payment options
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureTitle}>Track Analytics</Text>
              <Text style={styles.featureText}>
                View real-time sales data, attendance metrics, and revenue reports
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureTitle}>Manage Bookings</Text>
              <Text style={styles.featureText}>
                View all bookings, verify tickets at the door, and handle customer inquiries
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.8}
              style={styles.button}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a5a", "#dd4a4a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>LOGIN</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRegister}
              activeOpacity={0.8}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.buttonText}>REGISTER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBackToApp}
              activeOpacity={0.8}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.buttonText}>BACK TO APP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  features: {
    gap: 20,
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#E0E0E0",
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  button: {
    borderRadius: 25,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
