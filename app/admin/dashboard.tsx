import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";


export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { data: metrics, isLoading } = trpc.admin.metrics.useQuery(undefined, { enabled: isAdmin });

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

  const handleSignOut = async () => {
    Platform.OS === "web" ? localStorage.removeItem("admin_session") : (await import("@react-native-async-storage/async-storage")).default.removeItem("admin_session");
    router.replace("/admin/login" as any);
  };

  if (checkingAuth) {
    return (
      <GradientBackground>
        <ScreenContainer>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to login
  }

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Admin Dashboard</Text>
                <Text style={styles.subtitle}>Platform Overview</Text>
              </View>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <>
              {/* Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>👥</Text>
                  <Text style={styles.metricValue}>{metrics?.totalOrganizers || 0}</Text>
                  <Text style={styles.metricLabel}>Total Organizers</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>⏳</Text>
                  <Text style={styles.metricValue}>{metrics?.pendingApprovals || 0}</Text>
                  <Text style={styles.metricLabel}>Pending Approvals</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>🎉</Text>
                  <Text style={styles.metricValue}>{metrics?.activeEvents || 0}</Text>
                  <Text style={styles.metricLabel}>Active Events</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>💰</Text>
                  <Text style={styles.metricValue}>
                    R{(metrics?.platformRevenue || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.metricLabel}>Platform Revenue</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>🎫</Text>
                  <Text style={styles.metricValue}>{metrics?.totalBookings || 0}</Text>
                  <Text style={styles.metricLabel}>Total Bookings</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>👤</Text>
                  <Text style={styles.metricValue}>{metrics?.totalUsers || 0}</Text>
                  <Text style={styles.metricLabel}>Total Users</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("/admin/approvals" as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>📋</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Pending Approvals</Text>
                    <Text style={styles.actionSubtitle}>
                      Review events and organizers
                    </Text>
                  </View>
                  <Text style={styles.actionChevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("/admin/audit-log" as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>📊</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Audit Log</Text>
                    <Text style={styles.actionSubtitle}>View all admin actions</Text>
                  </View>
                  <Text style={styles.actionChevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("/admin/organizers" as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>🏢</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Manage Organizers</Text>
                    <Text style={styles.actionSubtitle}>
                      {metrics?.totalOrganizers || 0} registered
                    </Text>
                  </View>
                  <Text style={styles.actionChevron}>›</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  signOutButton: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.4)",
  },
  signOutText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#E0E0E0",
    textAlign: "center",
  },
  actionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  actionChevron: {
    fontSize: 32,
    color: "rgba(255, 255, 255, 0.5)",
  },
});
