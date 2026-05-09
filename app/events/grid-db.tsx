import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image, TextInput, Dimensions, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  GradientBackground,
  EventsHeader,
  HomeButton,
  BackButton,
  Breadcrumb,
} from "@/components/sleepless";
import { getCityById, getProvinceById } from "@/data/mock-data";
import { trpc } from "@/lib/trpc";
import { useUserLocation } from "@/lib/user-location-context";
import { calculateDistance, formatDistance, getCityCoordinates } from "@/lib/distance";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_MARGIN = 8;
const HORIZONTAL_PADDING = 16;
const ITEM_WIDTH = (width - HORIZONTAL_PADDING * 2 - ITEM_MARGIN * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

interface EventWithDistance {
  id: number;
  title: string;
  posterUrl: string;
  price: number;
  eventType: string;
  city: string;
  venue: string;
  distance?: number;
}

export default function EventsGridDBScreen() {
  const { cityId, provinceId } = useLocalSearchParams<{ cityId: string; provinceId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const { userLocation, distanceFilter } = useUserLocation();

  const city = cityId ? getCityById(cityId) : null;
  const province = provinceId ? getProvinceById(provinceId) : null;

  // Fetch approved events from database
  const { data: dbEvents, isLoading } = trpc.events.getApproved.useQuery({
    city: city?.name,
    province: province?.name,
  });

  // Process events with distance calculation and filtering
  const eventsWithDistance = useMemo(() => {
    if (!dbEvents) return [];

    let processed: EventWithDistance[] = dbEvents.map((event: any) => {
      let distance: number | undefined;

      if (userLocation) {
        // Try to get event coordinates from the event itself or from city lookup
        const eventCoords = (event.latitude && event.longitude)
          ? { latitude: event.latitude, longitude: event.longitude }
          : getCityCoordinates(event.city);

        if (eventCoords) {
          distance = calculateDistance(userLocation, eventCoords);
        }
      }

      return {
        ...event,
        distance,
      };
    });

    // Apply distance filter if set and user has location
    if (distanceFilter > 0 && userLocation) {
      processed = processed.filter((event) => 
        event.distance !== undefined && event.distance <= distanceFilter
      );
    }

    // Sort by distance if user has location
    if (userLocation) {
      processed.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    return processed;
  }, [dbEvents, userLocation, distanceFilter]);

  // Filter events based on search query
  const events = searchQuery
    ? eventsWithDistance.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : eventsWithDistance;

  const handleEventPress = (eventId: number) => {
    router.push(`/events/detail?eventId=${eventId}` as any);
  };

  const renderEventItem = ({ item }: { item: EventWithDistance }) => (
    <Pressable
      onPress={() => handleEventPress(item.id)}
      style={({ pressed }) => [styles.eventItem, pressed && styles.pressed]}
    >
      <Image source={{ uri: item.posterUrl }} style={styles.eventImage} />
      <View style={styles.eventOverlay}>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>R{item.price}</Text>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.eventType}</Text>
        </View>
      </View>
      {/* Distance badge */}
      {item.distance !== undefined && (
        <View style={styles.distanceOverlay}>
          <View style={styles.distanceTag}>
            <MaterialIcons name="location-on" size={10} color="#fff" />
            <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );

  const breadcrumbItems = [
    { label: "Home", route: "/(tabs)" },
    { label: "Provinces", route: "/events/provinces" },
    ...(province ? [{ label: province.name, route: `/events/cities?provinceId=${provinceId}` }] : []),
    ...(city ? [{ label: city.name }] : [{ label: "Events" }]),
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EventsHeader />

          <Breadcrumb items={breadcrumbItems} />

          {/* Search Row */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Results count and filter info */}
          {!isLoading && (
            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>
                {events.length} event{events.length !== 1 ? "s" : ""} found
                {distanceFilter > 0 && userLocation && ` within ${distanceFilter} km`}
              </Text>
              {userLocation && (
                <View style={styles.locationIndicator}>
                  <MaterialIcons name="location-on" size={12} color="#38bdf8" />
                  <Text style={styles.locationText}>Near {userLocation.city || "you"}</Text>
                </View>
              )}
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>
                {distanceFilter > 0 && userLocation
                  ? `No events within ${distanceFilter} km of your location`
                  : city
                  ? `No events in ${city.name} yet`
                  : "Check back later for upcoming events"}
              </Text>
              {distanceFilter > 0 && (
                <Pressable
                  style={styles.clearFilterButton}
                  onPress={() => router.push("/location" as any)}
                >
                  <Text style={styles.clearFilterText}>Adjust Distance Filter</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <FlatList
              data={events}
              keyExtractor={(item) => item.id.toString()}
              numColumns={COLUMN_COUNT}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              renderItem={renderEventItem}
            />
          )}

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
  searchFilterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
  },
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  locationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "#38bdf8",
    fontSize: 12,
  },
  gridContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: ITEM_MARGIN,
    marginBottom: ITEM_MARGIN,
  },
  eventItem: {
    width: ITEM_WIDTH,
    aspectRatio: 0.7,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  pressed: {
    opacity: 0.7,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceTag: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  typeTag: {
    backgroundColor: "rgba(33, 150, 243, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  distanceOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  distanceTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(56, 189, 248, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  distanceText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  clearFilterButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  clearFilterText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
});
