import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, GlassInput, BackButton } from "@/components/sleepless";
import { LinearGradient } from "expo-linear-gradient";
import { trpc } from "@/lib/trpc";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.admin.login.useMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success) {
        await AsyncStorage.setItem(
          "admin_session",
          JSON.stringify({ email: result.email, adminId: result.adminId, loggedIn: true })
        );
        router.replace("/admin/dashboard" as any);
      } else {
        Alert.alert("Error", result.error ?? "Invalid admin credentials");
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
              placeholder="Admin Email"
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
              onPress={handleLogin}
              activeOpacity={0.8}
              style={styles.button}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a5a", "#dd4a4a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>LOGIN</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backLinkText}>← Back to App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  backLink: {
    marginTop: 16,
    alignItems: "center",
  },
  backLinkText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
});
