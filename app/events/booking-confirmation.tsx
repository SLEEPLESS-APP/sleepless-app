import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { GradientBackground, HomeButton, GlassButton } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

export default function BookingConfirmationScreen() {
  const { eventId, transactionId, quantity, total } = useLocalSearchParams<{
    eventId: string; transactionId: string; quantity: string; total: string;
  }>();

  const { data: event } = trpc.events.getById.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );

  const qty = parseInt(quantity || "1", 10);
  const totalAmount = parseInt(total || "0", 10);

  const formatAmount = (cents: number) => `R${(cents / 100).toFixed(2)}`;

  const handleViewBookings = () => router.push("/events/my-bookings" as any);
  const handleGoHome = () => router.replace("/(tabs)");

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Success Icon */}
            <View style={styles.successContainer}>
              <View style={styles.successCircle}>
                <MaterialIcons name="check" size={48} color="#4ade80" />
              </View>
              <Text style={styles.successTitle}>Booking Confirmed!</Text>
              <Text style={styles.successSubtitle}>
                Your tickets are booked{event ? ` for ${event.title}` : ""}
              </Text>
            </View>

            {/* Booking Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{transactionId}</Text>
              </View>
              {event && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Event</Text>
                    <Text style={styles.detailValue}>{event.title}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Venue</Text>
                    <Text style={styles.detailValue}>{event.venue}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                      {new Date(event.eventDate).toLocaleDateString("en-ZA", {
                        weekday: "short", day: "numeric", month: "long", year: "numeric"
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{event.eventTime}</Text>
                  </View>
                </>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tickets</Text>
                <Text style={styles.detailValue}>{qty}</Text>
              </View>
              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.totalValue}>{formatAmount(totalAmount)}</Text>
              </View>
            </View>

            <Text style={styles.note}>
              A confirmation email has been sent to you. Show your QR code at the venue entrance.
            </Text>

            <View style={styles.buttons}>
              <GlassButton title="View My Tickets" onPress={handleViewBookings} variant="primary" />
              <GlassButton title="Back to Home" onPress={handleGoHome} variant="outline" />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <HomeButton />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },
  successContainer: { alignItems: "center", paddingVertical: 32 },
  successCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(74,222,128,0.2)",
    borderWidth: 2, borderColor: "rgba(74,222,128,0.5)",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  successTitle: { color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 8 },
  successSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 15, textAlign: "center" },
  detailsCard: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16,
    padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)",
  },
  totalRow: { borderBottomWidth: 0, marginTop: 4 },
  detailLabel: { color: "rgba(255,255,255,0.6)", fontSize: 14, flex: 1 },
  detailValue: { color: "#fff", fontSize: 14, fontWeight: "500", flex: 1, textAlign: "right" },
  totalLabel: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 },
  totalValue: { color: "#ff6b6b", fontSize: 20, fontWeight: "700" },
  note: { color: "rgba(255,255,255,0.55)", fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  buttons: { gap: 12 },
  footer: { flexDirection: "row", justifyContent: "center", paddingBottom: 16 },
});
