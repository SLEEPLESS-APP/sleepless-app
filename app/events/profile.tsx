import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Image, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import {
  GradientBackground,
  HomeButton,
  BackButton,
  GlassButton,
} from "@/components/sleepless";
import { useProfile } from "@/lib/profile-context";

export default function ProfileScreen() {
  const { profile, updateDisplayName, updateAvatar } = useProfile();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [isEditing, setIsEditing] = useState(false);

  const handlePickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to change your avatar."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateAvatar(result.assets[0].uri);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await updateAvatar(null);
  };

  const handleSaveName = async () => {
    if (displayName.trim()) {
      await updateDisplayName(displayName.trim());
      setIsEditing(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Success", "Profile updated!");
    } else {
      Alert.alert("Error", "Please enter a display name");
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="person" size={24} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          <View style={styles.content}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <Pressable
                onPress={handlePickImage}
                style={({ pressed }) => [styles.avatarContainer, pressed && styles.pressed]}
              >
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialIcons name="person" size={60} color="rgba(255,255,255,0.5)" />
                  </View>
                )}
                <View style={styles.cameraOverlay}>
                  <MaterialIcons name="camera-alt" size={20} color="#ffffff" />
                </View>
              </Pressable>

              <Text style={styles.avatarHint}>Tap to change photo</Text>

              {profile.avatarUri && (
                <Pressable
                  onPress={handleRemoveAvatar}
                  style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                >
                  <Text style={styles.removeButtonText}>Remove Photo</Text>
                </Pressable>
              )}
            </View>

            {/* Display Name Section */}
            <View style={styles.nameSection}>
              <Text style={styles.label}>Display Name</Text>
              
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoFocus
                    maxLength={30}
                  />
                  <View style={styles.editButtons}>
                    <Pressable
                      onPress={() => {
                        setDisplayName(profile.displayName);
                        setIsEditing(false);
                      }}
                      style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <GlassButton
                      title="Save"
                      onPress={handleSaveName}
                      variant="primary"
                      style={styles.saveButton}
                    />
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setIsEditing(true)}
                  style={({ pressed }) => [styles.nameDisplay, pressed && styles.pressed]}
                >
                  <Text style={styles.nameText}>{profile.displayName}</Text>
                  <MaterialIcons name="edit" size={20} color="rgba(255,255,255,0.6)" />
                </Pressable>
              )}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={20} color="#ff6b6b" />
              <Text style={styles.infoText}>
                Your profile is stored locally on your device. It will be visible on the home screen and in comments.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <BackButton />
            <HomeButton />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 8,
  },
  removeButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  removeButtonText: {
    color: "#ff6b6b",
    fontSize: 14,
  },
  nameSection: {
    marginBottom: 24,
  },
  label: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 8,
  },
  nameDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  nameText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "500",
  },
  editContainer: {
    gap: 12,
  },
  nameInput: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ff6b6b",
    color: "#ffffff",
    fontSize: 18,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  saveButton: {
    minWidth: 80,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  infoText: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
});
