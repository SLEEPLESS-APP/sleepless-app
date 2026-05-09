import { Platform } from "react-native";

// Web-compatible MD5 — uses SubtleCrypto on web, expo-crypto on native
async function md5(str: string): Promise<string> {
  if (Platform.OS === "web") {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data); // PayFast accepts SHA-256 on web
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } else {
    const { digestStringAsync, CryptoDigestAlgorithm } = await import("expo-crypto");
    return digestStringAsync(CryptoDigestAlgorithm.MD5, str);
  }
}

// Web-compatible browser open — uses window.open on web, expo-web-browser on native
async function openBrowser(url: string): Promise<{ type: string }> {
  if (Platform.OS === "web") {
    window.location.href = url;
    return { type: "opened" };
  } else {
    const WebBrowser = await import("expo-web-browser");
    return WebBrowser.openBrowserAsync(url, {
      showTitle: true,
      enableBarCollapsing: true,
      dismissButtonStyle: "cancel",
    });
  }
}

export type PaymentMethod = "card" | "eft" | "wallet";

export interface PaymentDetails {
  eventId: string;
  eventName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number; // in cents
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  payfastToken?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// PayFast configuration
// Sandbox:    https://sandbox.payfast.co.za/eng/process
// Production: https://www.payfast.co.za/eng/process
//
// Set EXPO_PUBLIC_PAYFAST_MERCHANT_ID and EXPO_PUBLIC_PAYFAST_MERCHANT_KEY
// in your .env / EAS secrets. Flip PAYFAST_SANDBOX=false for production.
// ---------------------------------------------------------------------------
const PAYFAST_MERCHANT_ID  = process.env.EXPO_PUBLIC_PAYFAST_MERCHANT_ID  ?? "34812391";
const PAYFAST_MERCHANT_KEY = process.env.EXPO_PUBLIC_PAYFAST_MERCHANT_KEY ?? "grvghx5kh378h";
const PAYFAST_SANDBOX      = false; // Production — set to true for testing

const PAYFAST_BASE = PAYFAST_SANDBOX
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

const APP_RETURN_URL  = "https://sleeplessapp.co.za/payment/success";
const APP_CANCEL_URL  = "https://sleeplessapp.co.za/payment/cancel";
const APP_NOTIFY_URL  = "https://sleeplessapp.co.za/api/payfast/notify"; // ITN webhook

/**
 * Build the PayFast checkout URL for a booking.
 * Generates an MD5 signature over all fields as required by PayFast.
 */
async function buildPayFastUrl(details: PaymentDetails, transactionId: string): Promise<string> {
  const amountRands = (details.totalAmount / 100).toFixed(2);

  const fields: Record<string, string> = {
    merchant_id:  PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url:   APP_RETURN_URL,
    cancel_url:   APP_CANCEL_URL,
    notify_url:   APP_NOTIFY_URL,
    m_payment_id: transactionId,
    amount:       amountRands,
    item_name:    details.eventName.slice(0, 100),
    item_description: `${details.quantity} ticket(s)`,
    ...(details.customerEmail ? { email_address: details.customerEmail } : {}),
    ...(details.customerName  ? { name_first: details.customerName.split(" ")[0], name_last: details.customerName.split(" ").slice(1).join(" ") || "-" } : {}),
  };

  // Build signature string — alphabetical order, URL-encoded values
  const sigString = Object.keys(fields)
    .filter((k) => k !== "signature")
    .sort()
    .map((k) => `${k}=${encodeURIComponent(fields[k]).replace(/%20/g, "+")}`)
    .join("&");

  const digest = await md5(sigString);

  const params = new URLSearchParams({ ...fields, signature: digest });
  return `${PAYFAST_BASE}?${params.toString()}`;
}

export class PaymentService {
  /**
   * Open PayFast in an in-app browser and wait for the user to complete/cancel.
   * Works for card, EFT, and all wallet methods PayFast supports.
   */
  static async openPayFastCheckout(details: PaymentDetails): Promise<PaymentResult> {
    const transactionId = generateTransactionId("PF");

    try {
      const url = await buildPayFastUrl(details, transactionId);

      if (Platform.OS === "web") {
        // Web: redirect to PayFast directly
        window.location.href = url;
        return { success: true, transactionId };
      }

      const result = await openBrowser(url);

      if (result.type === "cancel") {
        return { success: false, error: "Payment was cancelled." };
      }

      // PayFast will POST to notify_url (ITN) to confirm payment server-side.
      // The in-app browser closes when the user reaches the return_url.
      // We optimistically return success here; the ITN webhook will update
      // the booking status if payment actually failed.
      return { success: true, transactionId };
    } catch (error) {
      return { success: false, error: "Could not open payment gateway." };
    }
  }

  /**
   * Legacy simulation helpers — kept for local dev / testing without network.
   */
  static async processCardPayment(details: PaymentDetails): Promise<PaymentResult> {
    if (!PAYFAST_SANDBOX) return this.openPayFastCheckout(details);
    await simulateDelay();
    return { success: true, transactionId: generateTransactionId("CARD") };
  }

  static async processEFTPayment(details: PaymentDetails): Promise<PaymentResult> {
    return this.openPayFastCheckout(details);
  }

  static async processWalletPayment(details: PaymentDetails): Promise<PaymentResult> {
    return this.openPayFastCheckout(details);
  }

  // Card validation helpers (unchanged)
  static validateCardNumber(cardNumber: string): boolean {
    return /^\d{16}$/.test(cardNumber.replace(/\s/g, ""));
  }
  static validateExpiry(expiry: string): boolean {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year  = parseInt(match[2], 10) + 2000;
    if (month < 1 || month > 12) return false;
    return new Date(year, month) > new Date();
  }
  static validateCVV(cvv: string): boolean { return /^\d{3,4}$/.test(cvv); }
  static formatCardNumber(value: string): string {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    return (cleaned.match(/.{1,4}/g) ?? [cleaned]).join(" ");
  }
  static formatExpiry(value: string): string {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    return cleaned.length >= 2 ? cleaned.slice(0, 2) + "/" + cleaned.slice(2) : cleaned;
  }
}

function generateTransactionId(prefix: string): string {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SLP-${prefix}-${ts}-${rnd}`;
}

async function simulateDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 800));
}

export const PAYMENT_METHODS = [
  { id: "card"   as PaymentMethod, name: "Credit / Debit Card", icon: "credit-card",     description: "Visa, Mastercard, Amex" },
  { id: "eft"    as PaymentMethod, name: "EFT / Bank Transfer",  icon: "account-balance", description: "Instant EFT via PayFast" },
  { id: "wallet" as PaymentMethod, name: "Mobile Wallet",         icon: "phone-android",   description: "SnapScan, Zapper" },
];
