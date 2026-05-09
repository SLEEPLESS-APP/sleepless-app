import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  GradientBackground,
  SleeplessLogo,
  HomeButton,
  BackButton,
  NotificationSettings,
} from "@/components/sleepless";
import { APP_CONFIG } from "@/constants/app";

export default function AboutScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="info" size={24} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>About</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <SleeplessLogo size="large" />
            </View>

            {/* Notification Settings */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Settings</Text>
              <NotificationSettings />
            </View>

            {/* About Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>About Sleepless</Text>
              <Text style={styles.paragraph}>
                Sleepless is your ultimate guide to nightlife events across South Africa. 
                Discover the hottest parties, club nights, and music events happening in your city.
              </Text>

              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featureItem}>
                <MaterialIcons name="event" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Browse events by province and city</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="search" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Search for specific events</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="favorite" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Save your favorite events</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="location-on" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Get directions to venues</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="share" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Share events with friends</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="chat-bubble" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Connect with other party-goers</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="notifications" size={20} color="#ff6b6b" />
                <Text style={styles.featureText}>Get notified about new events</Text>
              </View>

              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.paragraph}>
                Have questions or feedback? We'd love to hear from you!
              </Text>
              <Text style={styles.contactInfo}>Email: {APP_CONFIG.email}</Text>
              <Text style={styles.contactInfo}>Instagram: {APP_CONFIG.instagram}</Text>

              <Text style={styles.version}>Version {APP_CONFIG.version}</Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <BackButton />
            <HomeButton />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  sectionTitle: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 16,
  },
  paragraph: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
  },
  contactInfo: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 4,
  },
  version: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
});
