import { View, StyleSheet, Image, Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useProfile } from "@/lib/profile-context";

interface AvatarProps {
  size?: number;
  imageUrl?: string;
  showBorder?: boolean;
  editable?: boolean;
}

export function Avatar({ size = 100, imageUrl, showBorder = true, editable = false }: AvatarProps) {
  const { profile } = useProfile();
  
  // Use provided imageUrl or fall back to profile avatar
  const displayUrl = imageUrl || profile.avatarUri;

  const handlePress = () => {
    if (editable) {
      router.push("/events/profile" as any);
    }
  };

  const content = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showBorder ? 3 : 0,
        },
      ]}
    >
      {displayUrl ? (
        <Image
          source={{ uri: displayUrl }}
          style={[styles.image, { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2 },
          ]}
        >
          <MaterialIcons name="person" size={size * 0.5} color="rgba(255,255,255,0.5)" />
        </View>
      )}
      {editable && (
        <View style={styles.editBadge}>
          <MaterialIcons name="edit" size={14} color="#ffffff" />
        </View>
      )}
    </View>
  );

  if (editable) {
    return (
      <Pressable onPress={handlePress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    position: "relative",
  },
  image: {
    resizeMode: "cover",
  },
  placeholder: {
    backgroundColor: "rgba(128, 128, 128, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
