import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BOOKINGS_KEY = "sleepless_bookings";

export interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  eventTime: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  status: "confirmed" | "pending" | "cancelled";
  ticketCode: string;
  transactionId?: string;
}

interface BookingsContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "purchaseDate" | "ticketCode" | "status">) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getBookingForEvent: (eventId: string) => Booking | undefined;
  hasBookedEvent: (eventId: string) => boolean;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

// Generate a random ticket code
function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "SLP-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from storage on mount
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKINGS_KEY);
      if (stored) {
        setBookings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const saveBookings = async (newBookings: Booking[]) => {
    try {
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(newBookings));
    } catch (error) {
      console.error("Error saving bookings:", error);
    }
  };

  const addBooking = async (bookingData: Omit<Booking, "id" | "purchaseDate" | "ticketCode" | "status">): Promise<Booking> => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      purchaseDate: new Date().toISOString(),
      ticketCode: generateTicketCode(),
      status: "confirmed",
    };

    const newBookings = [...bookings, newBooking];
    setBookings(newBookings);
    await saveBookings(newBookings);
    return newBooking;
  };

  const cancelBooking = async (bookingId: string) => {
    const newBookings = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: "cancelled" as const } : b
    );
    setBookings(newBookings);
    await saveBookings(newBookings);
  };

  const getBookingForEvent = (eventId: string): Booking | undefined => {
    return bookings.find((b) => b.eventId === eventId && b.status === "confirmed");
  };

  const hasBookedEvent = (eventId: string): boolean => {
    return bookings.some((b) => b.eventId === eventId && b.status === "confirmed");
  };

  return (
    <BookingsContext.Provider
      value={{ bookings, addBooking, cancelBooking, getBookingForEvent, hasBookedEvent }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingsProvider");
  }
  return context;
}
