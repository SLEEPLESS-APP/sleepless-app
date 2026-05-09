import { View, Text, StyleSheet, FlatList, Pressable, Alert, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import {
  GradientBackground,
  HomeButton,
  BackButton,
} from "@/components/sleepless";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

type DBBooking = {
  id: number;
  eventId: number;
  ticketTypeName: string | null;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  qrCode: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  createdAt: Date;
  eventTitle: string;
  eventDate: Date;
  eventTime: string;
  eventVenue: string;
  eventCity: string;
  eventPosterUrl: string;
};

export default function MyBookingsScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;

  const { data: bookings = [], isLoading, refetch } = trpc.bookings.getByUserId.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const formatAmount = (cents: number) => `R${(cents / 100).toFixed(2)}`;

  const handleViewTicket = (booking: DBBooking) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/events/ticket?bookingId=${booking.id}&qrCode=${encodeURIComponent(booking.qrCode)}&transactionId=${booking.transactionId}` as any);
  };

  const renderBookingItem = ({ item }: { item: DBBooking }) => {
    const isCancelled = item.status === "cancelled";

    return (
      <View style={[styles.bookingCard, isCancelled && styles.bookingCardCancelled]}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingTitleRow}>
            <Text style={styles.bookingEventName} numberOfLines={1}>{item.eventTitle}</Text>
            <View style={[styles.statusBadge, isCancelled && styles.statusBadgeCancelled]}>
              <Text style={styles.statusText}>{isCancelled ? "Cancelled" : "Confirmed"}</Text>
            </View>
          </View>
          <Text style={styles.ticketCode}>{item.transactionId}</Text>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={16} color="#ff6b6b" />
            <Text style={styles.detailText}>{formatDate(item.eventDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={16} color="#ff6b6b" />
            <Text style={styles.detailText}>{item.eventTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={16} color="#ff6b6b" />
            <Text style={styles.detailText} numberOfLines={1}>{item.eventVenue}, {item.eventCity}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="confirmation-number" size={16} color="#ff6b6b" />
            <Text style={styles.detailText}>
              {item.quantity} ticket{item.quantity > 1 ? "s" : ""}
              {item.ticketTypeName ? ` · ${item.ticketTypeName}` : ""} · {formatAmount(item.totalAmount)}
            </Text>
          </View>
        </View>

        {!isCancelled && (
          <View style={styles.bookingActions}>
            <Pressable
              onPress={() => handleViewTicket(item)}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="qr-code" size={18} color="#ffffff" />
              <Text style={styles.actionButtonText}>View Ticket</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="confirmation-number" size={24} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>My Bookings</Text>
          </View>

          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#ff6b6b" />
              <Text style={styles.emptyText}>Loading your bookings...</Text>
            </View>
          ) : !userId ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="lock" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyTitle}>Sign in to view bookings</Text>
              <Pressable onPress={() => router.push("/(auth)/login" as any)} style={styles.browseButton}>
                <Text style={styles.browseButtonText}>Sign In</Text>
              </Pressable>
            </View>
          ) : confirmedBookings.length === 0 && cancelledBookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyTitle}>No Bookings Yet</Text>
              <Text style={styles.emptyText}>Your booked events will appear here</Text>
              <Pressable
                onPress={() => router.push("/events/provinces" as any)}
                style={styles.browseButton}
              >
                <Text style={styles.browseButtonText}>Browse Events</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={[...confirmedBookings, ...cancelledBookings]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderBookingItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onRefresh={refetch}
              refreshing={isLoading}
              ListHeaderComponent={
                confirmedBookings.length > 0 ? (
                  <Text style={styles.sectionTitle}>Upcoming ({confirmedBookings.length})</Text>
                ) : null
              }
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
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 16 },
  iconContainer: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  headerTitle: { color: "#ffffff", fontSize: 18, fontWeight: "600" },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionTitle: { color: "#ff6b6b", fontSize: 16, fontWeight: "600", marginBottom: 12 },
  bookingCard: {
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  bookingCardCancelled: { opacity: 0.6 },
  bookingHeader: { marginBottom: 12 },
  bookingTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  bookingEventName: { color: "#ffffff", fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  statusBadge: { backgroundColor: "#4ade80", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeCancelled: { backgroundColor: "rgba(255,107,107,0.5)" },
  statusText: { color: "#ffffff", fontSize: 11, fontWeight: "600" },
  ticketCode: { color: "#ff6b6b", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  bookingDetails: { gap: 6, marginBottom: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { color: "rgba(255,255,255,0.8)", fontSize: 13, flex: 1 },
  bookingActions: {
    flexDirection: "row", gap: 10, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)",
  },
  actionButton: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)", paddingVertical: 10, borderRadius: 10,
  },
  actionButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "500" },
  pressed: { opacity: 0.7 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: { color: "#ffffff", fontSize: 20, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  emptyText: { color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", marginBottom: 24 },
  browseButton: { backgroundColor: "#ff6b6b", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  browseButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 32, paddingBottom: 16 },
});
