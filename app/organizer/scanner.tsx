import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientBackground, BackButton } from "@/components/sleepless";
import { useOrganizer } from "@/lib/organizer-context";
import { trpc } from "@/lib/trpc";

type ScanResult = {
  status: "valid" | "already_used" | "not_found" | "wrong_event";
  eventTitle?: string;
  booking?: any;
} | null;

export default function ScannerScreen() {
  const { organizer } = useOrganizer();
  const validateMutation = trpc.scanner.validateTicket.useMutation();
  const [result, setResult] = useState<ScanResult>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const lastScanRef = useRef<string>("");

  const decodePayload = (raw: string): string | null => {
    const trimmed = (raw || "").trim();
    // Case 1: raw value is already a transaction ID or booking ref
    if (trimmed.startsWith("SLP-")) return trimmed;
    if (/^SLEEPLESS-BOOKING-\d+$/i.test(trimmed)) return trimmed;
    // Case 2: base64-encoded JSON with transactionId in field "x" or "t"
    try {
      const json = JSON.parse(atob(trimmed));
      return json.x || json.t || null;
    } catch {
      return null;
    }
  };

  const handleScan = async (decodedText: string) => {
    if (!organizer) return;
    if (decodedText === lastScanRef.current) return; // debounce duplicate scans
    lastScanRef.current = decodedText;

    const transactionId = decodePayload(decodedText);
    if (!transactionId) {
      setResult({ status: "not_found" });
      setTimeout(() => { lastScanRef.current = ""; }, 3000);
      return;
    }

    try {
      const res = await validateMutation.mutateAsync({ transactionId, organizerId: organizer.id });
      setResult(res as ScanResult);
    } catch {
      setResult({ status: "not_found" });
    }
    // Allow re-scanning after 3 seconds
    setTimeout(() => { lastScanRef.current = ""; setResult(null); }, 4000);
  };

  const startScanner = async () => {
    if (Platform.OS !== "web") {
      setCameraError("Scanner currently works in the web app. Open sleeplessapp.co.za on your phone browser.");
      return;
    }
    setCameraError(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Pick a camera — prefer rear ("back"/"environment") on phones, fall back to any (webcam)
      let cameraConfig: any = { facingMode: "environment" };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const rear = cameras.find((c: any) => /back|rear|environment/i.test(c.label));
          cameraConfig = { deviceId: { exact: (rear ?? cameras[0]).id } };
        }
      } catch {}

      await scanner.start(
        cameraConfig,
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        (decodedText: string) => handleScan(decodedText),
        () => {} // ignore per-frame errors
      );
    } catch (err: any) {
      setCameraError("Could not access camera. Please allow camera permissions and try again.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const resultColor = result?.status === "valid" ? "#22c55e"
    : result?.status === "already_used" ? "#f59e0b"
    : "#ef4444";

  const resultText = result?.status === "valid" ? "✅ VALID — Admit"
    : result?.status === "already_used" ? "⚠️ ALREADY USED"
    : result?.status === "wrong_event" ? "❌ WRONG EVENT"
    : "❌ INVALID TICKET";

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton />
            <Text style={styles.title}>Ticket Scanner</Text>
            <View style={{ width: 40 }} />
          </View>

          {!organizer && (
            <Text style={styles.warn}>You must be logged in as an organizer to scan tickets.</Text>
          )}

          {/* Camera viewport */}
          <View style={styles.scannerBox}>
            {Platform.OS === "web" ? (
              // @ts-ignore - web div for html5-qrcode
              <div id="qr-reader" style={{ width: "100%", minHeight: 300, borderRadius: 16, overflow: "hidden" }} />
            ) : (
              <Text style={styles.warn}>Open in browser to scan.</Text>
            )}
          </View>

          {cameraError && <Text style={styles.error}>{cameraError}</Text>}

          {/* Result banner */}
          {result && (
            <View style={[styles.resultBanner, { backgroundColor: resultColor }]}>
              <Text style={styles.resultText}>{resultText}</Text>
              {result.eventTitle && <Text style={styles.resultSub}>{result.eventTitle}</Text>}
              {result.booking && result.status === "valid" && (
                <Text style={styles.resultSub}>{result.booking.quantity} ticket(s) · Booking #{result.booking.id}</Text>
              )}
              {result.status === "already_used" && result.booking?.checkedInAt && (
                <Text style={styles.resultSub}>Checked in at {new Date(result.booking.checkedInAt).toLocaleString("en-ZA")}</Text>
              )}
            </View>
          )}

          {/* Controls */}
          {!scanning ? (
            <TouchableOpacity style={styles.button} onPress={startScanner} disabled={!organizer}>
              <Text style={styles.buttonText}>📷 Start Scanning</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopScanner}>
              <Text style={styles.buttonText}>⏹ Stop Scanner</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>Point the camera at a customer's ticket QR code. Valid tickets are checked in automatically and can't be reused.</Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { color: "#fff", fontSize: 20, fontWeight: "700" },
  warn: { color: "#fbbf24", textAlign: "center", marginVertical: 12 },
  error: { color: "#ef4444", textAlign: "center", marginVertical: 12 },
  scannerBox: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  resultBanner: { padding: 20, borderRadius: 14, alignItems: "center", marginTop: 20 },
  resultText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  resultSub: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 6 },
  button: { backgroundColor: "#ff6b6b", padding: 18, borderRadius: 14, alignItems: "center", marginTop: 20 },
  stopButton: { backgroundColor: "#444" },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  hint: { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", marginTop: 20, lineHeight: 19 },
});
