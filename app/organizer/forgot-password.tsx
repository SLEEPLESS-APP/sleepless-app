import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, SleeplessLogo, GlassInput } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetMutation = trpc.organizer.requestPasswordReset.useMutation();

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      await resetMutation.mutateAsync({ email: email.trim() });
      setIsSubmitted(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email");
    }
  };

  if (isSubmitted) {
    return (
      <GradientBackground>
        <ScreenContainer>
          <ScrollView contentContainerStyle={styles.container}>
            <SleeplessLogo size="medium" />
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>BACK TO LOGIN</Text>
            </TouchableOpacity>
          </ScrollView>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <SleeplessLogo size="medium" />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          <View style={styles.form}>
            <GlassInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <TouchableOpacity
              style={[styles.button, resetMutation.isPending && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={resetMutation.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {resetMutation.isPending ? "SENDING..." : "SEND RESET LINK"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
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
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#E0E0E0",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  button: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#E0E0E0",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
