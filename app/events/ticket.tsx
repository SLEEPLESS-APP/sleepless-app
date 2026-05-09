import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import {
  GradientBackground,
  HomeButton,
  BackButton,
  QRCodeDisplay,
} from "@/components/sleepless";
import { useBookings } from "@/lib/bookings-context";

export default function TicketScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { bookings } = useBookings();
  
  const booking = bookings.find((b) => b.id === bookingId);

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await Share.share({
        message: `🎉 My Sleepless Ticket!\n\n${booking?.eventName}\n📅 ${booking?.eventDate}\n⏰ ${booking?.eventTime}\n📍 ${booking?.eventVenue}\n\nTicket Code: ${booking?.ticketCode}`,
        title: "My Sleepless Ticket",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (!booking) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={styles.errorText}>Ticket not found</Text>
            <View style={styles.footer}>
              <BackButton />
              <HomeButton />
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const isCancelled = booking.status === "cancelled";

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Your Ticket</Text>
              {isCancelled && (
                <View style={styles.cancelledBadge}>
                  <Text style={styles.cancelledText}>CANCELLED</Text>
                </View>
              )}
            </View>

            {/* Ticket Card */}
            <View style={[styles.ticketCard, isCancelled && styles.ticketCardCancelled]}>
              {/* Top Section */}
              <View style={styles.ticketTop}>
                <View style={styles.ticketLogoRow}>
                  <Text style={styles.ticketLogo}>Sleepless</Text>
                  <View style={styles.ticketCountBadge}>
                    <Text style={styles.ticketCountText}>
                      {booking.quantity} Ticket{booking.quantity > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                <Text style={styles.eventName}>{booking.eventName}</Text>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="event" size={18} color="#ff6b6b" />
                    <Text style={styles.detailText}>{booking.eventDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="access-time" size={18} color="#ff6b6b" />
                    <Text style={styles.detailText}>{booking.eventTime}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={18} color="#ff6b6b" />
                    <Text style={styles.detailText}>{booking.eventVenue}</Text>
                  </View>
                </View>
              </View>

              {/* Tear Line */}
              <View style={styles.tearLine}>
                <View style={styles.tearCircleLeft} />
                <View style={styles.tearDashes}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <View key={i} style={styles.tearDash} />
                  ))}
                </View>
                <View style={styles.tearCircleRight} />
              </View>

              {/* QR Section */}
              <View style={styles.qrSection}>
                {!isCancelled ? (
                  <>
                    <QRCodeDisplay
                      ticketCode={booking.ticketCode}
                      eventId={booking.eventId}
                      size={160}
                    />
                    <Text style={styles.scanInstruction}>
                      Show this QR code at the venue entrance
                    </Text>
                  </>
                ) : (
                  <View style={styles.cancelledOverlay}>
                    <MaterialIcons name="cancel" size={80} color="rgba(239, 68, 68, 0.5)" />
                    <Text style={styles.cancelledOverlayText}>Ticket Cancelled</Text>
                  </View>
                )}
              </View>

              {/* Ticket Code */}
              <View style={styles.ticketCodeSection}>
                <Text style={styles.ticketCodeLabel}>Ticket Code</Text>
                <Text style={[styles.ticketCode, isCancelled && styles.ticketCodeCancelled]}>
                  {booking.ticketCode}
                </Text>
              </View>

              {/* Transaction Info */}
              {booking.transactionId && (
                <View style={styles.transactionSection}>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>Transaction</Text>
                    <Text style={styles.transactionValue}>{booking.transactionId}</Text>
                  </View>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>Amount Paid</Text>
                    <Text style={styles.transactionAmount}>R{booking.totalPrice}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Actions */}
            {!isCancelled && (
              <View style={styles.actionsContainer}>
                <Pressable
                  onPress={handleShare}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                >
                  <MaterialIcons name="share" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Share Ticket</Text>
                </Pressable>
              </View>
            )}

            {/* Info Note */}
            <View style={styles.infoNote}>
              <MaterialIcons name="info-outline" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.infoNoteText}>
                {isCancelled
                  ? "This ticket has been cancelled and is no longer valid."
                  : "Please arrive at least 30 minutes before the event starts. Have your ticket ready for scanning."}
              </Text>
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
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  cancelledBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cancelledText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  ticketCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  ticketCardCancelled: {
    opacity: 0.7,
  },
  ticketTop: {
    padding: 20,
    backgroundColor: "rgba(255, 107, 107, 0.08)",
  },
  ticketLogoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ticketLogo: {
    color: "#ff6b6b",
    fontSize: 20,
    fontWeight: "700",
    fontStyle: "italic",
  },
  ticketCountBadge: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ticketCountText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  eventDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  tearLine: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    position: "relative",
  },
  tearCircleLeft: {
    position: "absolute",
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0f0f1a",
  },
  tearCircleRight: {
    position: "absolute",
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0f0f1a",
  },
  tearDashes: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 20,
  },
  tearDash: {
    width: 8,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 1,
  },
  qrSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  scanInstruction: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
  cancelledOverlay: {
    alignItems: "center",
    justifyContent: "center",
    height: 180,
  },
  cancelledOverlayText: {
    color: "rgba(239, 68, 68, 0.8)",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  ticketCodeSection: {
    alignItems: "center",
    paddingBottom: 20,
  },
  ticketCodeLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    marginBottom: 4,
  },
  ticketCode: {
    color: "#ff6b6b",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 3,
  },
  ticketCodeCancelled: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  transactionSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  transactionLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
  },
  transactionValue: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  transactionAmount: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.7,
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  infoNoteText: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    lineHeight: 18,
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
