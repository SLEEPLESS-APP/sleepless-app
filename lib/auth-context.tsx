import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";

interface User {
  id: number;
  username: string;
  email: string;
  provider?: "email" | "google" | "apple";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, email: string, dob?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = "@sleepless_auth";

// Storage helpers that work on both web and native
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return null; // SSR guard
      return window.localStorage.getItem(key);
    }
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, value);
      return;
    }
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(key);
      return;
    }
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.removeItem(key);
  },
};

async function apiPost(path: string, body: object) {
  const { getApiBaseUrl } = await import("@/constants/oauth");
  const res = await fetch(`${getApiBaseUrl()}/api/trpc/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json?.result?.data ?? json;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after first render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only load stored auth after component is mounted (client-side only)
  useEffect(() => {
    if (!mounted) return;
    storage.getItem(AUTH_STORAGE_KEY)
      .then((stored) => {
        if (stored) setUser(JSON.parse(stored));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [mounted]);

  const persist = async (u: User | null) => {
    setUser(u);
    if (u) await storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    else await storage.removeItem(AUTH_STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiPost("users.login", { json: { email, password } });
      if (data?.success && data.user) {
        await persist({ ...data.user, provider: "email" });
        return { success: true };
      }
      return { success: false, error: data?.error ?? "Login failed" };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (username: string, password: string, email: string, _dob?: string) => {
    try {
      const data = await apiPost("users.register", { json: { username, email, password } });
      if (data?.success && data.user) {
        await persist({ ...data.user, provider: "email" });
        return { success: true };
      }
      return { success: false, error: data?.error ?? "Registration failed" };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    console.warn("[Auth] Google OAuth not yet configured.");
    return false;
  };

  const loginWithApple = async (): Promise<boolean> => {
    console.warn("[Auth] Apple Sign-In not yet configured.");
    return false;
  };

  const logout = async () => {
    await persist(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, loginWithApple, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
