/**
 * Web-compatible Date & Time picker component.
 * Uses HTML <input type="date/time"> on web, DateTimePicker on native.
 */
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createElement } from "react";

interface WebDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label: string;
  mode: "date" | "time";
}

export function WebDateTimePicker({ value, onChange, label, mode }: WebDatePickerProps) {
  if (Platform.OS !== "web") {
    // On native, this component won't be used — create-event.tsx handles it
    return null;
  }

  const inputType = mode === "date" ? "date" : "time";
  const displayValue = mode === "date"
    ? value.toLocaleDateString("en-ZA")
    : value.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

  const inputValue = mode === "date"
    ? value.toISOString().split("T")[0]
    : `${value.getHours().toString().padStart(2, "0")}:${value.getMinutes().toString().padStart(2, "0")}`;

  const handleChange = (e: any) => {
    const val = e.target.value;
    if (!val) return;
    if (mode === "date") {
      const [year, month, day] = val.split("-").map(Number);
      const newDate = new Date(value);
      newDate.setFullYear(year, month - 1, day);
      onChange(newDate);
    } else {
      const [hours, minutes] = val.split(":").map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
  };

  return createElement(
    "div",
    { style: { position: "relative", marginBottom: 12 } },
    createElement("label", {
      style: {
        display: "block",
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }
    }, label),
    createElement("input", {
      type: inputType,
      value: inputValue,
      onChange: handleChange,
      style: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 12,
        padding: "14px",
        color: "#fff",
        fontSize: 15,
        outline: "none",
        colorScheme: "dark",
        boxSizing: "border-box",
      }
    })
  );
}
