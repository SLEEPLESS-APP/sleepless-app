import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientBackground, EventsHeader, HomeButton, BackButton, Breadcrumb } from "@/components/sleepless";
import { getProvinceById } from "@/data/mock-data";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export default function CitiesScreen() {
  const { provinceId } = useLocalSearchParams<{ provinceId: string }>();
  const province = getProvinceById(provinceId || "");

  // Fetch approved events for this province and derive distinct cities
  const { data: events = [], isLoading } = trpc.events.getApproved.useQuery(
    { province: province?.name },
    { enabled: !!province }
  );

  const cities = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    events.forEach((e: any) => {
      if (e.city && !seen.has(e.city)) { seen.add(e.city); result.push(e.city); }
    });
    return result.sort();
  }, [events]);

  const handleCityPress = (cityName: string) => {
    router.push(`/events/grid?city=${encodeURIComponent(cityName)}&provinceId=${provinceId}` as any);
  };

  const breadcrumbItems = [
    { label: "Home", route: "/(tabs)" },
    { label: "Provinces", route: "/events/provinces" },
    { label: province?.name ?? "Cities" },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EventsHeader />
          <Breadcrumb items={breadcrumbItems} />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff6b6b" />
            </View>
          ) : cities.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>No events in {province?.name} yet</Text>
            </View>
          ) : (
            <FlatList
              data={cities}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleCityPress(item)}
                  style={({ pressed }) => [styles.cityButton, pressed && styles.pressed]}
                >
                  <Text style={styles.cityText}>{item}</Text>
                </Pressable>
              )}
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
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  cityButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cityText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
});
