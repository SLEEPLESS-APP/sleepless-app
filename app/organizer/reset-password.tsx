import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, SleeplessLogo, GlassInput } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetMutation = trpc.organizer.resetPassword.useMutation();

  const handleSubmit = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Invalid reset token");
      return;
    }

    try {
      await resetMutation.mutateAsync({
        token,
        newPassword: password,
      });

      Alert.alert(
        "Success",
        "Your password has been reset successfully",
        [
          {
            text: "OK",
            onPress: () => router.replace("/organizer/login" as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reset password");
    }
  };

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <SleeplessLogo size="medium" />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below.
          </Text>

          <View style={styles.form}>
            <GlassInput
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <GlassInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, resetMutation.isPending && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={resetMutation.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {resetMutation.isPending ? "RESETTING..." : "RESET PASSWORD"}
              </Text>
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
});
