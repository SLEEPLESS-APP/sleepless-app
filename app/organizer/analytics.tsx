import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, BackButton } from "@/components/sleepless";
import { useOrganizer } from "@/lib/organizer-context";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get("window");

export default function Analytics() {
  const router = useRouter();
  const { organizer } = useOrganizer();

  // Fetch analytics data
  const { data: analytics, isLoading } = trpc.organizer.analytics.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer?.id }
  );

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <View style={[styles.statCard, { borderColor: color, borderWidth: 2 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Revenue and performance insights</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
          ) : !analytics ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No Data Yet</Text>
              <Text style={styles.emptyText}>
                Analytics will appear once you have events with ticket sales
              </Text>
            </View>
          ) : (
            <>
              {/* Overview Stats */}
              <View style={styles.statsGrid}>
                {renderStatCard(
                  "Total Revenue",
                  `R${(analytics.totalRevenue / 100).toFixed(2)}`,
                  "💰",
                  "rgba(76, 175, 80, 0.5)"
                )}
                {renderStatCard(
                  "Total Sales",
                  analytics.totalSales.toString(),
                  "🎫",
                  "rgba(33, 150, 243, 0.5)"
                )}
                {renderStatCard(
                  "Active Events",
                  analytics.activeEvents.toString(),
                  "📅",
                  "rgba(255, 152, 0, 0.5)"
                )}
                {renderStatCard(
                  "Total Views",
                  analytics.totalViews?.toString() || "0",
                  "👁️",
                  "rgba(156, 39, 176, 0.5)"
                )}
                {renderStatCard(
                  "Conversion Rate",
                  `${analytics.conversionRate?.toFixed(1) || 0}%`,
                  "📈",
                  "rgba(255, 107, 107, 0.5)"
                )}
              </View>

              {/* Recent Activity */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.trendsContainer}>
                  <View style={styles.trendItem}>
                    <Text style={styles.trendLabel}>This Week</Text>
                    <Text style={styles.trendValue}>
                      {analytics.salesThisWeek || 0} tickets
                    </Text>
                  </View>
                  <View style={styles.trendItem}>
                    <Text style={styles.trendLabel}>This Month</Text>
                    <Text style={styles.trendValue}>
                      {analytics.salesThisMonth || 0} tickets
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.footer}>
            <BackButton />
          </View>
        </ScrollView>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#E0E0E0",
    textAlign: "center",
  },
  metricCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 12,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  trendsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  trendItem: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  trendLabel: {
    fontSize: 12,
    color: "#E0E0E0",
    marginBottom: 8,
  },
  trendValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  emptyState: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
});
