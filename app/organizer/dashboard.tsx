import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, BackButton } from "@/components/sleepless";
import { useOrganizer } from "@/lib/organizer-context";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { Alert } from "react-native";

export default function OrganizerDashboard() {
  const router = useRouter();
  const { organizer, clearOrganizer } = useOrganizer();
  const { user } = useAuth();

  // Fetch organizer stats from backend
  const { data: stats, isLoading } = trpc.organizer.stats.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer?.id }
  );

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your organizer account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await clearOrganizer();
            router.replace("/" as any);
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: "➕",
      title: "Create Event",
      description: "Add a new event to the platform",
      route: "/organizer/create-event",
    },
    {
      icon: "📋",
      title: "My Events",
      description: "View and manage your events",
      route: "/organizer/my-events",
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "View sales and attendance data",
      route: "/organizer/analytics",
    },
    {
      icon: "🎫",
      title: "Bookings",
      description: "Manage ticket bookings",
      route: "/organizer/bookings",
    },
    {
      icon: "📋",
      title: "Templates",
      description: "Manage event templates",
      route: "/organizer/templates",
    },
    {
      icon: "👤",
      title: "Edit Profile",
      description: "Update company details and logo",
      route: "/organizer/profile",
    },
    {
      icon: "🚪",
      title: "Sign Out",
      description: "Sign out of organizer account",
      route: null,
      action: handleSignOut,
    },
  ];

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Organizer Dashboard</Text>
            <Text style={styles.subtitle}>Welcome, {organizer?.companyName}</Text>
            {organizer?.verified === 0 && (
              <View style={styles.verificationBanner}>
                <Text style={styles.verificationText}>
                  ⏳ Your account is pending verification
                </Text>
              </View>
            )}
          </View>

          <View style={styles.stats}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats?.activeEvents || 0}</Text>
                  <Text style={styles.statLabel}>Active Events</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats?.totalSales || 0}</Text>
                  <Text style={styles.statLabel}>Total Sales</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    R{((stats?.totalRevenue || 0) / 100).toFixed(2)}
                  </Text>
                  <Text style={styles.statLabel}>Revenue</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.route) {
                    router.push(item.route as any);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

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
  header: {
    marginBottom: 30,
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
  verificationBanner: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.4)",
  },
  verificationText: {
    color: "#FFC107",
    fontSize: 14,
    textAlign: "center",
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
  },
  menu: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  menuArrow: {
    fontSize: 32,
    color: "#fff",
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
  },
});
