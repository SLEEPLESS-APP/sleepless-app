import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, BackButton } from "@/components/sleepless";
import { useOrganizer } from "@/lib/organizer-context";

interface EventTemplate {
  id: string;
  name: string;
  eventType: string;
  description: string;
  price: number;
  ticketsAvailable: number;
  eventTime: string;
}

export default function EventTemplates() {
  const router = useRouter();
  const { organizer } = useOrganizer();
  const [templates, setTemplates] = useState<EventTemplate[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const stored = Platform.OS === "web" ? localStorage.getItem(`templates_${organizer?.id}`) : null;
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleUseTemplate = (template: EventTemplate) => {
    // Navigate to create event with template data
    router.push({
      pathname: "/organizer/create-event",
      params: {
        template: JSON.stringify(template),
      },
    } as any);
  };

  const handleDeleteTemplate = (templateId: string) => {
    Alert.alert(
      "Delete Template",
      "Are you sure you want to delete this template?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = templates.filter((t) => t.id !== templateId);
            setTemplates(updated);
            Platform.OS === "web" && localStorage.setItem(
              `templates_${organizer?.id}`,
              JSON.stringify(updated)
            );
          },
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>Event Templates</Text>
            <Text style={styles.subtitle}>
              Reuse event details for recurring events
            </Text>
          </View>

          {templates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No templates yet</Text>
              <Text style={styles.emptySubtext}>
                Create an event and save it as a template for quick reuse
              </Text>
            </View>
          ) : (
            <View style={styles.templateList}>
              {templates.map((template) => (
                <View key={template.id} style={styles.templateCard}>
                  <View style={styles.templateHeader}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateType}>{template.eventType}</Text>
                  </View>

                  <Text style={styles.templateDescription} numberOfLines={2}>
                    {template.description}
                  </Text>

                  <View style={styles.templateDetails}>
                    <Text style={styles.templateDetail}>
                      💰 R{(template.price / 100).toFixed(2)}
                    </Text>
                    <Text style={styles.templateDetail}>
                      🎫 {template.ticketsAvailable} tickets
                    </Text>
                    <Text style={styles.templateDetail}>
                      🕐 {template.eventTime}
                    </Text>
                  </View>

                  <View style={styles.templateActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.useButton]}
                      onPress={() => handleUseTemplate(template)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.useButtonText}>Use Template</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteTemplate(template.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 Tip: Save time by creating templates for your regular events
            </Text>
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
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#E0E0E0",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  templateList: {
    gap: 16,
  },
  templateCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  templateName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  templateType: {
    fontSize: 12,
    color: "#0a7ea4",
    backgroundColor: "rgba(10, 126, 164, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
  },
  templateDescription: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 16,
    lineHeight: 20,
  },
  templateDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  templateDetail: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  templateActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  useButton: {
    backgroundColor: "#0a7ea4",
  },
  useButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "rgba(10, 126, 164, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(10, 126, 164, 0.3)",
  },
  footerText: {
    fontSize: 14,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: 20,
  },
});
