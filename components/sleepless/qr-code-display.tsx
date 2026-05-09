import { View, Text, StyleSheet } from "react-native";
import { generateQRPattern, generateVerificationHash } from "@/lib/qr-generator";

interface QRCodeDisplayProps {
  ticketCode: string;
  eventId: string;
  size?: number;
}

export function QRCodeDisplay({ ticketCode, eventId, size = 140 }: QRCodeDisplayProps) {
  const pattern = generateQRPattern(ticketCode, 9);
  const verificationHash = generateVerificationHash(ticketCode, eventId);
  const cellSize = Math.floor((size - 16) / pattern.length);

  return (
    <View style={[styles.container, { width: size, height: size + 24 }]}>
      <View style={[styles.qrContainer, { width: size, height: size }]}>
        <View style={styles.patternContainer}>
          {pattern.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((filled, colIndex) => (
                <View
                  key={colIndex}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    filled && styles.cellFilled,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
        {/* Center logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>S</Text>
        </View>
      </View>
      <Text style={styles.hashText}>{verificationHash}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  qrContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 8,
    position: "relative",
  },
  patternContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    backgroundColor: "#ffffff",
  },
  cellFilled: {
    backgroundColor: "#1a1a2e",
  },
  logoContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    backgroundColor: "#ff6b6b",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  hashText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
    marginTop: 8,
    letterSpacing: 1,
  },
});
