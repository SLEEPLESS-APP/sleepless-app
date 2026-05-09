import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuditLog() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { data: logs, isLoading } = trpc.admin.auditLog.useQuery(undefined, { enabled: isAdmin });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
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
    } catch (error) {
      console.error("Error checking admin auth:", error);
      router.replace("/admin/login" as any);
    }
    setCheckingAuth(false);
  };

  if (checkingAuth) {
    return (
      <GradientBackground>
        <ScreenContainer>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading audit log...</Text>
          </View>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to login
  }

  const renderLogEntry = ({ item }: { item: any }) => {
    const actionIcon = item.action === "approve" ? "✅" : item.action === "reject" ? "❌" : "📝";
    const actionColor = item.action === "approve" ? "#4ADE80" : item.action === "reject" ? "#F87171" : "#60A5FA";

    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <Text style={styles.actionIcon}>{actionIcon}</Text>
          <View style={styles.logHeaderText}>
            <Text style={[styles.actionText, { color: actionColor }]}>
              {item.action.toUpperCase()}
            </Text>
            <Text style={styles.timestampText}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.logContent}>
          <Text style={styles.adminText}>Admin: {item.adminName || "Unknown"}</Text>
          <Text style={styles.targetText}>Event ID: {item.eventId}</Text>
          {item.reason && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Reason:</Text>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
          )}
        </View>
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
              <Text style={styles.title}>Audit Log</Text>
              <Text style={styles.subtitle}>All admin actions</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading logs...</Text>
            </View>
          ) : !logs || logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptyText}>
                Admin actions will appear here once events are reviewed
              </Text>
            </View>
          ) : (
            <FlatList
              data={logs}
              renderItem={renderLogEntry}
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
  logCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  logHeaderText: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 12,
    color: "#E0E0E0",
  },
  logContent: {
    paddingLeft: 36,
  },
  adminText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  targetText: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 8,
  },
  reasonContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reasonLabel: {
    fontSize: 12,
    color: "#E0E0E0",
    marginBottom: 4,
    fontWeight: "600",
  },
  reasonText: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
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
