import { useState } from "react";
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
  EventFilter,
} from "@/components/sleepless";
import { getCityById, getProvinceById, type EventFilters } from "@/data/mock-data";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_MARGIN = 8;
const HORIZONTAL_PADDING = 16;
const ITEM_WIDTH = (width - HORIZONTAL_PADDING * 2 - ITEM_MARGIN * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export default function EventsGridScreen() {
  const { cityId, provinceId, city: cityNameParam } = useLocalSearchParams<{ cityId: string; provinceId: string; city: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<EventFilters>({});

  const city = cityId ? getCityById(cityId) : null;
  const province = provinceId ? getProvinceById(provinceId) : null;

  const resolvedCity = cityNameParam ?? city?.name;
  const resolvedProvince = province?.name;

  // Fetch approved events from real DB
  const { data: dbEvents = [], isLoading } = trpc.events.getApproved.useQuery({
    city: resolvedCity,
    province: resolvedProvince,
    eventType: filters.type,
  });

  // Filter by search query client-side
  const events = searchQuery
    ? dbEvents.filter((e: any) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dbEvents;

  const handleEventPress = (eventId: number) => {
    router.push(`/events/detail?eventId=${eventId}&cityId=${cityId}&provinceId=${provinceId}` as any);
  };

  const renderEventItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => handleEventPress(item.id)}
      style={({ pressed }) => [styles.eventItem, pressed && styles.pressed]}
    >
      <Image source={{ uri: item.posterUrl }} style={styles.eventImage} />
      <View style={styles.eventOverlay}>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>From R{item.price}</Text>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.eventType}</Text>
        </View>
      </View>
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

          {/* Search and Filter Row */}
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
            <EventFilter filters={filters} onFiltersChange={setFilters} />
          </View>

          {/* Results count */}
          <View style={styles.resultsRow}>
            <Text style={styles.resultsText}>
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#ff6b6b" />
              <Text style={styles.emptyText}>Loading events...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : (
            <FlatList
              data={events}
              keyExtractor={(item) => item.id.toString()}
              numColumns={COLUMN_COUNT}
              contentContainerStyle={styles.gridContent}
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
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    marginLeft: 8,
  },
  resultsRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
  },
  gridContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 20,
  },
  eventItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.4,
    marginRight: ITEM_MARGIN,
    marginBottom: ITEM_MARGIN,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  eventOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceTag: {
    backgroundColor: "rgba(255, 107, 107, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  typeTag: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: "#ffffff",
    fontSize: 9,
    textTransform: "capitalize",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "500",
  },
  emptySubtext: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
});
