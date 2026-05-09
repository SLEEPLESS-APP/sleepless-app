import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform, Modal } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, GlassInput, BackButton } from "@/components/sleepless";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { LinearGradient } from "expo-linear-gradient";
import { useOrganizer } from "@/lib/organizer-context";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";

export default function EditEvent() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { organizer, loading: organizerLoading } = useOrganizer();

  // Redirect to organizer login if not authenticated
  useEffect(() => {
    if (!organizerLoading && !organizer) {
      Alert.alert(
        "Organizer Login Required",
        "You must be logged in as an organizer to edit events. Please log in or register as an organizer.",
        [
          {
            text: "Cancel",
            onPress: () => router.back(),
            style: "cancel",
          },
          {
            text: "Login",
            onPress: () => router.replace("/organizer/login" as any),
          },
        ]
      );
    }
  }, [organizerLoading, organizer, router]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    address: "",
    city: "",
    province: "Gauteng",
    eventDate: "",
    eventTime: "",
    eventType: "Club",
    price: "",
    ticketsAvailable: "",
    posterUrl: "",
    latitude: 0,
    longitude: 0,
  });

  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const uploadImageMutation = trpc.organizer.uploadImage.useMutation();
  const updateEventMutation = trpc.organizer.updateEvent.useMutation();

  // Fetch event data
  const { data: events } = trpc.organizer.events.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer?.id }
  );

  useEffect(() => {
    if (events && id) {
      const event = events.find((e: any) => e.id === parseInt(id as string));
      if (event) {
        setFormData({
          title: event.title,
          description: event.description,
          venue: event.venue,
          address: event.address || "",
          city: event.city,
          province: event.province,
          eventDate: new Date(event.eventDate).toISOString().split("T")[0],
          eventTime: event.eventTime,
          eventType: event.eventType,
          price: event.price.toString(),
          ticketsAvailable: event.ticketsAvailable.toString(),
          posterUrl: event.posterUrl,
          latitude: (event as any).latitude || 0,
          longitude: (event as any).longitude || 0,
        });
        setPosterImage(event.posterUrl);
        setSelectedDate(new Date(event.eventDate));
        const [hours, minutes] = event.eventTime.split(":");
        const time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes));
        setSelectedTime(time);
      }
      setIsLoading(false);
    }
  }, [events, id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPosterImage(compressed.uri);
      setFormData({ ...formData, posterUrl: compressed.uri });
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, eventDate: date.toISOString().split("T")[0] });
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (time) {
      setSelectedTime(time);
      const hours = time.getHours().toString().padStart(2, "0");
      const minutes = time.getMinutes().toString().padStart(2, "0");
      setFormData({ ...formData, eventTime: `${hours}:${minutes}` });
    }
  };

  const handleUpdate = async (publishNow: boolean) => {
    if (!organizer) {
      Alert.alert("Error", "Please log in to update events");
      return;
    }

    if (!formData.title || !formData.description || !formData.venue || !formData.city) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      let uploadResult = { url: formData.posterUrl };

      // Upload new image if changed
      if (posterImage && posterImage !== formData.posterUrl) {
        const base64 = await FileSystem.readAsStringAsync(posterImage, {
          encoding: FileSystem.EncodingType.Base64,
        });

        uploadResult = await uploadImageMutation.mutateAsync({
          base64Data: base64,
          fileName: `event-${Date.now()}.jpg`,
          contentType: "image/jpeg",
        });
      }

      await updateEventMutation.mutateAsync({
        id: parseInt(id as string),
        organizerId: organizer.id,
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventType: formData.eventType,
        price: Math.round(parseFloat(formData.price) * 100),
        ticketsAvailable: parseInt(formData.ticketsAvailable),
        posterUrl: uploadResult.url,
        status: publishNow ? "pending" : "draft",
      });

      const message = publishNow 
        ? "Event updated and submitted for review!"
        : "Event updated and saved as draft!";
      
      Alert.alert("Success", message, [
        { text: "OK", onPress: () => router.replace("/organizer/my-events" as any) },
      ]);
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Error", "Failed to update event. Please try again.");
    }
  };

  const provinces = [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Northern Cape",
  ];

  const getCitiesForProvince = (province: string): string[] => {
    const cityMap: Record<string, string[]> = {
      "Gauteng": ["Johannesburg", "Pretoria", "Roodepoort", "East Rand", "Midrand", "Sandton"],
      "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George", "Hermanus"],
      "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Newcastle", "Ballito"],
      "Eastern Cape": ["East London", "Port Elizabeth", "Grahamstown", "Queenstown", "Bedford"],
      "Free State": ["Bloemfontein", "Welkom", "Sasolburg", "Kroonstad", "Parys", "Bethlehem"],
      "Mpumalanga": ["Nelspruit", "Witbank", "Middelburg", "Secunda", "Ermelo"],
      "Limpopo": ["Polokwane", "Tzaneen", "Mokopane", "Thohoyandou", "Musina"],
      "North West": ["Rustenburg", "Mahikeng", "Klerksdorp", "Potchefstroom", "Brits"],
      "Northern Cape": ["Kimberley", "Upington", "Springbok", "De Aar", "Kuruman"],
    };
    return cityMap[province] || [];
  };

  const eventTypes = ["Club", "Festival", "Concert", "Pool Party", "Rooftop", "Other"];

  if (isLoading) {
    return (
      <GradientBackground>
        <ScreenContainer>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading event...</Text>
          </View>
        </ScreenContainer>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Edit Event</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Event Poster *</Text>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.imagePickerButton}>
              {posterImage ? (
                <Image source={{ uri: posterImage }} style={styles.posterPreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>📷 Tap to select poster</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Event Title *</Text>
            <GlassInput
              placeholder="e.g., Summer Rooftop Party"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <Text style={styles.label}>Description *</Text>
            <GlassInput
              placeholder="Describe your event..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            <Text style={styles.label}>Venue Name *</Text>
            <GlassInput
              placeholder="e.g., The Rooftop Bar"
              value={formData.venue}
              onChangeText={(text) => setFormData({ ...formData, venue: text })}
            />

            <Text style={styles.label}>Street Address</Text>
            <AddressAutocomplete
              value={formData.address}
              placeholder="Search for venue address..."
              country="za"
              onAddressSelect={(addressDetails) => {
                const city = addressDetails.components.locality || formData.city;
                const province = addressDetails.components.administrative_area || formData.province;
                setFormData({
                  ...formData,
                  address: addressDetails.formatted_address,
                  city: city,
                  province: province,
                  latitude: addressDetails.latitude,
                  longitude: addressDetails.longitude,
                });
              }}
            />

            <Text style={styles.label}>Province *</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.provinceScroll}>
                {provinces.map((prov) => (
                  <TouchableOpacity
                    key={prov}
                    onPress={() => setFormData({ ...formData, province: prov })}
                    activeOpacity={0.7}
                    style={[
                      styles.provinceChip,
                      formData.province === prov && styles.provinceChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.provinceChipText,
                        formData.province === prov && styles.provinceChipTextSelected,
                      ]}
                    >
                      {prov}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.label}>City *</Text>
            {/* City Selector */}
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => {
                if (formData.province) {
                  setShowCityModal(true);
                } else {
                  Alert.alert("Select Province", "Please select a province first");
                }
              }}
            >
              <Text style={styles.dateTimeText}>
                {formData.city || "Select City *"}
              </Text>
            </TouchableOpacity>

            {/* City Modal */}
            <Modal
              visible={showCityModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCityModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select City</Text>
                    <TouchableOpacity onPress={() => setShowCityModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalScroll}>
                    {getCitiesForProvince(formData.province).map((city: string) => (
                      <TouchableOpacity
                        key={city}
                        style={[
                          styles.modalItem,
                          formData.city === city && styles.modalItemSelected,
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, city });
                          setShowCityModal(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.modalItemText,
                            formData.city === city && styles.modalItemTextSelected,
                          ]}
                        >
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            <Text style={styles.label}>Event Date *</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
              style={styles.dateTimeButton}
            >
              <Text style={styles.dateTimeText}>
                {formData.eventDate || "Select date"}
              </Text>
              <Text style={styles.dateTimeIcon}>📅</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Event Time *</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.8}
              style={styles.dateTimeButton}
            >
              <Text style={styles.dateTimeText}>
                {formData.eventTime || "Select time"}
              </Text>
              <Text style={styles.dateTimeIcon}>🕐</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <Text style={styles.label}>Event Type</Text>
            <View style={styles.pickerContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {eventTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({ ...formData, eventType: type })}
                    activeOpacity={0.7}
                    style={[
                      styles.typeChip,
                      formData.eventType === type && styles.typeChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        formData.eventType === type && styles.typeChipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.label}>Ticket Price (R) *</Text>
            <GlassInput
              placeholder="e.g., 150"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Tickets Available *</Text>
            <GlassInput
              placeholder="e.g., 500"
              value={formData.ticketsAvailable}
              onChangeText={(text) => setFormData({ ...formData, ticketsAvailable: text })}
              keyboardType="numeric"
            />

            <Text style={styles.note}>
              * Required fields
            </Text>

            <TouchableOpacity
              onPress={() => handleUpdate(true)}
              activeOpacity={0.8}
              style={styles.button}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a5a", "#dd4a4a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>PUBLISH EVENT</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleUpdate(false)}
              activeOpacity={0.8}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.buttonText}>SAVE AS DRAFT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <BackButton />
          </View>
        </ScrollView>
      </ScreenContainer>
    </GradientBackground>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingTop: 100,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: "#fff",
    marginBottom: 24,
    textAlign: "center" as const,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: -8,
  },
  imagePickerButton: {
    width: "100%" as const,
    height: 200,
    borderRadius: 12,
    overflow: "hidden" as const,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  posterPreview: {
    width: "100%" as const,
    height: "100%" as const,
  },
  imagePlaceholder: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  imagePlaceholderText: {
    color: "#fff",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top" as const,
  },

  provinceScroll: {
    flexGrow: 0,
  },
  provinceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 8,
  },
  provinceChipSelected: {
    backgroundColor: "#ff6b6b",
  },
  provinceChipText: {
    color: "#fff",
    fontSize: 14,
  },
  provinceChipTextSelected: {
    fontWeight: "bold" as const,
  },
  dateTimeButton: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dateTimeText: {
    color: "#fff",
    fontSize: 16,
  },
  dateTimeIcon: {
    fontSize: 20,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: "#ff6b6b",
  },
  typeChipText: {
    color: "#fff",
    fontSize: 14,
  },
  typeChipTextSelected: {
    fontWeight: "bold" as const,
  },
  note: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic" as const,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    overflow: "hidden" as const,
    marginTop: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center" as const,
  },
  pickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden" as const,
    marginBottom: 16,
  },
  picker: {
    color: "#fff",
    height: 50,
  },
  gradient: {
    padding: 16,
    alignItems: "center" as const,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%" as const,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  modalClose: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold" as const,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  modalItemSelected: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
  },
  modalItemText: {
    fontSize: 16,
    color: "#fff",
  },
  modalItemTextSelected: {
    fontWeight: "bold" as const,
    color: "#ff6b6b",
  },
};
