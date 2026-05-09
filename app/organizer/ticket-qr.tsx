import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground } from "@/components/sleepless";

export default function TicketQR() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bookingId = params.bookingId as string;
  const eventTitle = params.eventTitle as string;
  const quantity = params.quantity as string;

  // Generate QR code data
  const qrData = JSON.stringify({
    bookingId,
    eventTitle,
    quantity,
    timestamp: Date.now(),
  });

  return (
    <GradientBackground>
      <ScreenContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Ticket QR Code</Text>
            <Text style={styles.subtitle}>Show this at event entry</Text>
          </View>

          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrData}
                size={250}
                backgroundColor="white"
                color="black"
              />
            </View>

            <View style={styles.ticketInfo}>
              <Text style={styles.ticketLabel}>Booking ID</Text>
              <Text style={styles.ticketValue}>#{bookingId}</Text>
            </View>

            <View style={styles.ticketInfo}>
              <Text style={styles.ticketLabel}>Event</Text>
              <Text style={styles.ticketValue}>{eventTitle}</Text>
            </View>

            <View style={styles.ticketInfo}>
              <Text style={styles.ticketLabel}>Tickets</Text>
              <Text style={styles.ticketValue}>{quantity}</Text>
            </View>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>📱 Instructions</Text>
            <Text style={styles.instructionsText}>
              • Present this QR code at the event entrance{"\n"}
              • Organizer will scan to validate your ticket{"\n"}
              • Keep your phone brightness high for easy scanning
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back to Bookings</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  qrContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 32,
  },
  qrWrapper: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  ticketInfo: {
    width: "100%",
    marginBottom: 12,
    alignItems: "center",
  },
  ticketLabel: {
    fontSize: 12,
    color: "#E0E0E0",
    marginBottom: 4,
  },
  ticketValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  instructions: {
    backgroundColor: "rgba(33, 150, 243, 0.2)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.3)",
    marginBottom: 32,
    width: "100%",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#E0E0E0",
    lineHeight: 22,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
