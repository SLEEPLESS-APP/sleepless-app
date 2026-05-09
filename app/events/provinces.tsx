import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GradientBackground,
  EventsHeader,
  HomeButton,
  BackButton,
} from "@/components/sleepless";
import { provinces } from "@/data/mock-data";

export default function ProvincesScreen() {
  const handleProvincePress = (provinceId: string) => {
    router.push(`/events/cities?provinceId=${provinceId}` as any);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EventsHeader />

          <FlatList
            data={provinces}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleProvincePress(item.id)}
                style={({ pressed }) => [styles.provinceButton, pressed && styles.pressed]}
              >
                <Text style={styles.provinceText}>{item.name}</Text>
              </Pressable>
            )}
          />

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
  listContent: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  provinceButton: {
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
  provinceText: {
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
});
