import { View, Text, StyleSheet, Image, Pressable, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Linking } from "react-native";
import {
  GradientBackground,
  HomeButton,
  BackButton,
  GlassButton,
} from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

export default function LocationScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const { data: event } = trpc.events.getById.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );

  const handleDriving = () => {
    if (!event) return;
    const query = encodeURIComponent(`${event.venue}, ${event.city}`);
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${query}`);
  };

  const handleUber = () => {
    if (!event) return;
    const dropoff = encodeURIComponent(`${event.venue}, ${event.city}`);
    const nickname = encodeURIComponent(event.venue);
    // Uber universal deep link: uses rider's current location as pickup,
    // venue address as dropoff. Opens the Uber app (or mobile site) with route + fare.
    Linking.openURL(
      `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${dropoff}&dropoff[nickname]=${nickname}`
    );
  };

  const handleShareLocation = () => {
    if (!event) return;
    const query = encodeURIComponent(`${event.venue}, ${event.city}`);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Location Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="location-on" size={24} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Location</Text>
          </View>

          {/* Map Placeholder */}
          <View style={styles.mapContainer}>
            <Image
              source={{
                uri: "https://maps.googleapis.com/maps/api/staticmap?center=${event ? encodeURIComponent(event.venue + ', ' + event.city) : 'South+Africa'}&zoom=13&size=400x300&maptype=roadmap&key=placeholder",
              }}
              style={styles.mapImage}
              defaultSource={{ uri: "https://via.placeholder.com/400x300/1a1a2e/ffffff?text=Map" }}
            />
            <View style={styles.mapOverlay}>
              <MaterialIcons name="location-on" size={40} color="#ff6b6b" />
              <Text style={styles.venueName}>{event?.venue || "Venue"}</Text>
            </View>
          </View>

          {/* Search Location */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          {/* Share Location Button */}
          <View style={styles.shareButtonContainer}>
            <GlassButton
              title="Share Location"
              onPress={handleShareLocation}
              variant="outline"
            />
          </View>

          {/* Transport Options */}
          <View style={styles.transportContainer}>
            <Pressable
              onPress={handleUber}
              style={({ pressed }) => [styles.transportButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="local-taxi" size={28} color="#ffffff" />
              <Text style={styles.transportLabel}>Uber</Text>
            </Pressable>
            <Pressable
              onPress={handleDriving}
              style={({ pressed }) => [styles.transportButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="directions-car" size={28} color="#ffffff" />
              <Text style={styles.transportLabel}>Drive</Text>
            </Pressable>
          </View>

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
  transportLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
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
  mapContainer: {
    marginHorizontal: 16,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#2d3748",
    marginBottom: 16,
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  venueName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    marginLeft: 8,
  },
  shareButtonContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  transportContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  transportButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 32,
    paddingBottom: 16,
  },
});
