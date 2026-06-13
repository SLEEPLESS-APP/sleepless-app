import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
const AS = { getItem: async (k: string) => Platform.OS === "web" ? (typeof window !== "undefined" ? localStorage.getItem(k) : null) : (await import("@react-native-async-storage/async-storage")).default.getItem(k), setItem: async (k: string, v: string) => Platform.OS === "web" ? (typeof window !== "undefined" && localStorage.setItem(k, v)) : (await import("@react-native-async-storage/async-storage")).default.setItem(k, v), removeItem: async (k: string) => Platform.OS === "web" ? (typeof window !== "undefined" && localStorage.removeItem(k)) : (await import("@react-native-async-storage/async-storage")).default.removeItem(k) };

const PROFILE_KEY = "sleepless_user_profile";

export interface UserProfile {
  displayName: string;
  avatarUri: string | null;
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: "User",
  avatarUri: null,
};

interface ProfileContextType {
  profile: UserProfile;
  updateDisplayName: (name: string) => Promise<void>;
  updateAvatar: (uri: string | null) => Promise<void>;
  resetProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Load profile from storage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AS.getItem(PROFILE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      await AS.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const updateDisplayName = async (name: string) => {
    const newProfile = { ...profile, displayName: name };
    setProfile(newProfile);
    await saveProfile(newProfile);
  };

  const updateAvatar = async (uri: string | null) => {
    const newProfile = { ...profile, avatarUri: uri };
    setProfile(newProfile);
    await saveProfile(newProfile);
  };

  const resetProfile = async () => {
    setProfile(DEFAULT_PROFILE);
    await saveProfile(DEFAULT_PROFILE);
  };

  return (
    <ProfileContext.Provider
      value={{ profile, updateDisplayName, updateAvatar, resetProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
