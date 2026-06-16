import { Text, View, ScrollView, TouchableOpacity, StyleSheet, Alert, Pressable, ActivityIndicator, Platform, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground } from "@/components/sleepless";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { useUserLocation, createUserLocationFromAddress } from "@/lib/user-location-context";
import { formatDistance, SA_CITY_COORDINATES } from "@/lib/distance";
import { LinearGradient } from "expo-linear-gradient";

const DISTANCE_OPTIONS = [
  { label: "All Events", value: 0 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
];

export default function LocationScreen() {
  const { userLocation, distanceFilter, setUserLocation, setDistanceFilter, clearUserLocation } = useUserLocation();
  const [selectedAddress, setSelectedAddress] = useState(userLocation?.address || "");
  const [detectingGPS, setDetectingGPS] = useState(false);

  const handleDetectGPS = async () => {
    setDetectingGPS(true);
    try {
      if (Platform.OS === "web") {
        // Use browser Geolocation API on web
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
        );
        const { latitude, longitude } = pos.coords;
        // Reverse geocode using a free API
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        const city = data.address?.city ?? data.address?.town ?? data.address?.suburb ?? "";
        const address = data.display_name?.split(",").slice(0, 3).join(", ") ?? city;
        await setUserLocation({ address, city, latitude, longitude });
        setSelectedAddress(address || city);
        Alert.alert("Location detected", `Set to: ${address || city}`);
      } else {
        const Location = await import("expo-location");
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Allow location access in your device settings to use this feature.");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const [place] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const city = place?.city ?? place?.subregion ?? "";
        const address = [place?.street, place?.city, place?.region].filter(Boolean).join(", ");
        await setUserLocation({ address: address || city, city, latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setSelectedAddress(address || city);
        Alert.alert("Location detected", `Set to: ${address || city}`);
      }
    } catch {
      Alert.alert("Error", "Could not detect your location. Please try again or search manually.");
    } finally {
      setDetectingGPS(false);
    }
  };

  const handleSaveLocation = async (addressDetails: {
    formatted_address: string;
    latitude: number;
    longitude: number;
    components: {
      locality?: string;
      administrative_area?: string;
    };
  }) => {
    try {
      const city = addressDetails.components.locality || "";
      const location = createUserLocationFromAddress(
        addressDetails.formatted_address,
        city,
        addressDetails.latitude,
        addressDetails.longitude
      );
      await setUserLocation(location);
      setSelectedAddress(addressDetails.formatted_address);
      Alert.alert("Success", "Your location has been saved. Events will now show distance from your location.");
    } catch (error) {
      Alert.alert("Error", "Failed to save location. Please try again.");
    }
  };

  const handleSelectCity = async (cityName: string) => {
    const coords = SA_CITY_COORDINATES[cityName];
    if (coords) {
      try {
        await setUserLocation({
          address: cityName,
          city: cityName,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setSelectedAddress(cityName);
        Alert.alert("Success", `Location set to ${cityName}`);
      } catch (error) {
        Alert.alert("Error", "Failed to save location. Please try again.");
      }
    }
  };

  const handleClearLocation = async () => {
    Alert.alert(
      "Clear Location",
      "Are you sure you want to clear your saved location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearUserLocation();
            setSelectedAddress("");
            Alert.alert("Success", "Your location has been cleared.");
          },
        },
      ]
    );
  };

  const handleDistanceFilterChange = async (distance: number) => {
    await setDistanceFilter(distance);
  };

  const router = useRouter();

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.headerTitle}>My Location</Text>
            <View style={styles.backButton} />
          </View>
          <Text style={styles.title}>My Location</Text>
          <Text style={styles.subtitle}>Set your location to see distances to events</Text>

          {/* Current Location Display */}
          {userLocation && (
            <View style={styles.currentLocationCard}>
              <LinearGradient
                colors={["rgba(255,107,107,0.2)", "rgba(255,107,107,0.05)"]}
                style={styles.cardGradient}
              >
                <Text style={styles.cardLabel}>Current Location</Text>
                <Text style={styles.currentAddress}>{userLocation.address}</Text>
                {userLocation.city && (
                  <Text style={styles.cityText}>{userLocation.city}</Text>
                )}
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearLocation}
                >
                  <Text style={styles.clearButtonText}>Clear Location</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* GPS auto-detect */}
          <TouchableOpacity
            style={[styles.gpsButton, detectingGPS && styles.gpsButtonDisabled]}
            onPress={handleDetectGPS}
            disabled={detectingGPS}
          >
            {detectingGPS
              ? <ActivityIndicator size="small" color="#fff" />
              : <MaterialIcons name="my-location" size={20} color="#fff" />}
            <Text style={styles.gpsButtonText}>
              {detectingGPS ? "Detecting location..." : "Use my current location"}
            </Text>
          </TouchableOpacity>

          {/* Address Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Address</Text>
            <AddressAutocomplete
              value={selectedAddress}
              placeholder="Search for your location..."
              country="za"
              onAddressSelect={handleSaveLocation}
            />
          </View>

          {/* Quick City Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Or Select a City</Text>
            <View style={styles.cityGrid}>
              {Object.keys(SA_CITY_COORDINATES).slice(0, 8).map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.cityChip,
                    userLocation?.city === city && styles.cityChipSelected,
                  ]}
                  onPress={() => handleSelectCity(city)}
                >
                  <Text
                    style={[
                      styles.cityChipText,
                      userLocation?.city === city && styles.cityChipTextSelected,
                    ]}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance Filter</Text>
            <Text style={styles.filterDescription}>
              Only show events within this distance from your location
            </Text>
            <View style={styles.filterOptions}>
              {DISTANCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    distanceFilter === option.value && styles.filterChipSelected,
                  ]}
                  onPress={() => handleDistanceFilterChange(option.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      distanceFilter === option.value && styles.filterChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {distanceFilter > 0 && !userLocation && (
              <Text style={styles.warningText}>
                Set your location above to enable distance filtering
              </Text>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#6B21A8",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  gpsButtonDisabled: {
    opacity: 0.6,
  },
  gpsButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    display: "none",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
  },
  currentLocationCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
  },
  cardLabel: {
    fontSize: 12,
    color: "#ff6b6b",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  currentAddress: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  cityText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 12,
  },
  clearButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  clearButtonText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  filterDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cityChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cityChipSelected: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  cityChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  cityChipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  filterChipSelected: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  filterChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  filterChipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  warningText: {
    marginTop: 12,
    fontSize: 13,
    color: "#ffa500",
    fontStyle: "italic",
  },
});
