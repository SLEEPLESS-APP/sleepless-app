import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform, Modal } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ScreenContainer } from "@/components/screen-container";
import { GradientBackground, GlassInput, BackButton } from "@/components/sleepless";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { TicketTypesEditor, TicketTypeData } from "@/components/ticket-types-editor";
import { LinearGradient } from "expo-linear-gradient";
import { useOrganizer } from "@/lib/organizer-context";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";

export default function CreateEvent() {
  const router = useRouter();
  const { organizer, loading } = useOrganizer();

  // Redirect to organizer login if not authenticated
  useEffect(() => {
    if (!loading && !organizer) {
      Alert.alert(
        "Organizer Login Required",
        "You must be logged in as an organizer to create events. Please log in or register as an organizer.",
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
  }, [loading, organizer, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={{ color: "#fff", marginTop: 16 }}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Don't render the form if not authenticated
  if (!organizer) {
    return null;
  }

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

  const [ticketTypes, setTicketTypes] = useState<TicketTypeData[]>([
    { name: "General Admission", description: "Standard entry ticket", price: "", quantity: "", maxPerOrder: "10" },
  ]);
  const [useMultipleTicketTypes, setUseMultipleTicketTypes] = useState(false);

  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  
  const uploadImageMutation = trpc.organizer.uploadImage.useMutation();
  const createEventMutation = trpc.organizer.createEvent.useMutation();
  const createTicketTypesMutation = trpc.ticketTypes.create.useMutation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Compress image before setting
      const compressed = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }], // Resize to max width 1200px
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

  const handleSubmit = async (isDraft: boolean = false) => {
    // Validate basic fields
    if (
      !formData.title ||
      !formData.description ||
      !formData.venue ||
      !formData.city ||
      !formData.eventDate ||
      !formData.eventTime ||
      !posterImage
    ) {
      Alert.alert("Error", "Please fill in all required fields and upload a poster");
      return;
    }

    // Validate ticketing
    if (useMultipleTicketTypes) {
      // Check all ticket types have price and quantity
      const invalidTickets = ticketTypes.filter(
        (tt) => !tt.price || !tt.quantity || parseFloat(tt.price) < 0 || parseInt(tt.quantity) < 1
      );
      if (invalidTickets.length > 0) {
        Alert.alert("Error", "Please set price and quantity for all ticket types");
        return;
      }
      if (ticketTypes.length === 0) {
        Alert.alert("Error", "Please add at least one ticket type");
        return;
      }
    } else {
      if (!formData.price || !formData.ticketsAvailable) {
        Alert.alert("Error", "Please fill in ticket price and quantity");
        return;
      }
    }

    try {
      // Upload image to S3
      const base64 = await FileSystem.readAsStringAsync(posterImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileName = posterImage.split("/").pop() || "event.jpg";
      const uploadResult = await uploadImageMutation.mutateAsync({
        base64Data: base64,
        fileName,
        contentType: "image/jpeg",
      });

      // Create event in database
      if (!organizer) {
        Alert.alert("Error", "You must be logged in as an organizer to create events");
        return;
      }

      // Calculate total tickets and base price from ticket types if using multiple
      let totalTickets = parseInt(formData.ticketsAvailable) || 0;
      let basePrice = parseFloat(formData.price) || 0;
      
      if (useMultipleTicketTypes && ticketTypes.length > 0) {
        totalTickets = ticketTypes.reduce((sum, tt) => sum + (parseInt(tt.quantity) || 0), 0);
        // Use lowest price as base price for display
        const prices = ticketTypes.map((tt) => parseFloat(tt.price) || 0).filter((p) => p > 0);
        basePrice = prices.length > 0 ? Math.min(...prices) : 0;
      }

      const newEvent = await createEventMutation.mutateAsync({
        organizerId: organizer!.id,
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        address: formData.address || "",
        city: formData.city,
        province: formData.province,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventType: formData.eventType,
        price: basePrice,
        ticketsAvailable: totalTickets,
        posterUrl: uploadResult.url,
        status: isDraft ? "draft" : "pending",
      });

      // Create ticket types if using multiple and event was created
      if (useMultipleTicketTypes && ticketTypes.length > 0 && newEvent?.event?.id) {
        await createTicketTypesMutation.mutateAsync({
          eventId: newEvent.event.id,
          ticketTypes: ticketTypes.map((tt, index) => ({
            name: tt.name,
            description: tt.description || undefined,
            price: Math.round(parseFloat(tt.price) * 100), // Convert to cents
            quantity: parseInt(tt.quantity),
            maxPerOrder: parseInt(tt.maxPerOrder) || 10,
            sortOrder: index,
          })),
        });
      }

      const message = isDraft 
        ? "Event saved as draft! You can edit and submit it later."
        : "Event submitted for review! You'll be notified once it's approved.";
      
      Alert.alert("Success", message, [
        { text: "OK", onPress: () => router.replace("/organizer/my-events" as any) },
      ]);
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    }
  };

  const provinces = [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Mpumalanga",
    "Limpopo",
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

  const eventTypes = ["Club", "Festival", "Concert", "Pool Party", "Rooftop"];

  return (
    <GradientBackground>
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Create Event</Text>
          <Text style={styles.subtitle}>Fill in the details for your new event</Text>

          <View style={styles.form}>
            {/* Poster Upload */}
            <View style={styles.posterSection}>
              <Text style={styles.label}>Event Poster *</Text>
              {posterImage ? (
                <TouchableOpacity onPress={pickImage} style={styles.posterPreview}>
                  <Image source={{ uri: posterImage }} style={styles.posterImage} />
                  <Text style={styles.changeImageText}>Tap to change</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={pickImage} style={styles.posterPlaceholder}>
                  <Text style={styles.posterPlaceholderText}>📷</Text>
                  <Text style={styles.posterPlaceholderLabel}>Upload Event Poster</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Basic Info */}
            <GlassInput
              placeholder="Event Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <GlassInput
              placeholder="Description *"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />

            {/* Venue Info */}
            <Text style={styles.sectionTitle}>Venue Information</Text>

            <GlassInput
              placeholder="Venue Name *"
              value={formData.venue}
              onChangeText={(text) => setFormData({ ...formData, venue: text })}
            />

            <AddressAutocomplete
              label="Address *"
              value={formData.address}
              placeholder="Search for venue address..."
              country="za"
              onAddressSelect={(addressDetails) => {
                // Extract city from address components
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

            {/* Province Selector */}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowProvinceModal(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.province || "Select Province *"}
              </Text>
            </TouchableOpacity>

            {/* City Selector */}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => {
                if (formData.province) {
                  setShowCityModal(true);
                } else {
                  Alert.alert("Select Province", "Please select a province first");
                }
              }}
            >
              <Text style={styles.datePickerText}>
                {formData.city || "Select City *"}
              </Text>
            </TouchableOpacity>

            {/* Province Modal */}
            <Modal
              visible={showProvinceModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowProvinceModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Province</Text>
                    <TouchableOpacity onPress={() => setShowProvinceModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalScroll}>
                    {provinces.map((province) => (
                      <TouchableOpacity
                        key={province}
                        style={[
                          styles.modalItem,
                          formData.province === province && styles.modalItemSelected,
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, province, city: "" });
                          setShowProvinceModal(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.modalItemText,
                            formData.province === province && styles.modalItemTextSelected,
                          ]}
                        >
                          {province}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

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
                    {getCitiesForProvince(formData.province).map((city) => (
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

            {/* Event Type Selector */}
            <Text style={styles.sectionTitle}>Event Type</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEventTypeModal(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.eventType || "Select Event Type *"}
              </Text>
            </TouchableOpacity>

            {/* Event Type Modal */}
            <Modal
              visible={showEventTypeModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowEventTypeModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Event Type</Text>
                    <TouchableOpacity onPress={() => setShowEventTypeModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalScroll}>
                    {eventTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.modalItem,
                          formData.eventType === type && styles.modalItemSelected,
                        ]}
                        onPress={() => {
                          setFormData({ ...formData, eventType: type });
                          setShowEventTypeModal(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.modalItemText,
                            formData.eventType === type && styles.modalItemTextSelected,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Date & Time */}
            <Text style={styles.sectionTitle}>Date & Time</Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.eventDate || "Select Event Date *"}
              </Text>
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

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.eventTime || "Select Event Time *"}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            {/* Ticketing */}
            <Text style={styles.sectionTitle}>Ticketing</Text>

            {/* Toggle for multiple ticket types */}
            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => setUseMultipleTicketTypes(!useMultipleTicketTypes)}
            >
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Multiple Ticket Types</Text>
                <Text style={styles.toggleDescription}>
                  Sell different options (VIP, Tables, Early Bird, etc.)
                </Text>
              </View>
              <View style={[styles.toggle, useMultipleTicketTypes && styles.toggleActive]}>
                <View style={[styles.toggleKnob, useMultipleTicketTypes && styles.toggleKnobActive]} />
              </View>
            </TouchableOpacity>

            {useMultipleTicketTypes ? (
              <TicketTypesEditor
                ticketTypes={ticketTypes}
                onChange={setTicketTypes}
              />
            ) : (
              <>
                <GlassInput
                  placeholder="Ticket Price (ZAR) *"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="numeric"
                />

                <GlassInput
                  placeholder="Tickets Available *"
                  value={formData.ticketsAvailable}
                  onChangeText={(text) => setFormData({ ...formData, ticketsAvailable: text })}
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={styles.note}>
              * Required fields. Your event will be reviewed before being published.
            </Text>

            <TouchableOpacity
              onPress={() => handleSubmit(false)}
              activeOpacity={0.8}
              style={styles.button}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a5a", "#dd4a4a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>CREATE EVENT</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSubmit(true)}
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#E0E0E0",
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  posterSection: {
    marginBottom: 8,
  },
  posterPlaceholder: {
    height: 200,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  posterPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  posterPlaceholderLabel: {
    fontSize: 16,
    color: "#E0E0E0",
  },
  posterPreview: {
    position: "relative",
  },
  posterImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
  },
  changeImageText: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    padding: 8,
    borderRadius: 8,
    fontSize: 12,
  },
  note: {
    fontSize: 12,
    color: "#B0B0B0",
    fontStyle: "italic",
    marginTop: 8,
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
  },
  button: {
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 8,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  datePickerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    marginBottom: 12,
  },
  datePickerText: {
    color: "#fff",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  picker: {
    color: "#fff",
    height: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  modalClose: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
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
    fontWeight: "bold",
    color: "#ff6b6b",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  toggleDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#ff6b6b",
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
});
