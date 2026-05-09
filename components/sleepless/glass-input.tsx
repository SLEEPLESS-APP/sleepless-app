import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";

interface GlassInputProps extends TextInputProps {
  icon?: ComponentProps<typeof MaterialIcons>["name"];
}

export function GlassInput({ icon, style, ...props }: GlassInputProps) {
  return (
    <View style={styles.container}>
      {icon && (
        <MaterialIcons name={icon} size={20} color="rgba(255,255,255,0.7)" style={styles.icon} />
      )}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="rgba(255,255,255,0.5)"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
  },
});
