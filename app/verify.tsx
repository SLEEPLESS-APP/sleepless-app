import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientBackground, SleeplessLogo } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

export default function VerifyScreen() {
  const { token, type } = useLocalSearchParams<{ token: string; type: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const verifyMutation = trpc.verify.email.useMutation();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyMutation.mutateAsync({
      token,
      type: (type === "user" ? "user" : "organizer") as "organizer" | "user",
    })
      .then((res) => setStatus(res.success ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <SleeplessLogo size="large" />

          <View style={styles.card}>
            {status === "loading" && (
              <>
                <ActivityIndicator size="large" color="#ff6b6b" />
                <Text style={styles.title}>Verifying your email...</Text>
              </>
            )}

            {status === "success" && (
              <>
                <Text style={styles.icon}>✅</Text>
                <Text style={styles.title}>Email Verified!</Text>
                <Text style={styles.message}>
                  {type === "user"
                    ? "Your email has been verified. You can now log in and start booking events."
                    : "Your email is verified! Our team will review your organizer application and approve it within 24-48 hours."}
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.replace(type === "user" ? "/" as any : "/organizer/login" as any)}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}

            {status === "error" && (
              <>
                <Text style={styles.icon}>❌</Text>
                <Text style={styles.title}>Verification Failed</Text>
                <Text style={styles.message}>
                  This verification link is invalid or has already been used. Please try registering again or contact support.
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.replace("/" as any)}
                >
                  <Text style={styles.buttonText}>Back to Home</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.footer}>sleeplessapp.co.za</Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 32 },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 16,
  },
  icon: { fontSize: 48 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", textAlign: "center" },
  message: { color: "rgba(255,255,255,0.7)", fontSize: 15, textAlign: "center", lineHeight: 22 },
  button: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: 1 },
});
