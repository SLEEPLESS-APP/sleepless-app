import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

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
    locality?: string;
    administrative_area?: string;
    country?: string;
    city?: string;
    town?: string;
    suburb?: string;
  };
}

interface AddressAutocompleteProps {
  label?: string;
  value: string;
  placeholder?: string;
  country?: string;
  onAddressSelect: (details: AddressDetails) => void;
}

export function AddressAutocomplete({
  label,
  value,
  placeholder = "Search address...",
  country = "za",
  onAddressSelect,
}: AddressAutocompleteProps) {
  const [searchText, setSearchText] = useState(value || "");
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<any>(null);

  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
    setIsLoading(true);
    try {
      const base = getApiBaseUrl();
      const input = encodeURIComponent(JSON.stringify({ "0": { json: { input: query, country } } }));
      const res = await fetch(`${base}/api/trpc/places.autocomplete?batch=1&input=${input}`);
      const json = await res.json();
      const data = json?.[0]?.result?.data?.json;
      if (data?.predictions?.length > 0) {
        setPredictions(data.predictions);
        setShowDropdown(true);
      } else {
        setPredictions([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("Places search error:", err);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<AddressDetails | null> => {
    try {
      const base = getApiBaseUrl();
      const input = encodeURIComponent(JSON.stringify({ "0": { json: { placeId } } }));
      const res = await fetch(`${base}/api/trpc/places.details?batch=1&input=${input}`);
      const json = await res.json();
      const data = json?.[0]?.result?.data?.json;
      if (!data?.result) return null;

      const result = data.result;
      const components: AddressDetails["components"] = {};

      (result.address_components || []).forEach((comp: any) => {
        if (comp.types.includes("locality")) components.locality = comp.long_name;
        if (comp.types.includes("administrative_area_level_1")) components.administrative_area = comp.long_name;
        if (comp.types.includes("country")) components.country = comp.long_name;
        if (comp.types.includes("sublocality")) components.suburb = comp.long_name;
      });

      return {
        formatted_address: result.formatted_address,
        latitude: result.geometry?.location?.lat || 0,
        longitude: result.geometry?.location?.lng || 0,
        place_id: placeId,
        components,
      };
    } catch (err) {
      console.error("Place details error:", err);
      return null;
    }
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(text), 400);
  };

  const handleSelect = async (prediction: AddressPrediction) => {
    setSearchText(prediction.description);
    setShowDropdown(false);
    setPredictions([]);
    setIsLoading(true);
    try {
      const details = await getPlaceDetails(prediction.place_id);
      if (details) {
        onAddressSelect(details);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={searchText}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
        {isLoading && (
          <ActivityIndicator size="small" color="#9333ea" style={styles.spinner} />
        )}
      </View>
      {showDropdown && predictions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.prediction}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.predictionMain}>
                  {item.structured_formatting?.main_text || item.description}
                </Text>
                <Text style={styles.predictionSub}>
                  {item.structured_formatting?.secondary_text || ""}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, zIndex: 100 },
  label: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 6 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 14 },
  spinner: { marginLeft: 8 },
  dropdown: {
    backgroundColor: "#1e1e35",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    maxHeight: 220,
    marginTop: 4,
    zIndex: 200,
  },
  prediction: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  predictionMain: { color: "#fff", fontSize: 14, fontWeight: "600" },
  predictionSub: { color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 },
});
