import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GradientBackground,
  SleeplessLogo,
  GlassInput,
  GlassButton,
  Avatar,
  SocialLoginButton,
} from "@/components/sleepless";
import { useAuth } from "@/lib/auth-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const { login, loginWithGoogle, loginWithApple } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", result.error ?? "Invalid credentials");
      }
    } catch {
      Alert.alert("Error", "Login failed. Please try again.");
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
        Alert.alert("Error", "Google sign-in failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Google sign-in failed. Please try again.");
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
        Alert.alert("Error", "Apple sign-in failed. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Apple sign-in failed. Please try again.");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleCreateAccount = () => {
    router.navigate("/register" as any);
  };

  const handleOrganizerPortal = () => {
    router.push("/organizer" as any);
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
              <SleeplessLogo size="large" />
            </View>

            <View style={styles.avatarContainer}>
              <Avatar size={100} />
            </View>

            <View style={styles.form}>
              <GlassInput
                icon="person"
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
                icon="lock"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <View style={styles.buttonContainer}>
                <GlassButton
                  title="LOGIN"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={isAnyLoading}
                />
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
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

              <Text style={styles.orText}>
                Don't have an account?{" "}
                <Text style={styles.linkText} onPress={handleCreateAccount}>
                  Create one
                </Text>
              </Text>

              <Text style={styles.organizerText}>
                Are you an event organizer?{" "}
                <Text style={styles.organizerLink} onPress={handleOrganizerPortal}>
                  Access Organizer Portal
                </Text>
              </Text>
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
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  inputSpacing: {
    height: 16,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    paddingHorizontal: 16,
  },
  socialContainer: {
    gap: 12,
  },
  orText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
  },
  linkText: {
    color: "#ff6b6b",
    fontWeight: "600",
  },
  organizerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  organizerLink: {
    color: "#ff6b81",
    fontWeight: "600",
  },
});
