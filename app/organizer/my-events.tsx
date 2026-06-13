import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, FlatList, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, BackButton } from "@/components/sleepless";
import { useOrganizer } from "@/lib/organizer-context";
import { trpc } from "@/lib/trpc";

export default function MyEvents() {
  const router = useRouter();
  const { organizer, loading } = useOrganizer();

  // Redirect to organizer login if not authenticated
  useEffect(() => {
    if (!loading && !organizer) {
      Alert.alert(
        "Organizer Login Required",
        "You must be logged in as an organizer to view your events. Please log in or register as an organizer.",
        [
          {
            text: "Cancel",
            onPress: () => router.back(),
            style: "cancel",
          },
          {
            text: "Login",
            onPress: () => router.replace("/organizer/login" as any),
          },
        ]
      );
    }
  }, [loading, organizer, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={{ color: "#fff", marginTop: 16 }}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Don't render if not authenticated
  if (!organizer) {
    return null;
  }
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Fetch organizer's events from backend
  const { data: events, isLoading, refetch } = trpc.organizer.events.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer?.id }
  );

  const deleteEventMutation = trpc.organizer.deleteEvent.useMutation();

  const handleCancelEvent = async (eventId: number, eventTitle: string) => {
    const confirmed = Platform.OS === "web" 
      ? window.confirm(`Are you sure you want to cancel "${eventTitle}"? This action cannot be undone.`)
      : await new Promise(resolve => Alert.alert(
          "Cancel Event",
          `Are you sure you want to cancel "${eventTitle}"? This action cannot be undone.`,
          [{ text: "No", onPress: () => resolve(false) }, { text: "Yes, Cancel", style: "destructive", onPress: () => resolve(true) }]
        ));
    if (!confirmed) return;
    try {
      await deleteEventMutation.mutateAsync({ eventId, organizerId: organizer!.id });
      Platform.OS === "web" ? window.alert("Event has been cancelled") : Alert.alert("Success", "Event has been cancelled");
      refetch();
    } catch {
      Platform.OS === "web" ? window.alert("Failed to cancel event. Please try again.") : Alert.alert("Error", "Failed to cancel event. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      case "rejected":
        return "#F44336";
      case "draft":
        return "#9E9E9E";
      case "cancelled":
        return "#757575";
      default:
        return "#fff";
    }
  };

  const toggleEventSelection = (eventId: number) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((id) => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleBulkCancel = async () => {
    const confirmed = Platform.OS === "web"
      ? window.confirm(`Are you sure you want to cancel ${selectedEvents.length} event(s)?`)
      : await new Promise(resolve => Alert.alert(
          "Cancel Events",
          `Are you sure you want to cancel ${selectedEvents.length} event(s)?`,
          [{ text: "No", onPress: () => resolve(false) }, { text: "Yes, Cancel All", style: "destructive", onPress: () => resolve(true) }]
        ));
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedEvents.map((eventId) =>
          deleteEventMutation.mutateAsync({ eventId, organizerId: organizer!.id })
        )
      );
      Platform.OS === "web" ? window.alert(`${selectedEvents.length} event(s) cancelled`) : Alert.alert("Success", `${selectedEvents.length} event(s) cancelled`);
    } catch {
      Platform.OS === "web" ? window.alert("Some events could not be cancelled.") : Alert.alert("Error", "Some events could not be cancelled.");
    }
    setSelectedEvents([]);
    setSelectionMode(false);
    refetch();
  };

  const renderEvent = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.eventCard, selectedEvents.includes(item.id) && styles.selectedCard]}
      onPress={() => selectionMode && toggleEventSelection(item.id)}
      onLongPress={() => {
        setSelectionMode(true);
        toggleEventSelection(item.id);
      }}
      activeOpacity={selectionMode ? 0.7 : 1}
    >
      <Image source={{ uri: item.posterUrl }} style={styles.eventImage} />
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.eventDate}>📅 {new Date(item.eventDate).toLocaleDateString()}</Text>
        <Text style={styles.eventTime}>🕐 {item.eventTime}</Text>

        <View style={styles.eventStats}>
          <Text style={styles.eventStat}>
            🎫 {item.ticketsSold} / {item.ticketsAvailable} sold
          </Text>
          <Text style={styles.eventStat}>
            💰 R{((item.ticketsSold * item.price) / 100).toFixed(2)}
          </Text>
        </View>

        <View style={styles.eventActions}>
          <TouchableOpacity
            onPress={() => router.push(`/organizer/edit-event?id=${item.id}` as any)}
            activeOpacity={0.8}
            style={[styles.actionButton, styles.editButton]}
          >
            <Text style={styles.actionButtonText}>✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
              onPress={() => handleCancelEvent(item.id, item.title)}
              activeOpacity={0.8}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.actionButtonText}>
                {item.status === "approved" ? "❌ Cancel" : "🗑️ Delete"}
              </Text>
            </TouchableOpacity>
        </View>
      </View>
      {selectionMode && (
        <View style={styles.selectionIndicator}>
          <Text style={styles.selectionIcon}>
            {selectedEvents.includes(item.id) ? "☑️" : "⬜"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>My Events</Text>
            {selectionMode ? (
              <TouchableOpacity
                style={styles.cancelSelectionButton}
                onPress={() => {
                  setSelectionMode(false);
                  setSelectedEvents([]);
                }}
              >
                <Text style={styles.cancelSelectionText}>Cancel</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/organizer/create-event" as any)}
              >
                <Text style={styles.createButtonText}>+ New Event</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectionMode && selectedEvents.length > 0 && (
            <View style={styles.bulkActions}>
              <Text style={styles.bulkActionsText}>
                {selectedEvents.length} event(s) selected
              </Text>
              <TouchableOpacity
                style={styles.bulkCancelButton}
                onPress={handleBulkCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.bulkCancelText}>Cancel Selected</Text>
              </TouchableOpacity>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : !events || events.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No Events Yet</Text>
              <Text style={styles.emptyText}>
                Create your first event to start selling tickets
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/organizer/create-event" as any)}
              >
                <Text style={styles.emptyButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={events}
              renderItem={renderEvent}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
            />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  createButton: {
    backgroundColor: "rgba(255, 107, 129, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cancelSelectionButton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  cancelSelectionText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 14,
  },
  bulkActions: {
    backgroundColor: "rgba(10, 126, 164, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(10, 126, 164, 0.4)",
  },
  bulkActionsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bulkCancelButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bulkCancelText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: "#0a7ea4",
    borderWidth: 2,
    backgroundColor: "rgba(10, 126, 164, 0.2)",
  },
  selectionIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
    padding: 4,
  },
  selectionIcon: {
    fontSize: 24,
  },
  eventImage: {
    width: "100%",
    height: 180,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
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
  eventDate: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 12,
  },
  eventStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  eventStat: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  eventActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "rgba(33, 150, 243, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.5)",
  },
  cancelButton: {
    backgroundColor: "rgba(244, 67, 54, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.5)",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "rgba(255, 107, 129, 0.8)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
});
