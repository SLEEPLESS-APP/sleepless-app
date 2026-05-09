import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  useEffect(() => {
    // Check if user is admin
    if (!authLoading) {
      if (user && (user as any).role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setCheckingAuth(false);
    }
  }, [user, authLoading]);

  if (checkingAuth || authLoading) {
    return (
      <GradientBackground>
        <ScreenContainer>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Checking permissions...</Text>
          </View>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  if (!isAdmin) {
    return (
      <GradientBackground>
        <ScreenContainer>
          <View style={styles.unauthorizedContainer}>
            <Text style={styles.unauthorizedIcon}>🔒</Text>
            <Text style={styles.unauthorizedTitle}>Access Denied</Text>
            <Text style={styles.unauthorizedText}>
              You need administrator privileges to access this panel.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  // Fetch pending events for review
  const { data: events, isLoading, refetch } = trpc.admin.pendingEvents.useQuery(
    { status: filter },
    { refetchInterval: 10000 } // Refresh every 10 seconds
  );

  const approveEventMutation = trpc.admin.approveEvent.useMutation();
  const rejectEventMutation = trpc.admin.rejectEvent.useMutation();

  const handleApprove = async (eventId: number, eventTitle: string) => {
    Alert.alert(
      "Approve Event",
      `Approve "${eventTitle}" for publication?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await approveEventMutation.mutateAsync({ eventId });
              Alert.alert("Success", "Event approved successfully");
              refetch();
            } catch (error) {
              Alert.alert("Error", "Failed to approve event");
            }
          },
        },
      ]
    );
  };

  const handleReject = async (eventId: number, eventTitle: string) => {
    Alert.prompt(
      "Reject Event",
      `Provide a reason for rejecting "${eventTitle}" (optional):`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async (reason?: string) => {
            try {
              await rejectEventMutation.mutateAsync({ 
                eventId,
                reason: reason || "Event does not meet platform guidelines"
              });
              Alert.alert("Success", "Event rejected and organizer notified");
              refetch();
            } catch (error) {
              Alert.alert("Error", "Failed to reject event");
            }
          },
        },
      ],
      "plain-text",
      "",
      "default"
    );
  };

  const renderEvent = ({ item }: { item: any }) => (
    <View style={styles.eventCard}>
      <Image source={{ uri: item.posterUrl }} style={styles.eventImage} />
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "pending"
                    ? "#FFC107"
                    : item.status === "approved"
                    ? "#4CAF50"
                    : "#F44336",
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.eventDetails}>
          <Text style={styles.eventDetailText}>
            🏢 Organizer: {item.organizerName || `ID ${item.organizerId}`}
          </Text>
          <Text style={styles.eventDetailText}>
            📅 {new Date(item.eventDate).toLocaleDateString()} at {item.eventTime}
          </Text>
          <Text style={styles.eventDetailText}>
            📍 {item.venue}, {item.city}
          </Text>
          <Text style={styles.eventDetailText}>
            🎫 {item.ticketsAvailable} tickets @ R{(item.price / 100).toFixed(2)}
          </Text>
          <Text style={styles.eventDetailText}>
            ⏰ Submitted: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>

        {item.status === "pending" && (
          <View style={styles.eventActions}>
            <TouchableOpacity
              onPress={() => handleApprove(item.id, item.title)}
              activeOpacity={0.8}
              style={[styles.actionButton, styles.approveButton]}
            >
              <Text style={styles.actionButtonText}>✅ Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleReject(item.id, item.title)}
              activeOpacity={0.8}
              style={[styles.actionButton, styles.rejectButton]}
            >
              <Text style={styles.actionButtonText}>❌ Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>Review and approve events</Text>
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              onPress={() => setFilter("pending")}
              activeOpacity={0.8}
              style={[
                styles.filterButton,
                filter === "pending" && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "pending" && styles.filterButtonTextActive,
                ]}
              >
                Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("all")}
              activeOpacity={0.8}
              style={[
                styles.filterButton,
                filter === "all" && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === "all" && styles.filterButtonTextActive,
                ]}
              >
                All Events
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : !events || events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptyText}>
                No pending events to review at the moment
              </Text>
            </View>
          ) : (
            <FlatList
              data={events}
              renderItem={renderEvent}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.eventsList}
            />
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
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
  unauthorizedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  unauthorizedIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  unauthorizedText: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "rgba(255, 107, 129, 0.3)",
    borderColor: "rgba(255, 107, 129, 0.5)",
  },
  filterButtonText: {
    color: "#E0E0E0",
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#fff",
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
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
    fontSize: 14,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: 20,
  },
  eventsList: {
    gap: 16,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  eventImage: {
    width: "100%",
    height: 200,
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
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventDetails: {
    gap: 6,
    marginBottom: 12,
  },
  eventDetailText: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  eventDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    lineHeight: 20,
    marginBottom: 16,
  },
  eventActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.5)",
  },
  rejectButton: {
    backgroundColor: "rgba(244, 67, 54, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.5)",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
