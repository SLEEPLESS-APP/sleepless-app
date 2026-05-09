import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export interface TicketTypeData {
  id?: number;
  name: string;
  description: string;
  price: string;
  quantity: string;
  maxPerOrder: string;
}

interface TicketTypesEditorProps {
  ticketTypes: TicketTypeData[];
  onChange: (ticketTypes: TicketTypeData[]) => void;
  disabled?: boolean;
}

const DEFAULT_TICKET_TYPES: TicketTypeData[] = [
  { name: "General Admission", description: "Standard entry ticket", price: "", quantity: "", maxPerOrder: "10" },
];

const PRESET_TICKET_TYPES = [
  { name: "General Admission", description: "Standard entry ticket" },
  { name: "VIP", description: "VIP access with premium benefits" },
  { name: "Early Bird", description: "Discounted early purchase ticket" },
  { name: "Table (4 pax)", description: "Reserved table for 4 guests with bottle service" },
  { name: "Table (6 pax)", description: "Reserved table for 6 guests with bottle service" },
  { name: "Table (10 pax)", description: "Reserved table for 10 guests with premium bottle service" },
  { name: "Couples", description: "Entry for 2 people" },
  { name: "Group (5+)", description: "Discounted group entry for 5 or more" },
];

export function TicketTypesEditor({ ticketTypes, onChange, disabled = false }: TicketTypesEditorProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TicketTypeData>({
    name: "",
    description: "",
    price: "",
    quantity: "",
    maxPerOrder: "10",
  });

  const handleAddTicketType = (preset?: { name: string; description: string }) => {
    if (preset) {
      const newTicketType: TicketTypeData = {
        name: preset.name,
        description: preset.description,
        price: "",
        quantity: "",
        maxPerOrder: "10",
      };
      onChange([...ticketTypes, newTicketType]);
      setShowAddModal(false);
    } else {
      // Add custom ticket type
      setEditForm({
        name: "",
        description: "",
        price: "",
        quantity: "",
        maxPerOrder: "10",
      });
      setEditingIndex(ticketTypes.length);
      setShowAddModal(false);
    }
  };

  const handleEditTicketType = (index: number) => {
    setEditForm({ ...ticketTypes[index] });
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      Alert.alert("Error", "Ticket type name is required");
      return;
    }
    if (!editForm.price || parseFloat(editForm.price) < 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }
    if (!editForm.quantity || parseInt(editForm.quantity) < 1) {
      Alert.alert("Error", "Please enter a valid quantity (at least 1)");
      return;
    }

    const newTicketTypes = [...ticketTypes];
    if (editingIndex !== null) {
      if (editingIndex >= ticketTypes.length) {
        // Adding new
        newTicketTypes.push(editForm);
      } else {
        // Editing existing
        newTicketTypes[editingIndex] = editForm;
      }
    }
    onChange(newTicketTypes);
    setEditingIndex(null);
  };

  const handleDeleteTicketType = (index: number) => {
    Alert.alert(
      "Delete Ticket Type",
      `Are you sure you want to delete "${ticketTypes[index].name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const newTicketTypes = ticketTypes.filter((_, i) => i !== index);
            onChange(newTicketTypes);
          },
        },
      ]
    );
  };

  const getTotalTickets = () => {
    return ticketTypes.reduce((sum, tt) => sum + (parseInt(tt.quantity) || 0), 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ticket Types</Text>
        <Text style={styles.subtitle}>
          {ticketTypes.length} type{ticketTypes.length !== 1 ? "s" : ""} • {getTotalTickets()} total tickets
        </Text>
      </View>

      {/* Ticket Types List */}
      {ticketTypes.map((ticketType, index) => (
        <View key={index} style={styles.ticketTypeCard}>
          <View style={styles.ticketTypeHeader}>
            <View style={styles.ticketTypeInfo}>
              <Text style={styles.ticketTypeName}>{ticketType.name}</Text>
              {ticketType.description && (
                <Text style={styles.ticketTypeDescription}>{ticketType.description}</Text>
              )}
            </View>
            {!disabled && (
              <View style={styles.ticketTypeActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditTicketType(index)}
                >
                  <MaterialIcons name="edit" size={18} color="#38bdf8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteTicketType(index)}
                >
                  <MaterialIcons name="delete" size={18} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.ticketTypeDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>
                {ticketType.price ? `R${ticketType.price}` : "Not set"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>
                {ticketType.quantity || "Not set"}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Max/Order</Text>
              <Text style={styles.detailValue}>{ticketType.maxPerOrder || "10"}</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Add Button */}
      {!disabled && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Ticket Type</Text>
        </TouchableOpacity>
      )}

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Ticket Type</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.presetLabel}>Choose a preset:</Text>
              {PRESET_TICKET_TYPES.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetItem}
                  onPress={() => handleAddTicketType(preset)}
                >
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetDescription}>{preset.description}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.presetItem, styles.customPreset]}
                onPress={() => handleAddTicketType()}
              >
                <MaterialIcons name="add" size={20} color="#38bdf8" />
                <Text style={[styles.presetName, { color: "#38bdf8" }]}>Custom Ticket Type</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editingIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIndex !== null && editingIndex >= ticketTypes.length
                  ? "Add Ticket Type"
                  : "Edit Ticket Type"}
              </Text>
              <TouchableOpacity onPress={() => setEditingIndex(null)}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="e.g., General Admission, VIP, Table"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editForm.description}
                onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                placeholder="What's included with this ticket?"
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                numberOfLines={2}
              />

              <Text style={styles.inputLabel}>Price (ZAR) *</Text>
              <TextInput
                style={styles.input}
                value={editForm.price}
                onChangeText={(text) => setEditForm({ ...editForm, price: text.replace(/[^0-9.]/g, "") })}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Quantity Available *</Text>
              <TextInput
                style={styles.input}
                value={editForm.quantity}
                onChangeText={(text) => setEditForm({ ...editForm, quantity: text.replace(/[^0-9]/g, "") })}
                placeholder="100"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Max Per Order</Text>
              <TextInput
                style={styles.input}
                value={editForm.maxPerOrder}
                onChangeText={(text) => setEditForm({ ...editForm, maxPerOrder: text.replace(/[^0-9]/g, "") })}
                placeholder="10"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Save Ticket Type</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  ticketTypeCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  ticketTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  ticketTypeInfo: {
    flex: 1,
  },
  ticketTypeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  ticketTypeDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  ticketTypeActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  ticketTypeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff6b6b",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  modalScroll: {
    padding: 20,
  },
  presetLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  presetItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  customPreset: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    borderStyle: "dashed",
  },
  presetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  presetDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TicketTypesEditor;
