import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, GlassInput, BackButton } from "@/components/sleepless";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/use-auth";
import { useOrganizer } from "@/lib/organizer-context";
import { trpc } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";

export default function OrganizerRegister() {
  const router = useRouter();
  const { user } = useAuth();
  const { setOrganizer } = useOrganizer();

  const [formData, setFormData] = useState({
    companyName: "",
    contactEmail: user?.email || "",
    contactPhone: "",
    website: "",
    bio: "",
    password: "",
    confirmPassword: "",
    facebook: "",
    instagram: "",
    twitter: "",
  });

  const [emailError, setEmailError] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  
  const registerMutation = trpc.organizer.register.useMutation();

  const uploadImageMutation = trpc.organizer.uploadImage.useMutation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        setUploadingDocs(true);
        const uploadedUrls: string[] = [];

        for (const asset of result.assets) {
          try {
            // Read file as base64
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const reader = new FileReader();
            
            const base64 = await new Promise<string>((resolve, reject) => {
              reader.onloadend = () => {
                const base64data = reader.result as string;
                resolve(base64data.split(",")[1]);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });

            // Upload to S3
            const uploadResult = await uploadImageMutation.mutateAsync({
              base64Data: base64,
              fileName: `organizer-docs/${Date.now()}-${asset.name}`,
              contentType: asset.mimeType || "application/pdf",
            });

            uploadedUrls.push(uploadResult.url);
          } catch (error) {
            console.error("Error uploading document:", error);
          }
        }

        setDocuments([...documents, ...uploadedUrls]);
        setUploadingDocs(false);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      setUploadingDocs(false);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleEmailChange = (text: string) => {
    setFormData({ ...formData, contactEmail: text });
    if (text && !validateEmail(text)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async () => {
    if (registerMutation.isPending) return;

    // Validate required fields
    if (!formData.companyName || !formData.contactEmail || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields (Company Name, Email, Password)");
      return;
    }

    // Validate email format
    if (!validateEmail(formData.contactEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Validate password
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        companyName: formData.companyName.trim(),
        email: formData.contactEmail.trim(),
        phone: formData.contactPhone.trim() || undefined,
        website: formData.website.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        password: formData.password,
        verificationDocuments: documents.join(",") || undefined,
      });

      if (result.success) {
        if (result.organizer) {
          await setOrganizer(result.organizer);
        }
        Alert.alert(
          "Application Submitted!",
          "Your organizer application has been submitted. An admin will review it and you'll be notified by email.",
          [{ text: "OK", onPress: () => router.replace("/organizer/dashboard" as any) }]
        );
      } else {
        Alert.alert("Error", "Registration failed. Please try again.");
      }
    } catch (error: any) {
      const msg = error?.data?.message ?? error?.message ?? "Failed to submit application. Please try again.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Become an Organizer</Text>
          <Text style={styles.subtitle}>
            Fill in your details to start creating and managing events
          </Text>

          <View style={styles.form}>
            <GlassInput
              placeholder="Company/Organization Name *"
              value={formData.companyName}
              onChangeText={(text) => setFormData({ ...formData, companyName: text })}
            />

            <View>
              <GlassInput
                placeholder="Contact Email *"
                value={formData.contactEmail}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <GlassInput
              placeholder="Contact Phone"
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              keyboardType="phone-pad"
            />

            <GlassInput
              placeholder="Website (optional)"
              value={formData.website}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              autoCapitalize="none"
            />

            <GlassInput
              placeholder="Bio/Description"
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              numberOfLines={4}
            />

            <GlassInput
              placeholder="Password *"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              autoCapitalize="none"
            />

            <GlassInput
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.sectionTitle}>Business Verification Documents</Text>
            <Text style={styles.sectionSubtitle}>
              Upload business registration, tax clearance, or other verification documents (optional but recommended for faster approval)
            </Text>
            
            <TouchableOpacity
              onPress={pickDocument}
              activeOpacity={0.8}
              style={styles.documentButton}
              disabled={uploadingDocs}
            >
              <Text style={styles.documentButtonText}>
                {uploadingDocs ? "Uploading..." : "📄 Upload Documents"}
              </Text>
            </TouchableOpacity>

            {documents.length > 0 && (
              <View style={styles.documentsList}>
                <Text style={styles.documentsTitle}>Uploaded Documents:</Text>
                {documents.map((doc, index) => (
                  <View key={index} style={styles.documentItem}>
                    <Text style={styles.documentName}>✓ Document {index + 1}</Text>
                    <TouchableOpacity onPress={() => removeDocument(index)}>
                      <Text style={styles.documentRemove}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.note}>
              * Required fields. Your account will be reviewed before you can publish events.
            </Text>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              style={[styles.button, registerMutation.isPending && styles.buttonDisabled]}
              disabled={registerMutation.isPending}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a5a", "#dd4a4a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                {registerMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>SUBMIT APPLICATION</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <BackButton />
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#E0E0E0",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  note: {
    fontSize: 12,
    color: "#B0B0B0",
    fontStyle: "italic",
    marginTop: 8,
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
  },
  button: {
    borderRadius: 25,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#B0B0B0",
    marginBottom: 12,
    lineHeight: 18,
  },
  documentButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  documentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  documentsList: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  documentsTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  documentName: {
    color: "#E0E0E0",
    fontSize: 14,
  },
  documentRemove: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
  },
});
