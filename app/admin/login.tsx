import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, GlassInput } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@sleeplessapp.co.za");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.admin.login.useMutation();

  const saveSession = async (data: object) => {
    const value = JSON.stringify(data);
    if (Platform.OS === "web") {
      window.localStorage.setItem("admin_session", value);
    } else {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      Platform.OS === "web" ? localStorage.setItem("admin_session", value) : (await import("@react-native-async-storage/async-storage")).default.setItem("admin_session", value);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success) {
        await saveSession({ email: result.email, adminId: result.adminId, loggedIn: true });
        router.replace("/admin/dashboard" as any);
      } else {
        Alert.alert("Error", result.error ?? "Invalid credentials");
      }
    } catch {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <ScreenContainer>
        <View style={styles.container}>
          <Text style={styles.title}>Admin Portal</Text>
          <Text style={styles.subtitle}>Sign in to manage events and organizers</Text>

          <View style={styles.form}>
            <GlassInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <GlassInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>LOGIN</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back to App</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  subtitle: { color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", marginBottom: 40 },
  form: { gap: 16, marginBottom: 32 },
  button: { backgroundColor: "#FF6B6B", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 1 },
  back: { color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 14 },
});
