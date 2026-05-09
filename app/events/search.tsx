import { useState, useMemo } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Image, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { GradientBackground, HomeButton, BackButton } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(["Jazz", "Johannesburg", "Festival"]);

  const { data: allEvents = [], isLoading } = trpc.events.getApproved.useQuery({});

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allEvents.filter((e: any) =>
      e.title?.toLowerCase().includes(q) ||
      e.venue?.toLowerCase().includes(q) ||
      e.city?.toLowerCase().includes(q) ||
      e.province?.toLowerCase().includes(q) ||
      e.eventType?.toLowerCase().includes(q)
    );
  }, [searchQuery, allEvents]);

  const handleEventPress = (event: any) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!recentSearches.includes(event.title)) {
      setRecentSearches((prev) => [event.title, ...prev.slice(0, 4)]);
    }
    router.push(`/events/detail?eventId=${event.id}` as any);
  };

  const handleRecentSearch = (term: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery(term);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const renderEventItem = ({ item }: { item: EventWithLocation }) => (
    <Pressable
      onPress={() => handleEventPress(item)}
      style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}
    >
      <Image source={{ uri: item.posterUrl }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventName} numberOfLines={1}>{item.title}</Text>
        <View style={styles.eventMeta}>
          <MaterialIcons name="location-on" size={12} color="#ff6b6b" />
          <Text style={styles.eventLocation} numberOfLines={1}>
            {item.city}, {item.province}
          </Text>
        </View>
        <View style={styles.eventMeta}>
          <MaterialIcons name="event" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.eventDate}>{new Date(item.eventDate).toLocaleDateString('en-ZA')}</Text>
        </View>
        <View style={styles.eventBottom}>
          {item.eventType item.type && (item.type && ( (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.eventType}</Text>
            </View>
          )}
          <Text style={styles.eventPrice}>R{(item.price/100).toFixed(0)}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="search" size={24} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Search Events</Text>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.5)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, venues, cities..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.5)" />
              </Pressable>
            )}
          </View>

          {/* Results or Recent Searches */}
          {searchQuery.trim() ? (
            <>
              <Text style={styles.resultsCount}>
                {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
              </Text>
              <FlatList
                data={filteredEvents}
                renderItem={renderEventItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="search-off" size={48} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.emptyText}>No events found</Text>
                    <Text style={styles.emptySubtext}>Try different keywords</Text>
                  </View>
                }
              />
            </>
          ) : (
            <View style={styles.recentContainer}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                {recentSearches.length > 0 && (
                  <Pressable onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Clear</Text>
                  </Pressable>
                )}
              </View>
              {recentSearches.map((term, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleRecentSearch(term)}
                  style={({ pressed }) => [styles.recentItem, pressed && styles.pressed]}
                >
                  <MaterialIcons name="history" size={18} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.recentText}>{term}</Text>
                </Pressable>
              ))}

              {/* Popular Categories */}
              <Text style={styles.categoriesTitle}>Popular Categories</Text>
              <View style={styles.categoriesGrid}>
                {["Club", "Festival", "Concert", "Pool Party", "Rooftop"].map((category) => (
                  <Pressable
                    key={category}
                    onPress={() => handleRecentSearch(category)}
                    style={({ pressed }) => [styles.categoryChip, pressed && styles.pressed]}
                  >
                    <Text style={styles.categoryText}>{category}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Quick Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{allEvents.length}</Text>
                  <Text style={styles.statLabel}>Total Events</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{provinces.length}</Text>
                  <Text style={styles.statLabel}>Provinces</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{allCities.length}</Text>
                  <Text style={styles.statLabel}>Cities</Text>
                </View>
              </View>
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginHorizontal: 24,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  resultsCount: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  eventImage: {
    width: 80,
    height: 100,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  eventName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  eventLocation: {
    color: "#ff6b6b",
    fontSize: 12,
  },
  eventDate: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
  eventBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  typeBadge: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: "#ff6b6b",
    fontSize: 10,
    fontWeight: "600",
  },
  eventPrice: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    marginTop: 4,
  },
  recentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  clearText: {
    color: "#ff6b6b",
    fontSize: 13,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  recentText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  categoriesTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  categoryText: {
    color: "#ff6b6b",
    fontSize: 13,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#ff6b6b",
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
});
