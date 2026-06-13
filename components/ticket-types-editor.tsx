import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { SvgIcon } from "@/components/sleepless/svg-icons";

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

const PRESET_TICKET_TYPES = [
  { name: "General Admission", description: "Standard entry ticket" },
  { name: "VIP", description: "VIP access with premium benefits" },
  { name: "Early Bird", description: "Discounted early purchase ticket" },
  { name: "Table (4 pax)", description: "Reserved table for 4 guests" },
  { name: "Table (6 pax)", description: "Reserved table for 6 guests" },
  { name: "Table (10 pax)", description: "Reserved table for 10 guests" },
  { name: "Couples", description: "Entry for 2 people" },
  { name: "Group (5+)", description: "Discounted group entry for 5+" },
];

const EMPTY_FORM: TicketTypeData = {
  name: "", description: "", price: "", quantity: "", maxPerOrder: "10",
};

export function TicketTypesEditor({ ticketTypes, onChange, disabled = false }: TicketTypesEditorProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TicketTypeData>(EMPTY_FORM);

  const openAdd = () => {
    setEditingIndex(null);
    setEditForm(EMPTY_FORM);
    setShowAddModal(true);
  };

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...ticketTypes[index] });
    setShowAddModal(true);
  };

  const saveTicket = () => {
    if (!editForm.name || !editForm.price || !editForm.quantity) {
      if (Platform.OS === "web") {
        window.alert("Please fill in name, price and quantity");
      }
      return;
    }
    const updated = [...ticketTypes];
    if (editingIndex !== null) {
      updated[editingIndex] = editForm;
    } else {
      updated.push(editForm);
    }
    onChange(updated);
    setShowAddModal(false);
  };

  const removeTicket = (index: number) => {
    if (Platform.OS === "web") {
      if (!window.confirm(`Remove "${ticketTypes[index].name}"?`)) return;
    }
    onChange(ticketTypes.filter((_, i) => i !== index));
  };

  const selectPreset = (preset: typeof PRESET_TICKET_TYPES[0]) => {
    setEditForm({ ...editForm, name: preset.name, description: preset.description });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ticket Types</Text>

      {ticketTypes.map((tt, index) => (
        <View key={index} style={styles.ticketCard}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketName}>{tt.name}</Text>
            <Text style={styles.ticketMeta}>R{tt.price} · {tt.quantity} tickets</Text>
          </View>
          {!disabled && (
            <View style={styles.ticketActions}>
              <TouchableOpacity onPress={() => openEdit(index)} style={styles.iconBtn}>
                <SvgIcon name="settings" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeTicket(index)} style={styles.iconBtn}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      {!disabled && (
        <TouchableOpacity style={styles.addButton} onPress={openAdd}>
          <Text style={styles.addButtonText}>+ Add Ticket Type</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingIndex !== null ? "Edit" : "Add"} Ticket Type</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {editingIndex === null && (
                <>
                  <Text style={styles.sectionLabel}>Quick Select</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
                    {PRESET_TICKET_TYPES.map((p) => (
                      <TouchableOpacity key={p.name} style={styles.presetChip} onPress={() => selectPreset(p)}>
                        <Text style={styles.presetText}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder="Ticket Name *"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={editForm.name}
                onChangeText={(v) => setEditForm({ ...editForm, name: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={editForm.description}
                onChangeText={(v) => setEditForm({ ...editForm, description: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="Price (ZAR) *"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={editForm.price}
                onChangeText={(v) => setEditForm({ ...editForm, price: v })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Quantity Available *"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={editForm.quantity}
                onChangeText={(v) => setEditForm({ ...editForm, quantity: v })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Max Per Order (default: 10)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={editForm.maxPerOrder}
                onChangeText={(v) => setEditForm({ ...editForm, maxPerOrder: v })}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.saveBtn} onPress={saveTicket}>
                <Text style={styles.saveBtnText}>Save Ticket Type</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  ticketCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  ticketInfo: { flex: 1 },
  ticketName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  ticketMeta: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  ticketActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  removeText: { color: "#ef4444", fontSize: 16, fontWeight: "700" },
  addButton: { borderWidth: 1, borderColor: "rgba(107,33,168,0.5)", borderRadius: 12, borderStyle: "dashed", padding: 14, alignItems: "center", marginTop: 4 },
  addButtonText: { color: "#9333ea", fontSize: 14, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1a1a35", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  closeBtn: { color: "rgba(255,255,255,0.5)", fontSize: 20 },
  sectionLabel: { color: "rgba(255,255,255,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  presets: { marginBottom: 16 },
  presetChip: { backgroundColor: "rgba(107,33,168,0.2)", borderWidth: 1, borderColor: "rgba(107,33,168,0.4)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  presetText: { color: "#a78bfa", fontSize: 13 },
  input: { backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, marginBottom: 12 },
  saveBtn: { backgroundColor: "#6B21A8", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
