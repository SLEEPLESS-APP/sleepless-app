import { Platform } from "react-native";

// Web-compatible MD5 — uses SubtleCrypto on web, expo-crypto on native
async function md5(str: string): Promise<string> {
  // Pure JS MD5 implementation for PayFast signature (works on web and native)
  function safeAdd(x: number, y: number) { const lsw=(x&0xFFFF)+(y&0xFFFF); const msw=(x>>16)+(y>>16)+(lsw>>16); return (msw<<16)|(lsw&0xFFFF); }
  function bitRotateLeft(num: number, cnt: number) { return (num<<cnt)|(num>>>(32-cnt)); }
  function md5cmn(q:number,a:number,b:number,x:number,s:number,t:number){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
  function md5gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
  function md5hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(c^(b|(~d)),a,b,x,s,t);}
  function md5blk(s:string){const md5blks:number[]=[],length=s.length;for(let i=0;i<64*Math.ceil((length+9)/64);i+=4){const j=i*8;md5blks[i>>2]=((s.charCodeAt(j)||0))+((s.charCodeAt(j+1)||0)<<8)+((s.charCodeAt(j+2)||0)<<16)+((s.charCodeAt(j+3)||0)<<24);}md5blks[length>>2]|=0x80<<((length%4)*8);md5blks[((length+8)>>6<<4)+14]=length*8;return md5blks;}
  const m=md5blk(str);let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<m.length;i+=16){const [oa,ob,oc,od]=[a,b,c,d];
    a=md5ff(a,b,c,d,m[i],7,-680876936);d=md5ff(d,a,b,c,m[i+1],12,-389564586);c=md5ff(c,d,a,b,m[i+2],17,606105819);b=md5ff(b,c,d,a,m[i+3],22,-1044525330);
    a=md5ff(a,b,c,d,m[i+4],7,-176418897);d=md5ff(d,a,b,c,m[i+5],12,1200080426);c=md5ff(c,d,a,b,m[i+6],17,-1473231341);b=md5ff(b,c,d,a,m[i+7],22,-45705983);
    a=md5ff(a,b,c,d,m[i+8],7,1770035416);d=md5ff(d,a,b,c,m[i+9],12,-1958414417);c=md5ff(c,d,a,b,m[i+10],17,-42063);b=md5ff(b,c,d,a,m[i+11],22,-1990404162);
    a=md5ff(a,b,c,d,m[i+12],7,1804603682);d=md5ff(d,a,b,c,m[i+13],12,-40341101);c=md5ff(c,d,a,b,m[i+14],17,-1502002290);b=md5ff(b,c,d,a,m[i+15],22,1236535329);
    a=md5gg(a,b,c,d,m[i+1],5,-165796510);d=md5gg(d,a,b,c,m[i+6],9,-1069501632);c=md5gg(c,d,a,b,m[i+11],14,643717713);b=md5gg(b,c,d,a,m[i],20,-373897302);
    a=md5gg(a,b,c,d,m[i+5],5,-701558691);d=md5gg(d,a,b,c,m[i+10],9,38016083);c=md5gg(c,d,a,b,m[i+15],14,-660478335);b=md5gg(b,c,d,a,m[i+4],20,-405537848);
    a=md5gg(a,b,c,d,m[i+9],5,568446438);d=md5gg(d,a,b,c,m[i+14],9,-1019803690);c=md5gg(c,d,a,b,m[i+3],14,-187363961);b=md5gg(b,c,d,a,m[i+8],20,1163531501);
    a=md5gg(a,b,c,d,m[i+13],5,-1444681467);d=md5gg(d,a,b,c,m[i+2],9,-51403784);c=md5gg(c,d,a,b,m[i+7],14,1735328473);b=md5gg(b,c,d,a,m[i+12],20,-1926607734);
    a=md5hh(a,b,c,d,m[i+5],4,-378558);d=md5hh(d,a,b,c,m[i+8],11,-2022574463);c=md5hh(c,d,a,b,m[i+11],16,1839030562);b=md5hh(b,c,d,a,m[i+14],23,-35309556);
    a=md5hh(a,b,c,d,m[i+1],4,-1530992060);d=md5hh(d,a,b,c,m[i+4],11,1272893353);c=md5hh(c,d,a,b,m[i+7],16,-155497632);b=md5hh(b,c,d,a,m[i+10],23,-1094730640);
    a=md5hh(a,b,c,d,m[i+13],4,681279174);d=md5hh(d,a,b,c,m[i],11,-358537222);c=md5hh(c,d,a,b,m[i+3],16,-722521979);b=md5hh(b,c,d,a,m[i+6],23,76029189);
    a=md5hh(a,b,c,d,m[i+9],4,-640364487);d=md5hh(d,a,b,c,m[i+12],11,-421815835);c=md5hh(c,d,a,b,m[i+15],16,530742520);b=md5hh(b,c,d,a,m[i+2],23,-995338651);
    a=md5ii(a,b,c,d,m[i],6,-198630844);d=md5ii(d,a,b,c,m[i+7],10,1126891415);c=md5ii(c,d,a,b,m[i+14],15,-1416354905);b=md5ii(b,c,d,a,m[i+5],21,-57434055);
    a=md5ii(a,b,c,d,m[i+12],6,1700485571);d=md5ii(d,a,b,c,m[i+3],10,-1894986606);c=md5ii(c,d,a,b,m[i+10],15,-1051523);b=md5ii(b,c,d,a,m[i+1],21,-2054922799);
    a=md5ii(a,b,c,d,m[i+8],6,1873313359);d=md5ii(d,a,b,c,m[i+15],10,-30611744);c=md5ii(c,d,a,b,m[i+6],15,-1560198380);b=md5ii(b,c,d,a,m[i+13],21,1309151649);
    a=md5ii(a,b,c,d,m[i+4],6,-145523070);d=md5ii(d,a,b,c,m[i+11],10,-1120210379);c=md5ii(c,d,a,b,m[i+2],15,718787259);b=md5ii(b,c,d,a,m[i+9],21,-343485551);
    a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od);}
  return [a,b,c,d].map(n=>(n<0?n+4294967296:n).toString(16).padStart(8,"0").match(/../g)!.reverse().join("")).join("");
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

  // Build signature string — PayFast requires specific encoding
  const sigString = Object.keys(fields)
    .filter((k) => k !== "signature")
    .sort()
    .map((k) => `${k}=${encodeURIComponent(fields[k]).replace(/%20/g, "+").replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A")}`)
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
