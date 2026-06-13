import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import {
  GradientBackground,
  EventsHeader,
  HomeButton,
  BackButton,
  GlassButton,
} from "@/components/sleepless";
import { useBookings } from "@/lib/bookings-context";
import { useAuth } from "@/hooks/use-auth";
import { PaymentService, PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-service";
import { trpc } from "@/lib/trpc";
import { generateQRPayload } from "@/lib/qr-generator";

export default function PaymentScreen() {
  const { eventId, quantity, ticketTypeId, ticketTypeName } = useLocalSearchParams<{
    eventId: string;
    quantity: string;
    ticketTypeId?: string;
    ticketTypeName?: string;
  }>();

  const { data: event, isLoading: eventLoading } = trpc.events.getById.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );

  const qty = parseInt(quantity || "1", 10);
  const { addBooking } = useBookings();
  const { user } = useAuth();
  const createBookingMutation = trpc.bookings.create.useMutation();
  const payfastUrlMutation = trpc.payfast.getUrl.useMutation();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (eventLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 100 }} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (!event) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={styles.errorText}>Event not found</Text>
            <View style={styles.footer}>
              <BackButton />
              <HomeButton />
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // DB prices are in Rands
  const unitPriceCents = event.price * 100;
  const totalAmount = unitPriceCents * qty;
  const serviceFee = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + serviceFee;
  const formatR = (cents: number) => `R${(cents / 100).toFixed(0)}`;

  const handleMethodSelect = (method: PaymentMethod) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedMethod(method);
  };

  const handlePayment = async () => {
    // PayFast handles all payment validation

    setIsProcessing(true);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const transactionId = `SLP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
      
      const { url } = await payfastUrlMutation.mutateAsync({
        eventId: event.id,
        eventName: event.title,
        quantity: qty,
        totalAmount: grandTotal / 100,
        transactionId,
      });

      const paymentResult = { success: true, transactionId };
      
      // Redirect to PayFast
      window.location.href = url;
      return;

      if (!paymentResult.success || !paymentResult.transactionId) {
        Alert.alert("Payment Failed", paymentResult.error || "Please try again.");
        return;
      }

      // Generate QR code data for this booking
      const qrData = generateQRPayload({
        ticketCode: paymentResult.transactionId,
        eventId: event.id,
        eventName: event.title,
        eventDate: new Date(event.eventDate).toLocaleDateString('en-ZA'),
        quantity: qty,
        transactionId: paymentResult.transactionId,
        timestamp: Date.now(),
      });

      // Persist booking to the database and trigger confirmation email
      const numericEventId = event.id;
      const numericUserId = user?.id ?? 0;
      const numericTicketTypeId = ticketTypeId ? parseInt(ticketTypeId, 10) : undefined;

      const serverResult = await createBookingMutation.mutateAsync({
        userId: numericUserId,
        userEmail: user?.email ?? "",
        eventId: numericEventId,
        ticketTypeId: numericTicketTypeId,
        ticketTypeName: ticketTypeName ?? undefined,
        quantity: qty,
        totalAmount: grandTotal,
        paymentMethod: selectedMethod,
        transactionId: paymentResult.transactionId,
        qrCode: qrData,
      });

      if (!serverResult.success) {
        // Payment went through but booking failed — surface a clear message
        Alert.alert(
          "Booking Error",
          serverResult.error ?? "Your payment was processed but we couldn't save your ticket. Please contact support with your transaction ID: " + paymentResult.transactionId
        );
        return;
      }

      // Also keep local AsyncStorage copy so My Bookings works offline
      await addBooking({
        eventId: String(event.id),
        eventName: event.title,
        eventDate: new Date(event.eventDate).toLocaleDateString("en-ZA"),
        eventTime: event.eventTime,
        eventVenue: event.venue,
        quantity: qty,
        totalPrice: grandTotal,
        transactionId: paymentResult.transactionId,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.replace(
        `/events/booking-confirmation?eventId=${eventId}&transactionId=${paymentResult.transactionId}&quantity=${qty}&total=${grandTotal}` as any
      );
    } catch (error) {
      Alert.alert("Error", "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EventsHeader />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Payment</Text>

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{event.title}</Text>
                <Text style={styles.summaryValue}>R{event.price} × {qty}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>R{(totalAmount/100).toFixed(0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service Fee (5%)</Text>
                <Text style={styles.summaryValue}>R{(serviceFee/100).toFixed(0)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R{(grandTotal/100).toFixed(0)}</Text>
              </View>
            </View>

            {/* Payment Method - PayFast only */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={[styles.methodCard, styles.methodCardSelected]}>
              <MaterialIcons name="lock" size={24} color="#ff6b6b" />
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>PayFast</Text>
                <Text style={styles.methodDesc}>Card, EFT, SnapScan & more</Text>
              </View>
              <MaterialIcons name="check-circle" size={20} color="#ff6b6b" />
            </View>

            {/* Card Form (only show for card payment) */}
            {selectedMethod === "card" && (
              <View style={styles.cardForm}>
                <Text style={styles.sectionTitle}>Card Details</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(PaymentService.formatCardNumber(text))}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={expiry}
                      onChangeText={(text) => setExpiry(PaymentService.formatExpiry(text))}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={{ width: 16 }} />
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* EFT Info */}
            {selectedMethod === "eft" && (
              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={20} color="#ff6b6b" />
                <Text style={styles.infoText}>
                  You will be redirected to your bank's secure payment page to complete the EFT payment.
                </Text>
              </View>
            )}

            {/* Wallet Info */}
            {selectedMethod === "wallet" && (
              <View style={styles.infoCard}>
                <MaterialIcons name="qr-code" size={20} color="#ff6b6b" />
                <Text style={styles.infoText}>
                  A QR code will be generated for you to scan with your SnapScan or Zapper app.
                </Text>
              </View>
            )}

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <MaterialIcons name="lock" size={16} color="#4ade80" />
              <Text style={styles.securityText}>Secure 256-bit SSL encryption</Text>
            </View>

            {/* Pay Button */}
            <View style={styles.buttonContainer}>
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#ff6b6b" />
                  <Text style={styles.processingText}>Processing payment...</Text>
                </View>
              ) : (
                <GlassButton
                  title={`Pay R${(grandTotal/100).toFixed(0)}`}
                  onPress={handlePayment}
                  variant="primary"
                />
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <BackButton />
            <HomeButton />
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  summaryTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 8,
  },
  totalLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  methodsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  methodCardSelected: {
    borderColor: "#ff6b6b",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  methodDesc: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#ff6b6b",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff6b6b",
  },
  cardForm: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  rowInputs: {
    flexDirection: "row",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    lineHeight: 18,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  },
  securityText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
  buttonContainer: {
    alignItems: "center",
  },
  processingContainer: {
    alignItems: "center",
    gap: 12,
  },
  processingText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
});
