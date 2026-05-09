import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { eventTypes, getPriceRange, type EventType, type EventFilters } from "@/data/mock-data";
import { GlassButton } from "./glass-button";

interface EventFilterProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

export function EventFilter({ filters, onFiltersChange }: EventFilterProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState<EventFilters>(filters);
  const priceRange = getPriceRange();

  const activeFilterCount = 
    (filters.types?.length || 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.startDate || filters.endDate ? 1 : 0);

  const handleOpenModal = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTempFilters(filters);
    setIsModalVisible(true);
  };

  const handleApply = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onFiltersChange(tempFilters);
    setIsModalVisible(false);
  };

  const handleReset = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTempFilters({});
    onFiltersChange({});
    setIsModalVisible(false);
  };

  const toggleType = (type: EventType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const currentTypes = tempFilters.types || [];
    if (currentTypes.includes(type)) {
      setTempFilters({
        ...tempFilters,
        types: currentTypes.filter((t) => t !== type),
      });
    } else {
      setTempFilters({
        ...tempFilters,
        types: [...currentTypes, type],
      });
    }
  };

  const setPriceRange = (min?: number, max?: number) => {
    setTempFilters({
      ...tempFilters,
      minPrice: min,
      maxPrice: max,
    });
  };

  return (
    <>
      <Pressable
        onPress={handleOpenModal}
        style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
      >
        <MaterialIcons name="filter-list" size={20} color="#ffffff" />
        <Text style={styles.filterButtonText}>Filter</Text>
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Events</Text>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <MaterialIcons name="close" size={24} color="#ffffff" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Event Type Filter */}
              <Text style={styles.sectionTitle}>Event Type</Text>
              <View style={styles.typeGrid}>
                {eventTypes.map((type) => {
                  const isSelected = tempFilters.types?.includes(type.id);
                  return (
                    <Pressable
                      key={type.id}
                      onPress={() => toggleType(type.id)}
                      style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                    >
                      <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                        {type.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Price Range Filter */}
              <Text style={styles.sectionTitle}>Price Range (ZAR)</Text>
              <View style={styles.priceOptions}>
                <Pressable
                  onPress={() => setPriceRange(undefined, undefined)}
                  style={[
                    styles.priceChip,
                    tempFilters.minPrice === undefined && tempFilters.maxPrice === undefined && styles.priceChipSelected,
                  ]}
                >
                  <Text style={styles.priceChipText}>All</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPriceRange(0, 150)}
                  style={[
                    styles.priceChip,
                    tempFilters.maxPrice === 150 && styles.priceChipSelected,
                  ]}
                >
                  <Text style={styles.priceChipText}>Under R150</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPriceRange(150, 250)}
                  style={[
                    styles.priceChip,
                    tempFilters.minPrice === 150 && tempFilters.maxPrice === 250 && styles.priceChipSelected,
                  ]}
                >
                  <Text style={styles.priceChipText}>R150 - R250</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPriceRange(250, 400)}
                  style={[
                    styles.priceChip,
                    tempFilters.minPrice === 250 && tempFilters.maxPrice === 400 && styles.priceChipSelected,
                  ]}
                >
                  <Text style={styles.priceChipText}>R250 - R400</Text>
                </Pressable>
                <Pressable
                  onPress={() => setPriceRange(400, undefined)}
                  style={[
                    styles.priceChip,
                    tempFilters.minPrice === 400 && tempFilters.maxPrice === undefined && styles.priceChipSelected,
                  ]}
                >
                  <Text style={styles.priceChipText}>R400+</Text>
                </Pressable>
              </View>

              {/* Date Filter */}
              <Text style={styles.sectionTitle}>Date</Text>
              <View style={styles.dateOptions}>
                <Pressable
                  onPress={() => setTempFilters({ ...tempFilters, startDate: undefined, endDate: undefined })}
                  style={[
                    styles.dateChip,
                    !tempFilters.startDate && !tempFilters.endDate && styles.dateChipSelected,
                  ]}
                >
                  <Text style={styles.dateChipText}>All Dates</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const today = new Date();
                    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    setTempFilters({ ...tempFilters, startDate: today, endDate: nextWeek });
                  }}
                  style={[styles.dateChip]}
                >
                  <Text style={styles.dateChipText}>This Week</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const today = new Date();
                    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
                    setTempFilters({ ...tempFilters, startDate: today, endDate: nextMonth });
                  }}
                  style={[styles.dateChip]}
                >
                  <Text style={styles.dateChipText}>This Month</Text>
                </Pressable>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <GlassButton
                title="Reset"
                onPress={handleReset}
                variant="outline"
                style={styles.footerButton}
              />
              <GlassButton
                title="Apply Filters"
                onPress={handleApply}
                variant="primary"
                style={styles.footerButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  filterButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#ff6b6b",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  typeChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  typeChipSelected: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  typeChipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  typeChipTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
  priceOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  priceChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  priceChipSelected: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  priceChipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  dateOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  dateChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dateChipSelected: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  dateChipText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  footerButton: {
    flex: 1,
  },
});
