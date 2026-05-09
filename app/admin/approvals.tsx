import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

type TabType = "events" | "organizers";

export default function AdminApprovals() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Fetch pending events
  const { data: pendingEvents, isLoading: eventsLoading, refetch: refetchEvents } = 
    trpc.admin.getPendingEvents.useQuery(undefined, { enabled: isAdmin });

  // Fetch pending organizers
  const { data: pendingOrganizers, isLoading: organizersLoading, refetch: refetchOrganizers } = 
    trpc.admin.getPendingOrganizers.useQuery(undefined, { enabled: isAdmin });

  const approveEventMutation = trpc.admin.approveEvent.useMutation();
  const rejectEventMutation = trpc.admin.rejectEvent.useMutation();
  const approveOrganizerMutation = trpc.admin.approveOrganizer.useMutation();
  const rejectOrganizerMutation = trpc.admin.rejectOrganizer.useMutation();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const session = await AsyncStorage.getItem("admin_session");
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.loggedIn) {
        setIsAdmin(true);
      } else {
        router.replace("/admin/login" as any);
      }
    } else {
      router.replace("/admin/login" as any);
    }
    setCheckingAuth(false);
  };

  const handleApproveEvent = (eventId: number, eventTitle: string) => {
    Alert.alert(
      "Approve Event",
      `Are you sure you want to approve "${eventTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await approveEventMutation.mutateAsync({ eventId });
              Alert.alert("Success", "Event approved successfully");
              refetchEvents();
            } catch (error) {
              Alert.alert("Error", "Failed to approve event");
            }
          },
        },
      ]
    );
  };

  const handleRejectEvent = (eventId: number, eventTitle: string) => {
    Alert.alert(
      "Reject Event",
      `Are you sure you want to reject "${eventTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await rejectEventMutation.mutateAsync({ eventId, reason: "Does not meet guidelines" });
              Alert.alert("Success", "Event rejected");
              refetchEvents();
            } catch (error) {
              Alert.alert("Error", "Failed to reject event");
            }
          },
        },
      ]
    );
  };

  const handleApproveOrganizer = (organizerId: number, companyName: string) => {
    Alert.alert(
      "Approve Organizer",
      `Are you sure you want to approve "${companyName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await approveOrganizerMutation.mutateAsync({ organizerId });
              Alert.alert("Success", "Organizer approved successfully");
              refetchOrganizers();
            } catch (error) {
              Alert.alert("Error", "Failed to approve organizer");
            }
          },
        },
      ]
    );
  };

  const handleRejectOrganizer = (organizerId: number, companyName: string) => {
    Alert.alert(
      "Reject Organizer",
      `Are you sure you want to reject "${companyName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await rejectOrganizerMutation.mutateAsync({ organizerId, reason: "Verification documents insufficient" });
              Alert.alert("Success", "Organizer rejected");
              refetchOrganizers();
            } catch (error) {
              Alert.alert("Error", "Failed to reject organizer");
            }
          },
        },
      ]
    );
  };

  if (checkingAuth) {
    return (
      <GradientBackground>
        <ScreenContainer>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff6b6b" />
            <Text style={styles.loadingText}>Checking authentication...</Text>
          </View>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <GradientBackground>
      <ScreenContainer>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Pending Approvals</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingEvents?.length || 0}</Text>
              <Text style={styles.statLabel}>Pending Events</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingOrganizers?.length || 0}</Text>
              <Text style={styles.statLabel}>Pending Organizers</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "events" && styles.tabActive]}
              onPress={() => setActiveTab("events")}
            >
              <Text style={[styles.tabText, activeTab === "events" && styles.tabTextActive]}>
                Events ({pendingEvents?.length || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "organizers" && styles.tabActive]}
              onPress={() => setActiveTab("organizers")}
            >
              <Text style={[styles.tabText, activeTab === "organizers" && styles.tabTextActive]}>
                Organizers ({pendingOrganizers?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === "events" ? (
              eventsLoading ? (
                <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 40 }} />
              ) : pendingEvents && pendingEvents.length > 0 ? (
                pendingEvents.map((event: any) => (
                  <View key={event.id} style={styles.card}>
                    {event.posterUrl && (
                      <Image source={{ uri: event.posterUrl }} style={styles.eventPoster} />
                    )}
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{event.title}</Text>
                      <Text style={styles.cardSubtitle}>{event.venue}</Text>
                      <Text style={styles.cardDetail}>
                        📍 {event.city}, {event.province}
                      </Text>
                      <Text style={styles.cardDetail}>
                        📅 {new Date(event.eventDate).toLocaleDateString()}
                      </Text>
                      <Text style={styles.cardDetail}>
                        💰 R{event.price} • 🎫 {event.ticketsAvailable} tickets
                      </Text>
                      <Text style={styles.cardDetail}>
                        🏷️ {event.eventType}
                      </Text>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => handleApproveEvent(event.id, event.title)}
                      >
                        <Text style={styles.approveButtonText}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectEvent(event.id, event.title)}
                      >
                        <Text style={styles.rejectButtonText}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>✅</Text>
                  <Text style={styles.emptyText}>No pending events</Text>
                  <Text style={styles.emptySubtext}>All events have been reviewed</Text>
                </View>
              )
            ) : organizersLoading ? (
              <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 40 }} />
            ) : pendingOrganizers && pendingOrganizers.length > 0 ? (
              pendingOrganizers.map((org: any) => (
                <View key={org.id} style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{org.companyName}</Text>
                    <Text style={styles.cardSubtitle}>{org.contactPerson}</Text>
                    <Text style={styles.cardDetail}>📧 {org.email}</Text>
                    <Text style={styles.cardDetail}>📱 {org.phone}</Text>
                    {org.verificationDocs && (
                      <Text style={styles.cardDetail}>📄 Documents uploaded</Text>
                    )}
                    <Text style={styles.cardDetail}>
                      📅 Applied: {new Date(org.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApproveOrganizer(org.id, org.companyName)}
                    >
                      <Text style={styles.approveButtonText}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleRejectOrganizer(org.id, org.companyName)}
                    >
                      <Text style={styles.rejectButtonText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyText}>No pending organizers</Text>
                <Text style={styles.emptySubtext}>All applications have been reviewed</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ff6b6b",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#ff6b6b",
  },
  tabText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  eventPoster: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  approveButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(74, 222, 128, 0.2)",
  },
  approveButtonText: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  rejectButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
});
