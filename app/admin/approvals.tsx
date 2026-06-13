import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

type TabType = "events" | "organizers";

function confirm(message: string): boolean {
  if (Platform.OS === "web") return window.confirm(message);
  return true;
}

function alert(message: string): void {
  if (Platform.OS === "web") window.alert(message);
}

export default function AdminApprovals() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { data: pendingEvents, isLoading: eventsLoading, refetch: refetchEvents } =
    trpc.admin.getPendingEvents.useQuery(undefined, { enabled: isAdmin });

  const { data: pendingOrganizers, isLoading: organizersLoading, refetch: refetchOrganizers } =
    trpc.admin.getPendingOrganizers.useQuery(undefined, { enabled: isAdmin });

  const approveEventMutation = trpc.admin.approveEvent.useMutation();
  const rejectEventMutation = trpc.admin.rejectEvent.useMutation();
  const approveOrganizerMutation = trpc.admin.approveOrganizer.useMutation();
  const rejectOrganizerMutation = trpc.admin.rejectOrganizer.useMutation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = Platform.OS === "web" && typeof window !== "undefined"
          ? window.localStorage.getItem("admin_session")
          : null;
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
      } catch {
        router.replace("/admin/login" as any);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleApproveEvent = async (eventId: number, eventTitle: string) => {
    if (!confirm(`Approve event "${eventTitle}"?`)) return;
    try {
      await approveEventMutation.mutateAsync({ eventId });
      alert("Event approved successfully!");
      refetchEvents();
    } catch {
      alert("Failed to approve event. Please try again.");
    }
  };

  const handleRejectEvent = async (eventId: number, eventTitle: string) => {
    if (!confirm(`Reject event "${eventTitle}"?`)) return;
    try {
      await rejectEventMutation.mutateAsync({ eventId, reason: "Rejected by admin" });
      alert("Event rejected.");
      refetchEvents();
    } catch {
      alert("Failed to reject event. Please try again.");
    }
  };

  const handleApproveOrganizer = async (organizerId: number, companyName: string) => {
    if (!confirm(`Approve organizer "${companyName}"?`)) return;
    try {
      await approveOrganizerMutation.mutateAsync({ organizerId });
      alert("Organizer approved successfully!");
      refetchOrganizers();
    } catch {
      alert("Failed to approve organizer. Please try again.");
    }
  };

  const handleRejectOrganizer = async (organizerId: number, companyName: string) => {
    if (!confirm(`Reject organizer "${companyName}"?`)) return;
    try {
      await rejectOrganizerMutation.mutateAsync({ organizerId, reason: "Rejected by admin" });
      alert("Organizer rejected.");
      refetchOrganizers();
    } catch {
      alert("Failed to reject organizer. Please try again.");
    }
  };

  if (checkingAuth) {
    return (
      <GradientBackground>
        <ScreenContainer>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Pending Approvals</Text>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "events" && styles.tabActive]}
              onPress={() => setActiveTab("events")}
            >
              <Text style={[styles.tabText, activeTab === "events" && styles.tabTextActive]}>
                Events {pendingEvents ? `(${pendingEvents.length})` : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "organizers" && styles.tabActive]}
              onPress={() => setActiveTab("organizers")}
            >
              <Text style={[styles.tabText, activeTab === "organizers" && styles.tabTextActive]}>
                Organizers {pendingOrganizers ? `(${pendingOrganizers.length})` : ""}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {activeTab === "events" ? (
              eventsLoading ? (
                <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
              ) : !pendingEvents?.length ? (
                <Text style={styles.empty}>No pending events</Text>
              ) : (
                pendingEvents.map((event: any) => (
                  <View key={event.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{event.title}</Text>
                    <Text style={styles.cardSub}>{event.venue} · {event.city}</Text>
                    <Text style={styles.cardSub}>{event.eventType} · R{(event.price / 100).toFixed(0)}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveEvent(event.id, event.title)}>
                        <Text style={styles.approveTxt}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectEvent(event.id, event.title)}>
                        <Text style={styles.rejectTxt}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )
            ) : (
              organizersLoading ? (
                <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
              ) : !pendingOrganizers?.length ? (
                <Text style={styles.empty}>No pending organizers</Text>
              ) : (
                pendingOrganizers.map((org: any) => (
                  <View key={org.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{org.companyName}</Text>
                    <Text style={styles.cardSub}>📧 {org.contactEmail}</Text>
                    {org.contactPhone && <Text style={styles.cardSub}>📱 {org.contactPhone}</Text>}
                    {org.bio && <Text style={styles.cardSub}>Bio: {org.bio}</Text>}
                    <Text style={styles.cardSub}>Joined: {new Date(org.createdAt).toLocaleDateString("en-ZA")}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveOrganizer(org.id, org.companyName)}>
                        <Text style={styles.approveTxt}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectOrganizer(org.id, org.companyName)}>
                        <Text style={styles.rejectTxt}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )
            )}
          </ScrollView>
        </View>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
  back: { color: "#fff", fontSize: 24 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  tabs: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#6B21A8" },
  tabText: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  list: { flex: 1 },
  empty: { color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 60, fontSize: 16 },
  card: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  cardTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 6 },
  cardSub: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 3 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  approveBtn: { flex: 1, paddingVertical: 12, alignItems: "center", backgroundColor: "rgba(74,222,128,0.2)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(74,222,128,0.4)" },
  approveTxt: { color: "#4ade80", fontWeight: "600", fontSize: 14 },
  rejectBtn: { flex: 1, paddingVertical: 12, alignItems: "center", backgroundColor: "rgba(239,68,68,0.2)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(239,68,68,0.4)" },
  rejectTxt: { color: "#ef4444", fontWeight: "600", fontSize: 14 },
});
