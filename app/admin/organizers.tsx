import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";


export default function ManageOrganizers() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Fetch all organizers (both verified and pending)
  const { data: pendingOrganizers, isLoading: pendingLoading, refetch: refetchPending } = 
    trpc.admin.getPendingOrganizers.useQuery(undefined, { enabled: isAdmin });

  const approveOrganizerMutation = trpc.admin.approveOrganizer.useMutation();
  const rejectOrganizerMutation = trpc.admin.rejectOrganizer.useMutation();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const session = typeof window !== "undefined" ? window.localStorage.getItem("admin_session") : null;
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
    } catch (error) {
      console.error("Error checking admin auth:", error);
      router.replace("/admin/login" as any);
    }
    setCheckingAuth(false);
  };

  const handleApprove = (organizerId: number, companyName: string) => {
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
              refetchPending();
            } catch (error) {
              Alert.alert("Error", "Failed to approve organizer");
            }
          },
        },
      ]
    );
  };

  const handleReject = (organizerId: number, companyName: string) => {
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
              await rejectOrganizerMutation.mutateAsync({ organizerId, reason: "Application rejected by admin" });
              Alert.alert("Success", "Organizer rejected");
              refetchPending();
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
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading organizers...</Text>
          </View>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to login
  }

  const renderOrganizer = ({ item }: { item: any }) => {
    const isVerified = item.verified === 1;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{item.companyName}</Text>
            <View style={[styles.statusBadge, isVerified ? styles.verifiedBadge : styles.pendingBadge]}>
              <Text style={styles.statusText}>{isVerified ? "Verified" : "Pending"}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.detailText}>👤 {item.contactPerson ?? item.companyName}</Text>
          <Text style={styles.detailText}>📧 {item.email ?? item.contactEmail}</Text>
          {item.phone && <Text style={styles.detailText}>📱 {item.phone}</Text>}
        </View>
          {item.verificationDocs && (() => {
            let docs: string[] = [];
            try { docs = JSON.parse(item.verificationDocs); } catch {}
            return docs.length > 0 ? (
              <View style={styles.docsSection}>
                <Text style={styles.docsLabel}>Verification documents</Text>
                {docs.map((url: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.docLink}
                    onPress={() => Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open document"))}
                  >
                    <Text style={styles.docLinkText}>📄 Document {idx + 1}</Text>
                    <Text style={styles.docLinkHint}>Tap to view</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={[styles.detailText, { color: "rgba(251,191,36,0.8)" }]}>⚠ No documents uploaded</Text>
            );
          })()}

        {!isVerified && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApprove(item.id, item.companyName)}
            >
              <Text style={styles.approveButtonText}>✓ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(item.id, item.companyName)}
            >
              <Text style={styles.rejectButtonText}>✕ Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <GradientBackground>
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>Manage Organizers</Text>
              <Text style={styles.subtitle}>
                {pendingOrganizers?.length || 0} pending approval
              </Text>
            </View>
          </View>

          {pendingLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading organizers...</Text>
            </View>
          ) : !pendingOrganizers || pendingOrganizers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptyText}>
                No pending organizer applications to review
              </Text>
            </View>
          ) : (
            <FlatList
              data={pendingOrganizers}
              renderItem={renderOrganizer}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
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
    alignItems: "center",
    marginBottom: 24,
  },
  backIconButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 32,
    color: "#fff",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
  },
  pendingBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  docsSection: {
    marginTop: 8,
    gap: 6,
  },
  docsLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  docLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  docLinkText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
  docLinkHint: {
    fontSize: 11,
    color: "rgba(255,107,107,0.8)",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: 24,
  },
});
