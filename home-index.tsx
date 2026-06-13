import { View, Text, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Font from "expo-font";
import { useEffect, useState } from "react";
import {
  GradientBackground,
  SleeplessLogo,
  Avatar,
} from "@/components/sleepless";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      Font.loadAsync({
        "MaterialIcons": require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf"),
      }).then(() => setFontsLoaded(true)).catch(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, []);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login" as any);
        },
      },
    ]);
  };

  const handleEvents = () => {
    router.push("/events/provinces" as any);
  };

  const handleFavorites = () => {
    router.push("/events/favorites" as any);
  };

  const handleCalendar = () => {
    router.push("/events/calendar" as any);
  };

  const handleBookings = () => {
    router.push("/events/my-bookings" as any);
  };

  const handleAbout = () => {
    router.push("/events/about" as any);
  };

  const handleSearch = () => {
    router.push("/events/search" as any);
  };

  const handleOrganizer = () => {
    router.push("/organizer" as any);
  };

  const handleAdmin = () => {
    router.push("/admin/login" as any);
  };

  const handleLocation = () => {
    router.push("/location" as any);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Sign Out Button */}
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <SleeplessLogo size="large" />
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Avatar size={100} editable />
            <Text style={styles.displayName}>{profile.displayName}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <Pressable
              onPress={handleEvents}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="event" size={28} color="#ffffff" />
              </View>
              <Text style={styles.buttonLabel}>Events</Text>
            </Pressable>

            <Pressable
              onPress={handleFavorites}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="favorite" size={28} color="#ff6b6b" />
              </View>
              <Text style={styles.buttonLabel}>Favorites</Text>
            </Pressable>

            <Pressable
              onPress={handleCalendar}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="calendar-month" size={28} color="#ffffff" />
              </View>
              <Text style={styles.buttonLabel}>Calendar</Text>
            </Pressable>

            <Pressable
              onPress={handleBookings}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="confirmation-number" size={28} color="#4ade80" />
              </View>
              <Text style={styles.buttonLabel}>Bookings</Text>
            </Pressable>

            <Pressable
              onPress={handleSearch}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="search" size={28} color="#fbbf24" />
              </View>
              <Text style={styles.buttonLabel}>Search</Text>
            </Pressable>

            <Pressable
              onPress={handleAbout}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="help" size={28} color="#ffffff" />
              </View>
              <Text style={styles.buttonLabel}>About</Text>
            </Pressable>

            <Pressable
              onPress={handleOrganizer}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="business" size={28} color="#ff6b81" />
              </View>
              <Text style={styles.buttonLabel}>Organizer</Text>
            </Pressable>

            <Pressable
              onPress={handleLocation}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="location-on" size={28} color="#38bdf8" />
              </View>
              <Text style={styles.buttonLabel}>Location</Text>
            </Pressable>

            <Pressable
              onPress={handleAdmin}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons name="admin-panel-settings" size={28} color="#a78bfa" />
              </View>
              <Text style={styles.buttonLabel}>Admin</Text>
            </Pressable>
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
    paddingHorizontal: 24,
  },
  signOutButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  signOutText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  displayName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    marginTop: 40,
    paddingHorizontal: 8,
  },
  actionButton: {
    alignItems: "center",
    width: 65,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "500",
    textAlign: "center",
  },
});
