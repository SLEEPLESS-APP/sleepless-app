import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";

// Google Places API Key
const GOOGLE_PLACES_API_KEY = "48227a870c69876f6e9276ce559f05c859c263280ad04edb7e39226518c19763";

interface AddressPrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressDetails {
  formatted_address: string;
  latitude: number;
  longitude: number;
  place_id: string;
  components: {
    street_number?: string;
    route?: string;
    locality?: string;
    administrative_area?: string;
    country?: string;
    postal_code?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onAddressSelect: (address: AddressDetails) => void;
  placeholder?: string;
  label?: string;
  country?: string; // Restrict to specific country (e.g., "za" for South Africa)
  error?: string;
}

export function AddressAutocomplete({
  value,
  onAddressSelect,
  placeholder = "Search for an address...",
  label,
  country = "za", // Default to South Africa
  error,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const searchPlaces = async (searchText: string) => {
    if (searchText.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          searchText
        )}&components=country:${country}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.predictions) {
        setPredictions(data.predictions);
        setShowDropdown(true);
      } else {
        console.warn("Google Places API error:", data.status, data.error_message);
        setPredictions([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("Error fetching places:", err);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (text: string) => {
    setQuery(text);

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 300);
  };

  const getPlaceDetails = async (placeId: string, description: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_components&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.result) {
        const result = data.result;
        const components: AddressDetails["components"] = {};

        result.address_components?.forEach((component: any) => {
          if (component.types.includes("street_number")) {
            components.street_number = component.long_name;
          }
          if (component.types.includes("route")) {
            components.route = component.long_name;
          }
          if (component.types.includes("locality")) {
            components.locality = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            components.administrative_area = component.long_name;
          }
          if (component.types.includes("country")) {
            components.country = component.long_name;
          }
          if (component.types.includes("postal_code")) {
            components.postal_code = component.long_name;
          }
        });

        return {
          formatted_address: result.formatted_address,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          place_id: placeId,
          components,
        };
      }
    } catch (err) {
      console.error("Error fetching place details:", err);
    }
    return null;
  };

  const handleSelectPrediction = async (prediction: AddressPrediction) => {
    setIsLoading(true);
    Keyboard.dismiss();

    const details = await getPlaceDetails(prediction.place_id, prediction.description);

    if (details) {
      setQuery(details.formatted_address);
      onAddressSelect(details);
    } else {
      // Fallback if details fetch fails
      setQuery(prediction.description);
      onAddressSelect({
        formatted_address: prediction.description,
        latitude: 0,
        longitude: 0,
        place_id: prediction.place_id,
        components: {},
      });
    }

    setPredictions([]);
    setShowDropdown(false);
    setIsLoading(false);
  };

  const renderPrediction = ({ item }: { item: AddressPrediction }) => (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => handleSelectPrediction(item)}
      activeOpacity={0.7}
    >
      <View style={styles.predictionIcon}>
        <Text style={styles.iconText}>📍</Text>
      </View>
      <View style={styles.predictionText}>
        <Text style={styles.mainText} numberOfLines={1}>
          {item.structured_formatting.main_text}
        </Text>
        <Text style={styles.secondaryText} numberOfLines={1}>
          {item.structured_formatting.secondary_text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            onFocus={() => {
              setIsFocused(true);
              if (predictions.length > 0) setShowDropdown(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay hiding dropdown to allow selection
              setTimeout(() => setShowDropdown(false), 200);
            }}
          />
          {isLoading && (
            <ActivityIndicator size="small" color="#fff" style={styles.loader} />
          )}
        </View>

        {showDropdown && predictions.length > 0 && (
          <View style={styles.dropdown}>
            <FlatList
              data={predictions}
              renderItem={renderPrediction}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={predictions.length > 3}
              style={styles.dropdownList}
            />
            <View style={styles.poweredBy}>
              <Text style={styles.poweredByText}>Powered by Google</Text>
            </View>
          </View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    zIndex: 1000,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#fff",
  },
  loader: {
    marginLeft: 8,
  },
  dropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "rgba(30, 30, 40, 0.98)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    maxHeight: 250,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownList: {
    maxHeight: 200,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  predictionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 107, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  predictionText: {
    flex: 1,
  },
  mainText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
  },
  poweredBy: {
    padding: 8,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  poweredByText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
});
