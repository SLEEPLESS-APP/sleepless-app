import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, BackButton } from "@/components/sleepless";
import { useOrganizer } from "@/lib/organizer-context";
import { trpc } from "@/lib/trpc";
import * as ImagePicker from "expo-image-picker";

export default function OrganizerProfile() {
  const router = useRouter();
  const { organizer, setOrganizer } = useOrganizer();

  const [companyName, setCompanyName] = useState(organizer?.companyName || "");
  const [email, setEmail] = useState(organizer?.contactEmail || "");
  const [phone, setPhone] = useState(organizer?.contactPhone || "");
  const [website, setWebsite] = useState(organizer?.website || "");
  const [bio, setBio] = useState(organizer?.bio || "");
  const [logoUrl, setLogoUrl] = useState(""); // Logo URL not in schema yet
  const [uploading, setUploading] = useState(false);

  // Real updateProfile mutation
  const updateProfileMutation = trpc.organizer.updateProfile.useMutation();

  const handlePickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant photo library access to upload a logo");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        // Upload to S3
        // TODO: Fix uploadImage endpoint
        const uploadResult: any = { success: false, url: "" };
        /*
        const uploadResult = await trpc.organizer.uploadImage.mutate({
          uri: result.assets[0].uri,
          type: "logo",
        });
        */

        if (uploadResult.success && uploadResult.url) {
          setLogoUrl(uploadResult.url);
          Alert.alert("Success", "Logo uploaded successfully");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to upload logo");
        console.error(error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!companyName.trim() || !email.trim()) {
      Alert.alert("Validation Error", "Company name and email are required");
      return;
    }

    try {
      const result = await updateProfileMutation.mutateAsync({
        organizerId: organizer?.id || 0,
        companyName: companyName.trim(),
        contactPhone: phone.trim() || undefined,
        website: website.trim() || undefined,
        bio: bio.trim() || undefined,
      });

      if (result.success) {
        Alert.alert("Success", "Profile updated successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error(error);
    }
  };

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>Edit Profile</Text>
          </View>

          {/* Logo Upload */}
          <View style={styles.logoSection}>
            <Text style={styles.label}>Company Logo</Text>
            <TouchableOpacity
              style={styles.logoButton}
              onPress={handlePickLogo}
              disabled={uploading}
              activeOpacity={0.7}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.logoButtonText}>
                  {logoUrl ? "Change Logo" : "Upload Logo"}
                </Text>
              )}
            </TouchableOpacity>
            {logoUrl && <Text style={styles.logoPreview}>✓ Logo uploaded</Text>}
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Enter company name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="contact@company.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+27 82 123 4567"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="https://company.com"
                placeholderTextColor="#999"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about your company..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}
            activeOpacity={0.7}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
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
  },
  logoSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  logoButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoPreview: {
    color: "#4ADE80",
    fontSize: 14,
    marginTop: 8,
  },
  form: {
    gap: 20,
    marginBottom: 30,
  },
  field: {
    gap: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
