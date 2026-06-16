import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientBackground, HomeButton, BackButton } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";
import { LinearGradient } from "expo-linear-gradient";

export default function PaymentScreen() {
  const { eventId, quantity, ticketTypeId, ticketTypeName } = useLocalSearchParams<{
    eventId: string;
    quantity: string;
    ticketTypeId?: string;
    ticketTypeName?: string;
  }>();

  const { data: event, isLoading } = trpc.events.getById.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );

  const payfastUrlMutation = trpc.payfast.getUrl.useMutation();
  const [isProcessing, setIsProcessing] = useState(false);

  const qty = parseInt(quantity || "1", 10);

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 100 }} />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (!event) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Event not found</Text>
          <BackButton />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const unitPrice = event.price;
  const subtotal = unitPrice * qty;
  const serviceFee = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + serviceFee;

  const handlePayment = async () => {
    console.log('handlePayment called');
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const transactionId = `SLP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { url } = await payfastUrlMutation.mutateAsync({
        eventId: event.id,
        eventName: event.title,
        quantity: qty,
        totalAmount: grandTotal,
        transactionId,
      });
      if (Platform.OS === "web") {
        window.location.href = url;
      } else {
        const WebBrowser = await import("expo-web-browser");
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (err) {
      console.error("PayFast error:", err);
      Platform.OS === "web"
        ? window.alert("Could not open payment gateway. Please try again.")
        : Alert.alert("Error", "Could not open payment gateway. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>Checkout</Text>
            <HomeButton />
          </View>

          {/* Order Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Summary</Text>
            <Text style={styles.eventName}>{event.title}</Text>
            <Text style={styles.eventMeta}>📅 {new Date(event.eventDate).toLocaleDateString("en-ZA")}</Text>
            <Text style={styles.eventMeta}>📍 {event.venue}, {event.city}</Text>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Ticket Price</Text>
              <Text style={styles.rowValue}>R{unitPrice}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Quantity</Text>
              <Text style={styles.rowValue}>{qty}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Subtotal</Text>
              <Text style={styles.rowValue}>R{subtotal}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Service Fee (5%)</Text>
              <Text style={styles.rowValue}>R{serviceFee}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R{grandTotal}</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Method</Text>
            <View style={styles.payfastRow}>
              <Text style={styles.payfastIcon}>🔒</Text>
              <View style={styles.payfastInfo}>
                <Text style={styles.payfastName}>PayFast — Secure Checkout</Text>
                <Text style={styles.payfastDesc}>Card, EFT, SnapScan, Zapper & more</Text>
              </View>
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            onPress={handlePayment}
            disabled={isProcessing}
            activeOpacity={0.85}
            style={styles.payButtonWrapper}
            {...(Platform.OS === "web" ? { onClick: handlePayment } : {})}
          >
            <LinearGradient
              colors={isProcessing ? ["#888", "#666"] : ["#ff6b6b", "#ee5a5a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payButton}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>Pay R{grandTotal} via PayFast</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.secureNote}>🔒 Secured by PayFast. You will be redirected to complete payment.</Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  errorText: { color: "#fff", textAlign: "center", marginTop: 100 },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardTitle: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
  eventName: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  eventMeta: { color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 4 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rowLabel: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  rowValue: { color: "#fff", fontSize: 14 },
  totalLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
  totalValue: { color: "#ff6b6b", fontSize: 18, fontWeight: "700" },
  payfastRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  payfastIcon: { fontSize: 24 },
  payfastInfo: { flex: 1 },
  payfastName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  payfastDesc: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 2 },
  payButtonWrapper: { borderRadius: 14, overflow: "hidden", marginTop: 8 },
  payButton: { padding: 18, alignItems: "center", justifyContent: "center" },
  payButtonText: { color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: 0.5 },
  secureNote: { color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", marginTop: 16 },
});
