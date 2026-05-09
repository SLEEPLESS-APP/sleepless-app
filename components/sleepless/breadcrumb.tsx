import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const handlePress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          {index > 0 && (
            <MaterialIcons
              name="chevron-right"
              size={16}
              color="rgba(255,255,255,0.5)"
              style={styles.separator}
            />
          )}
          <Pressable
            onPress={() => handlePress(item.route)}
            disabled={!item.route || index === items.length - 1}
            style={({ pressed }) => [
              styles.item,
              pressed && item.route && index !== items.length - 1 && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.text,
                index === items.length - 1 && styles.activeText,
                !item.route && styles.disabledText,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexWrap: "wrap",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    marginHorizontal: 4,
  },
  item: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
  activeText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  disabledText: {
    color: "rgba(255, 255, 255, 0.4)",
  },
});
