import { View, Text, StyleSheet, FlatList, Pressable, Image, Dimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { GradientBackground, HomeButton, BackButton } from "@/components/sleepless";
import { useFavorites } from "@/lib/favorites-context";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_MARGIN = 8;
const HORIZONTAL_PADDING = 16;
const ITEM_WIDTH = (width - HORIZONTAL_PADDING * 2 - ITEM_MARGIN * (COLUMN_COUNT - 1)) / COLUMN_COUNT;

export default function FavoritesScreen() {
  const { favorites } = useFavorites();

  // Fetch all approved events and filter to favourites client-side
  const { data: allEvents = [] } = trpc.events.getApproved.useQuery({});
  const favoriteEvents = allEvents.filter((e: any) => favorites.includes(String(e.id)));

  const handleEventPress = (eventId: number) => {
    router.push(`/events/detail?eventId=${eventId}` as any);
  };

  const renderEventItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => handleEventPress(item.id)}
      style={({ pressed }) => [styles.eventItem, pressed && styles.pressed]}
    >
      <Image source={{ uri: item.posterUrl }} style={styles.eventImage} />
    </Pressable>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="favorite" size={24} color="#ff6b6b" />
            </View>
            <Text style={styles.headerTitle}>My Favorites</Text>
          </View>

          {favoriteEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="favorite-border" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptyText}>
                Tap the heart icon on any event to save it here
              </Text>
            </View>
          ) : (
            <FlatList
              data={favoriteEvents}
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
    fontSize: 18,
    fontWeight: "600",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
});
