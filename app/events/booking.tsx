import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, Platform, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import {
  GradientBackground,
  HomeButton,
  BackButton,
  GlassButton,
} from "@/components/sleepless";
import { useBookings } from "@/lib/bookings-context";
import { trpc } from "@/lib/trpc";

export default function BookingScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { addBooking, hasBookedEvent } = useBookings();
  
  // Fetch event from database
  const { data: event, isLoading } = trpc.events.getById.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );

  // Fetch ticket types for this event
  const { data: ticketTypes } = trpc.ticketTypes.getByEventId.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );
  
  const [ticketCount, setTicketCount] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [ticketCode, setTicketCode] = useState("");

  const alreadyBooked = event ? hasBookedEvent(String(event.id)) : false;

  // Get selected ticket type details
  const selectedType = ticketTypes?.find(tt => tt.id === selectedTicketType);
  const hasMultipleTypes = ticketTypes && ticketTypes.length > 0;
  
  // Calculate price based on selected ticket type or event base price
  const unitPrice = selectedType ? selectedType.price / 100 : (event?.price || 0);
  const maxTickets = selectedType ? Math.min(selectedType.maxPerOrder, selectedType.quantity - selectedType.sold) : 10;

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
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

  const totalPrice = unitPrice * ticketCount;
  const serviceFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + serviceFee;

  const handleIncrement = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (ticketCount < maxTickets) {
      setTicketCount(ticketCount + 1);
    }
  };

  const handleDecrement = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const handlePurchase = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Validate ticket type selection if multiple types exist
    if (hasMultipleTypes && !selectedTicketType) {
      Alert.alert("Select Ticket Type", "Please select a ticket type before proceeding.");
      return;
    }
    // Navigate to payment screen with ticket type info
    const params = `eventId=${event!.id}&quantity=${ticketCount}&ticketTypeId=${selectedTicketType || ''}&unitPrice=${unitPrice}`;
    router.push(`/events/payment?${params}` as any);
  };

  const handleSelectTicketType = (typeId: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTicketType(typeId);
    setTicketCount(1); // Reset count when changing type
  };

  if (bookingComplete) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <MaterialIcons name="check-circle" size={80} color="#4ade80" />
                </View>
                <Text style={styles.successTitle}>Booking Confirmed!</Text>
                <Text style={styles.successSubtitle}>Your tickets are ready</Text>

                <View style={styles.ticketCard}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketEventName}>{event.title}</Text>
                    <View style={styles.ticketBadge}>
                      <Text style={styles.ticketBadgeText}>{ticketCount} Ticket{ticketCount > 1 ? "s" : ""}</Text>
                    </View>
                  </View>

                  <View style={styles.ticketDetails}>
                    <View style={styles.ticketRow}>
                      <MaterialIcons name="event" size={18} color="#ff6b6b" />
                      <Text style={styles.ticketDetailText}>{new Date(event.eventDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.ticketRow}>
                      <MaterialIcons name="access-time" size={18} color="#ff6b6b" />
                      <Text style={styles.ticketDetailText}>{event.eventTime}</Text>
                    </View>
                    <View style={styles.ticketRow}>
                      <MaterialIcons name="location-on" size={18} color="#ff6b6b" />
                      <Text style={styles.ticketDetailText}>{event.venue}</Text>
                    </View>
                  </View>

                  <View style={styles.ticketCodeContainer}>
                    <Text style={styles.ticketCodeLabel}>Ticket Code</Text>
                    <Text style={styles.ticketCode}>{ticketCode}</Text>
                  </View>

                  <View style={styles.qrPlaceholder}>
                    <MaterialIcons name="qr-code-2" size={100} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.qrText}>Show this at entry</Text>
                  </View>
                </View>

                <Text style={styles.confirmationNote}>
                  A confirmation has been saved to your bookings. Show the ticket code at the venue entrance.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <GlassButton
                title="View My Bookings"
                onPress={() => router.push("/events/my-bookings" as any)}
                variant="primary"
                style={styles.viewBookingsButton}
              />
            </View>
            <View style={styles.footerNav}>
              <HomeButton />
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (alreadyBooked) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.alreadyBookedContainer}>
              <MaterialIcons name="confirmation-number" size={64} color="#ff6b6b" />
              <Text style={styles.alreadyBookedTitle}>Already Booked!</Text>
              <Text style={styles.alreadyBookedText}>
                You already have tickets for this event.
              </Text>
              <GlassButton
                title="View My Bookings"
                onPress={() => router.push("/events/my-bookings" as any)}
                variant="primary"
                style={styles.viewBookingsButton}
              />
            </View>
            <View style={styles.footer}>
              <BackButton />
              <HomeButton />
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="confirmation-number" size={24} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>Book Tickets</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Event Summary */}
            <View style={styles.eventSummary}>
              <Image source={{ uri: event.posterUrl }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{event.title}</Text>
                <Text style={styles.eventDetail}>{new Date(event.eventDate).toLocaleDateString()}</Text>
                <Text style={styles.eventDetail}>{event.venue}</Text>
                <Text style={styles.eventPrice}>
                  {hasMultipleTypes 
                    ? (selectedType ? `R${unitPrice} per ticket` : "Select ticket type")
                    : `R${event.price} per ticket`}
                </Text>
              </View>
            </View>

            {/* Ticket Type Selector */}
            {hasMultipleTypes && (
              <View style={styles.ticketTypeSelector}>
                <Text style={styles.sectionTitle}>Select Ticket Type</Text>
                {ticketTypes.map((tt) => {
                  const isSelected = selectedTicketType === tt.id;
                  const isSoldOut = tt.quantity - tt.sold <= 0;
                  return (
                    <TouchableOpacity
                      key={tt.id}
                      style={[
                        styles.ticketTypeOption,
                        isSelected && styles.ticketTypeOptionSelected,
                        isSoldOut && styles.ticketTypeOptionDisabled,
                      ]}
                      onPress={() => !isSoldOut && handleSelectTicketType(tt.id)}
                      disabled={isSoldOut}
                    >
                      <View style={styles.ticketTypeRadio}>
                        {isSelected && <View style={styles.ticketTypeRadioInner} />}
                      </View>
                      <View style={styles.ticketTypeInfo}>
                        <Text style={[styles.ticketTypeName, isSoldOut && styles.ticketTypeTextDisabled]}>
                          {tt.name}
                        </Text>
                        {tt.description && (
                          <Text style={styles.ticketTypeDesc}>{tt.description}</Text>
                        )}
                        <Text style={styles.ticketTypeAvail}>
                          {isSoldOut ? "Sold Out" : `${tt.quantity - tt.sold} available`}
                        </Text>
                      </View>
                      <Text style={[styles.ticketTypePrice, isSoldOut && styles.ticketTypeTextDisabled]}>
                        R{(tt.price / 100).toFixed(0)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Ticket Selector */}
            <View style={styles.ticketSelector}>
              <Text style={styles.sectionTitle}>Number of Tickets</Text>
              <View style={styles.counterContainer}>
                <Pressable
                  onPress={handleDecrement}
                  style={({ pressed }) => [styles.counterButton, pressed && styles.pressed, ticketCount <= 1 && styles.counterDisabled]}
                  disabled={ticketCount <= 1}
                >
                  <MaterialIcons name="remove" size={24} color={ticketCount <= 1 ? "rgba(255,255,255,0.3)" : "#ffffff"} />
                </Pressable>
                <Text style={styles.counterValue}>{ticketCount}</Text>
                <Pressable
                  onPress={handleIncrement}
                  style={({ pressed }) => [styles.counterButton, pressed && styles.pressed, ticketCount >= 10 && styles.counterDisabled]}
                  disabled={ticketCount >= 10}
                >
                  <MaterialIcons name="add" size={24} color={ticketCount >= 10 ? "rgba(255,255,255,0.3)" : "#ffffff"} />
                </Pressable>
              </View>
            </View>

            {/* Price Breakdown */}
            <View style={styles.priceBreakdown}>
              <Text style={styles.sectionTitle}>Price Summary</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tickets ({ticketCount} × R{unitPrice})</Text>
                <Text style={styles.priceValue}>R{totalPrice}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service Fee (5%)</Text>
                <Text style={styles.priceValue}>R{serviceFee}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R{grandTotal}</Text>
              </View>
            </View>

            {/* Payment Info */}
            <View style={styles.paymentInfo}>
              <MaterialIcons name="info-outline" size={18} color="#ff6b6b" />
              <Text style={styles.paymentInfoText}>
                This is a demo booking. No actual payment will be processed.
              </Text>
            </View>
          </ScrollView>

          {/* Purchase Button */}
          <View style={styles.purchaseContainer}>
            <GlassButton
              title={isProcessing ? "Processing..." : `Pay R${grandTotal}`}
              onPress={handlePurchase}
              variant="primary"
              disabled={isProcessing}
              style={styles.purchaseButton}
            />
          </View>

          <View style={styles.footerNav}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 12,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  eventSummary: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  eventImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  eventName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  eventDetail: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    marginBottom: 2,
  },
  eventPrice: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  ticketSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  counterDisabled: {
    opacity: 0.5,
  },
  counterValue: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "center",
  },
  priceBreakdown: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  priceValue: {
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
    fontWeight: "700",
  },
  totalValue: {
    color: "#ff6b6b",
    fontSize: 20,
    fontWeight: "700",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  paymentInfoText: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  purchaseContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  purchaseButton: {
    width: "100%",
  },
  footerNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  // Success screen styles
  successContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  successSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    marginBottom: 24,
  },
  ticketCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 16,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketEventName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  ticketBadge: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  ticketDetails: {
    gap: 8,
    marginBottom: 16,
  },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ticketDetailText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  ticketCodeContainer: {
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  ticketCodeLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginBottom: 4,
  },
  ticketCode: {
    color: "#ff6b6b",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 2,
  },
  qrPlaceholder: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  qrText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 8,
  },
  confirmationNote: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  viewBookingsButton: {
    marginTop: 16,
    minWidth: 200,
  },
  // Already booked styles
  alreadyBookedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  alreadyBookedTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  alreadyBookedText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  // Ticket Type Selector styles
  ticketTypeSelector: {
    marginBottom: 20,
  },
  ticketTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  ticketTypeOptionSelected: {
    borderColor: "#ff6b6b",
    backgroundColor: "rgba(255, 107, 107, 0.15)",
  },
  ticketTypeOptionDisabled: {
    opacity: 0.5,
  },
  ticketTypeRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ticketTypeRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff6b6b",
  },
  ticketTypeInfo: {
    flex: 1,
  },
  ticketTypeName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  ticketTypeDesc: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginBottom: 4,
  },
  ticketTypeAvail: {
    color: "#4ade80",
    fontSize: 12,
  },
  ticketTypePrice: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "700",
  },
  ticketTypeTextDisabled: {
    color: "rgba(255, 255, 255, 0.4)",
  },
});
