import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  GradientBackground,
  GlassInput,
  GlassButton,
  Avatar,
  SocialLoginButton,
} from "@/components/sleepless";
import { useAuth } from "@/lib/auth-context";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const { register, loginWithGoogle, loginWithApple } = useAuth();

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim() || !email.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await register(username, password, email, dob);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", result.error ?? "Registration failed. Please check your details.");
      }
    } catch {
      Alert.alert("Error", "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading("google");
    try {
      const success = await loginWithGoogle();
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Google sign-up failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Google sign-up failed. Please try again.");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setSocialLoading("apple");
    try {
      const success = await loginWithApple();
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Apple sign-up failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Apple sign-up failed. Please try again.");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isAnyLoading = loading || socialLoading !== null;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
              </Pressable>
              <Text style={styles.headerTitle}>Create an account</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.avatarContainer}>
              <Avatar size={80} />
            </View>

            {/* Social Login Options */}
            <View style={styles.socialContainer}>
              <SocialLoginButton
                provider="google"
                onPress={handleGoogleLogin}
                isLoading={socialLoading === "google"}
                disabled={isAnyLoading}
              />
              <SocialLoginButton
                provider="apple"
                onPress={handleAppleLogin}
                isLoading={socialLoading === "apple"}
                disabled={isAnyLoading}
              />
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with email</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.form}>
              <GlassInput
                icon="person"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <View style={styles.inputSpacing} />

              <GlassInput
                icon="lock"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <View style={styles.inputSpacing} />

              <GlassInput
                icon="lock"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <View style={styles.inputSpacing} />

              <GlassInput
                icon="email"
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <View style={styles.inputSpacing} />

              <GlassInput
                icon="cake"
                placeholder="DD/MM/YYYY (optional)"
                value={dob}
                onChangeText={setDob}
                keyboardType="numbers-and-punctuation"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              <View style={styles.buttonContainer}>
                <GlassButton
                  title="Create Account"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={isAnyLoading}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "500",
  },
  placeholder: {
    width: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  socialContainer: {
    gap: 12,
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    paddingHorizontal: 12,
  },
  form: {
    width: "100%",
  },
  inputSpacing: {
    height: 12,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: "center",
  },
});
