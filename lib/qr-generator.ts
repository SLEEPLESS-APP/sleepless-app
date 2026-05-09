/**
 * QR Code Generator for Sleepless Tickets
 * 
 * This module generates QR code data that can be rendered as SVG or displayed
 * as a visual pattern. In production, this would integrate with a proper
 * QR code library like 'qrcode' or 'react-native-qrcode-svg'.
 */

export interface QRCodeData {
  ticketCode: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  quantity: number;
  transactionId?: string;
  timestamp: number;
}

/**
 * Generate QR code payload from booking data
 */
export function generateQRPayload(data: QRCodeData): string {
  // Create a compact JSON payload
  const payload = {
    t: data.ticketCode,        // ticket code
    e: data.eventId,           // event id
    n: data.eventName,         // event name
    d: data.eventDate,         // date
    q: data.quantity,          // quantity
    x: data.transactionId,     // transaction id
    ts: data.timestamp,        // timestamp
    v: 1,                      // version
  };

  // Encode as base64 for compact representation
  const jsonString = JSON.stringify(payload);
  return btoa(jsonString);
}

/**
 * Decode QR code payload back to data
 */
export function decodeQRPayload(encoded: string): QRCodeData | null {
  try {
    const jsonString = atob(encoded);
    const payload = JSON.parse(jsonString);
    
    return {
      ticketCode: payload.t,
      eventId: payload.e,
      eventName: payload.n,
      eventDate: payload.d,
      quantity: payload.q,
      transactionId: payload.x,
      timestamp: payload.ts,
    };
  } catch (error) {
    console.error("Failed to decode QR payload:", error);
    return null;
  }
}

/**
 * Generate a deterministic pattern for visual QR code representation
 * This creates a consistent pattern based on the ticket code
 */
export function generateQRPattern(ticketCode: string, size: number = 7): boolean[][] {
  // Create a seeded random generator based on ticket code
  const seed = ticketCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let random = seed;
  
  const nextRandom = () => {
    random = (random * 1103515245 + 12345) & 0x7fffffff;
    return random / 0x7fffffff;
  };

  // Generate pattern matrix
  const pattern: boolean[][] = [];
  
  for (let row = 0; row < size; row++) {
    const rowPattern: boolean[] = [];
    for (let col = 0; col < size; col++) {
      // Fixed corner patterns (finder patterns)
      const isTopLeft = row < 3 && col < 3;
      const isTopRight = row < 3 && col >= size - 3;
      const isBottomLeft = row >= size - 3 && col < 3;
      
      if (isTopLeft || isTopRight || isBottomLeft) {
        // Finder pattern: outer ring filled, inner empty, center filled
        const isOuter = row === 0 || row === 2 || col === 0 || col === 2 ||
                       (row < 3 && (col === 0 || col === size - 1 || col === size - 3)) ||
                       (col < 3 && (row === 0 || row === 2));
        const isCenter = (row === 1 && col === 1) ||
                        (row === 1 && col === size - 2) ||
                        (row === size - 2 && col === 1);
        rowPattern.push(isOuter || isCenter);
      } else {
        // Random data pattern
        rowPattern.push(nextRandom() > 0.5);
      }
    }
    pattern.push(rowPattern);
  }
  
  return pattern;
}

/**
 * Generate verification hash for ticket
 */
export function generateVerificationHash(ticketCode: string, eventId: string): string {
  const combined = `${ticketCode}-${eventId}-SLEEPLESS`;
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
}

/**
 * Validate a ticket code format
 */
export function isValidTicketCode(code: string): boolean {
  // Format: SLP-XXXXXXXX (3 letters, dash, 8 alphanumeric)
  return /^SLP-[A-Z0-9]{8}$/.test(code);
}
