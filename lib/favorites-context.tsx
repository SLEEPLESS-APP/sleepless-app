import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
const AS = { getItem: async (k: string) => Platform.OS === "web" ? (typeof window !== "undefined" ? localStorage.getItem(k) : null) : (await import("@react-native-async-storage/async-storage")).default.getItem(k), setItem: async (k: string, v: string) => Platform.OS === "web" ? (typeof window !== "undefined" && localStorage.setItem(k, v)) : (await import("@react-native-async-storage/async-storage")).default.setItem(k, v), removeItem: async (k: string) => Platform.OS === "web" ? (typeof window !== "undefined" && localStorage.removeItem(k)) : (await import("@react-native-async-storage/async-storage")).default.removeItem(k) };

const FAVORITES_KEY = "sleepless_favorites";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (eventId: string) => void;
  removeFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  toggleFavorite: (eventId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from storage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AS.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AS.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  const addFavorite = (eventId: string) => {
    const newFavorites = [...favorites, eventId];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const removeFavorite = (eventId: string) => {
    const newFavorites = favorites.filter((id) => id !== eventId);
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (eventId: string) => {
    return favorites.includes(eventId);
  };

  const toggleFavorite = (eventId: string) => {
    if (isFavorite(eventId)) {
      removeFavorite(eventId);
    } else {
      addFavorite(eventId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
