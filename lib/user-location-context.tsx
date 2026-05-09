import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Coordinates, getCityCoordinates } from "./distance";

interface UserLocation extends Coordinates {
  address: string;
  city: string;
}

interface UserLocationContextType {
  userLocation: UserLocation | null;
  isLoading: boolean;
  setUserLocation: (location: UserLocation) => Promise<void>;
  clearUserLocation: () => Promise<void>;
  distanceFilter: number; // in km, 0 means no filter
  setDistanceFilter: (distance: number) => Promise<void>;
}

const USER_LOCATION_KEY = "user_location";
const DISTANCE_FILTER_KEY = "distance_filter";

const UserLocationContext = createContext<UserLocationContextType | null>(null);

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocationState] = useState<UserLocation | null>(null);
  const [distanceFilter, setDistanceFilterState] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved location on mount
  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const [locationJson, filterJson] = await Promise.all([
        AsyncStorage.getItem(USER_LOCATION_KEY),
        AsyncStorage.getItem(DISTANCE_FILTER_KEY),
      ]);

      if (locationJson) {
        setUserLocationState(JSON.parse(locationJson));
      }

      if (filterJson) {
        setDistanceFilterState(parseInt(filterJson, 10));
      }
    } catch (error) {
      console.error("Error loading user location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserLocation = async (location: UserLocation) => {
    try {
      await AsyncStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
      setUserLocationState(location);
    } catch (error) {
      console.error("Error saving user location:", error);
      throw error;
    }
  };

  const clearUserLocation = async () => {
    try {
      await AsyncStorage.removeItem(USER_LOCATION_KEY);
      setUserLocationState(null);
    } catch (error) {
      console.error("Error clearing user location:", error);
      throw error;
    }
  };

  const setDistanceFilter = async (distance: number) => {
    try {
      await AsyncStorage.setItem(DISTANCE_FILTER_KEY, distance.toString());
      setDistanceFilterState(distance);
    } catch (error) {
      console.error("Error saving distance filter:", error);
      throw error;
    }
  };

  return (
    <UserLocationContext.Provider
      value={{
        userLocation,
        isLoading,
        setUserLocation,
        clearUserLocation,
        distanceFilter,
        setDistanceFilter,
      }}
    >
      {children}
    </UserLocationContext.Provider>
  );
}

export function useUserLocation() {
  const context = useContext(UserLocationContext);
  if (!context) {
    throw new Error("useUserLocation must be used within a UserLocationProvider");
  }
  return context;
}

/**
 * Helper to create a UserLocation from address autocomplete result
 */
export function createUserLocationFromAddress(
  address: string,
  city: string,
  latitude: number,
  longitude: number
): UserLocation {
  // If coordinates are 0 (placeholder), try to get city coordinates
  if (latitude === 0 && longitude === 0) {
    const cityCoords = getCityCoordinates(city);
    if (cityCoords) {
      return {
        address,
        city,
        latitude: cityCoords.latitude,
        longitude: cityCoords.longitude,
      };
    }
  }

  return {
    address,
    city,
    latitude,
    longitude,
  };
}
