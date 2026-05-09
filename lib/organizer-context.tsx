import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Organizer } from "../drizzle/schema";

interface OrganizerContextType {
  organizer: Organizer | null;
  isOrganizer: boolean;
  loading: boolean;
  setOrganizer: (organizer: Organizer | null) => void;
  clearOrganizer: () => void;
}

const OrganizerContext = createContext<OrganizerContextType | undefined>(undefined);

export function OrganizerProvider({ children }: { children: React.ReactNode }) {
  const [organizer, setOrganizerState] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizer();
  }, []);

  const loadOrganizer = async () => {
    try {
      const stored = await AsyncStorage.getItem("organizer");
      if (stored) {
        setOrganizerState(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load organizer:", error);
    } finally {
      setLoading(false);
    }
  };

  const setOrganizer = async (org: Organizer | null) => {
    setOrganizerState(org);
    if (org) {
      await AsyncStorage.setItem("organizer", JSON.stringify(org));
    } else {
      await AsyncStorage.removeItem("organizer");
    }
  };

  const clearOrganizer = async () => {
    setOrganizerState(null);
    await AsyncStorage.removeItem("organizer");
  };

  return (
    <OrganizerContext.Provider
      value={{
        organizer,
        isOrganizer: !!organizer,
        loading,
        setOrganizer,
        clearOrganizer,
      }}
    >
      {children}
    </OrganizerContext.Provider>
  );
}

export function useOrganizer() {
  const context = useContext(OrganizerContext);
  if (!context) {
    throw new Error("useOrganizer must be used within OrganizerProvider");
  }
  return context;
}
