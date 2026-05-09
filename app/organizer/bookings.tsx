import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, BackButton } from "@/components/sleepless";
import { useOrganizer } from "@/lib/organizer-context";
import { trpc } from "@/lib/trpc";

export default function Bookings() {
  const router = useRouter();
  const { organizer } = useOrganizer();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  // Fetch organizer's events
  const { data: events, isLoading: eventsLoading } = trpc.organizer.events.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer?.id }
  );

  // Fetch bookings for selected event
  const { data: bookings, isLoading: bookingsLoading } = trpc.organizer.bookings.useQuery(
    { eventId: selectedEvent || 0 },
    { enabled: !!selectedEvent }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      case "refunded":
        return "#FF9800";
      default:
        return "#fff";
    }
  };

  const renderEvent = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setSelectedEvent(item.id)}
      activeOpacity={0.8}
      style={[
        styles.eventCard,
        selectedEvent === item.id && styles.eventCardSelected,
      ]}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.ticketBadge}>
          <Text style={styles.ticketBadgeText}>
            {item.ticketsSold}/{item.ticketsAvailable}
          </Text>
        </View>
      </View>
      <Text style={styles.eventDate}>
        📅 {new Date(item.eventDate).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderBooking = ({ item }: { item: any }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.eventTitle}>{item.eventTitle}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.detailText}>👤 {item.customerName}</Text>
        <Text style={styles.detailText}>📧 {item.customerEmail}</Text>
        <Text style={styles.detailText}>🎫 {item.quantity} ticket(s)</Text>
        <Text style={styles.detailText}>💰 R{item.totalAmount.toLocaleString()}</Text>
        <Text style={styles.detailText}>📅 {item.createdAt}</Text>
      </View>

      <View style={styles.bookingActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: "/organizer/ticket-qr" as any,
              params: {
                bookingId: item.id,
                eventTitle: item.eventTitle || "Event",
                quantity: item.quantity,
              },
            });
          }}
        >
          <Text style={styles.actionButtonText}>View QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
          <Text style={styles.actionButtonText}>Contact Customer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Bookings</Text>
            <Text style={styles.subtitle}>Manage all ticket bookings</Text>
          </View>

          {eventsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : !events || events.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎫</Text>
              <Text style={styles.emptyTitle}>No Events</Text>
              <Text style={styles.emptyText}>
                Create events first to manage bookings
              </Text>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.eventsSection}>
                <Text style={styles.sectionTitle}>Select Event</Text>
                <FlatList
                  data={events}
                  renderItem={renderEvent}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.list}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>

              {selectedEvent && (
                <View style={styles.bookingsSection}>
                  <Text style={styles.sectionTitle}>Bookings</Text>
                  {bookingsLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  ) : !bookings || bookings.length === 0 ? (
                    <View style={styles.emptyBookings}>
                      <Text style={styles.emptyBookingsText}>
                        No bookings yet for this event
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={bookings}
                      renderItem={renderBooking}
                      keyExtractor={(item) => item.id.toString()}
                      contentContainerStyle={styles.list}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.footer}>
            <BackButton />
          </View>
        </View>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    color: "#E0E0E0",
    fontSize: 16,
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  eventsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minWidth: 200,
  },
  eventCardSelected: {
    backgroundColor: "rgba(255, 107, 129, 0.3)",
    borderColor: "rgba(255, 107, 129, 0.5)",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ticketBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventDate: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  bookingsSection: {
    flex: 1,
  },
  emptyBookings: {
    padding: 40,
    alignItems: "center",
  },
  emptyBookingsText: {
    fontSize: 14,
    color: "#E0E0E0",
    textAlign: "center",
  },
  list: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  bookingActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(255, 107, 129, 0.8)",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonSecondary: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
});
