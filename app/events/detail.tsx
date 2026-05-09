import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  GradientBackground,
  EventsHeader,
  HomeButton,
  BackButton,
  GlassButton,
  Breadcrumb,
  FavoriteButton,
  ShareButton,
  ReminderButton,
} from "@/components/sleepless";
import { useBookings } from "@/lib/bookings-context";
import { trpc } from "@/lib/trpc";
import { useUserLocation } from "@/lib/user-location-context";
import { calculateDistance, formatDistance, getCityCoordinates } from "@/lib/distance";
import { Linking, Alert } from "react-native";

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { hasBookedEvent } = useBookings();
  const { userLocation } = useUserLocation();

  // Fetch event from database
  const { data: event, isLoading, error } = trpc.events.getById.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );

  // Fetch ticket types for this event
  const { data: ticketTypes } = trpc.ticketTypes.getByEventId.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );

  // Fetch organizer contact info
  const { data: organizer } = trpc.contact.getOrganizerByEvent.useQuery(
    { eventId: parseInt(eventId || "0") },
    { enabled: !!eventId }
  );

  const [showContactModal, setShowContactModal] = useState(false);

  const isBooked = event ? hasBookedEvent(String(event.id)) : false;

  const handleLocation = () => {
    router.push(`/events/location?eventId=${eventId}` as any);
  };

  const handleComments = () => {
    router.push(`/events/comments?eventId=${eventId}` as any);
  };

  const handleBookings = () => {
    router.push(`/events/booking?eventId=${eventId}` as any);
  };

  const handleContactOrganizer = () => {
    setShowContactModal(true);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website: string) => {
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    Linking.openURL(url);
  };

  // Format date for display
  const formatDate = (date: Date | string | null) => {
    if (!date) return "TBA";
    const d = new Date(date);
    return d.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading event...</Text>
            </View>
            <View style={styles.footer}>
              <BackButton />
              <HomeButton />
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  if (!event || error) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={styles.errorText}>Event not found</Text>
            <View style={styles.footer}>
              <BackButton />
              <HomeButton />
            </View>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const breadcrumbItems = [
    { label: "Home", route: "/(tabs)" },
    { label: "Events", route: "/events/provinces" },
    { label: event.title },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EventsHeader />

          <Breadcrumb items={breadcrumbItems} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Event Name with Actions */}
            <View style={styles.titleRow}>
              <View style={styles.actionIcons}>
                <ShareButton eventId={String(event.id)} size={24} />
                <ReminderButton eventId={String(event.id)} size={24} />
              </View>
              <Text style={styles.eventName}>{event.title}</Text>
              <FavoriteButton eventId={String(event.id)} size={28} />
            </View>

            {/* Event Poster */}
            <View style={styles.posterContainer}>
              <View style={styles.posterCircle}>
                <Image source={{ uri: event.posterUrl || "" }} style={styles.posterImage} />
              </View>
              {isBooked && (
                <View style={styles.bookedBadge}>
                  <MaterialIcons name="check-circle" size={16} color="#4ade80" />
                  <Text style={styles.bookedText}>Booked</Text>
                </View>
              )}
            </View>

            {/* Price Tag */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Ticket Price</Text>
              <Text style={styles.priceValue}>
                {ticketTypes && ticketTypes.length > 0 
                  ? `From R${Math.min(...ticketTypes.map(tt => tt.price / 100))}` 
                  : `R${event.price}`}
              </Text>
            </View>

            {/* Ticket Types */}
            {ticketTypes && ticketTypes.length > 0 && (
              <View style={styles.ticketTypesContainer}>
                <Text style={styles.ticketTypesTitle}>Ticket Options</Text>
                {ticketTypes.map((tt) => (
                  <View key={tt.id} style={styles.ticketTypeCard}>
                    <View style={styles.ticketTypeHeader}>
                      <Text style={styles.ticketTypeName}>{tt.name}</Text>
                      <Text style={styles.ticketTypePrice}>R{(tt.price / 100).toFixed(0)}</Text>
                    </View>
                    {tt.description && (
                      <Text style={styles.ticketTypeDescription}>{tt.description}</Text>
                    )}
                    <View style={styles.ticketTypeFooter}>
                      <Text style={styles.ticketTypeAvailable}>
                        {tt.quantity - tt.sold} available
                      </Text>
                      <Text style={styles.ticketTypeMax}>Max {tt.maxPerOrder}/order</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Event Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date: </Text>
                <Text style={styles.detailValue}>{formatDate(event.eventDate)}</Text>
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time: </Text>
                <Text style={styles.detailValue}>{event.eventTime || "TBA"}</Text>
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Venue: </Text>
                <Text style={styles.detailValue}>{event.venue}</Text>
              </Text>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location: </Text>
                <Text style={styles.detailValue}>{event.city}, {event.province}</Text>
              </Text>
              {userLocation && (() => {
                const eventCoords = ((event as any).latitude && (event as any).longitude)
                  ? { latitude: (event as any).latitude, longitude: (event as any).longitude }
                  : getCityCoordinates(event.city);
                if (eventCoords) {
                  const distance = calculateDistance(userLocation, eventCoords);
                  return (
                    <View style={styles.distanceRow}>
                      <MaterialIcons name="location-on" size={16} color="#38bdf8" />
                      <Text style={styles.distanceText}>
                        {formatDistance(distance)} from your location
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type: </Text>
                <Text style={styles.detailValue}>{event.eventType}</Text>
              </Text>
              {event.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.detailLabel}>About:</Text>
                  <Text style={styles.descriptionText}>{event.description}</Text>
                </View>
              )}
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tickets Available: </Text>
                <Text style={styles.detailValue}>
                  {(event.ticketsAvailable || 0) - (event.ticketsSold || 0)} of {event.ticketsAvailable}
                </Text>
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <GlassButton
                title="Location"
                onPress={handleLocation}
                variant="outline"
                style={styles.actionButton}
              />
              <GlassButton
                title="Comments"
                onPress={handleComments}
                variant="outline"
                style={styles.actionButton}
              />
              <GlassButton
                title={isBooked ? "View Booking" : "Book Tickets"}
                onPress={handleBookings}
                variant="primary"
                style={styles.actionButton}
              />
              {organizer && (
                <GlassButton
                  title="Contact Organizer"
                  onPress={handleContactOrganizer}
                  variant="outline"
                  style={styles.actionButton}
                />
              )}
            </View>

            {/* Contact Organizer Modal */}
            <Modal
              visible={showContactModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowContactModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Contact Organizer</Text>
                    <TouchableOpacity onPress={() => setShowContactModal(false)}>
                      <MaterialIcons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  {organizer && (
                    <View style={styles.contactInfo}>
                      <Text style={styles.organizerName}>{organizer.companyName}</Text>
                      
                      {organizer.contactEmail && (
                        <TouchableOpacity 
                          style={styles.contactItem}
                          onPress={() => handleEmail(organizer.contactEmail)}
                        >
                          <MaterialIcons name="email" size={24} color="#38bdf8" />
                          <View style={styles.contactItemText}>
                            <Text style={styles.contactLabel}>Email</Text>
                            <Text style={styles.contactValue}>{organizer.contactEmail}</Text>
                          </View>
                          <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                      )}
                      
                      {organizer.contactPhone && (
                        <TouchableOpacity 
                          style={styles.contactItem}
                          onPress={() => handleCall(organizer.contactPhone!)}
                        >
                          <MaterialIcons name="phone" size={24} color="#4ade80" />
                          <View style={styles.contactItemText}>
                            <Text style={styles.contactLabel}>Phone</Text>
                            <Text style={styles.contactValue}>{organizer.contactPhone}</Text>
                          </View>
                          <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                      )}
                      
                      {organizer.website && (
                        <TouchableOpacity 
                          style={styles.contactItem}
                          onPress={() => handleWebsite(organizer.website!)}
                        >
                          <MaterialIcons name="language" size={24} color="#f472b6" />
                          <View style={styles.contactItemText}>
                            <Text style={styles.contactLabel}>Website</Text>
                            <Text style={styles.contactValue}>{organizer.website}</Text>
                          </View>
                          <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                      )}
                      
                      {organizer.bio && (
                        <View style={styles.bioContainer}>
                          <Text style={styles.bioLabel}>About</Text>
                          <Text style={styles.bioText}>{organizer.bio}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </Modal>
          </ScrollView>

          <View style={styles.footer}>
            <BackButton />
            <HomeButton />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  posterContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  posterCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  posterImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bookedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.4)",
  },
  bookedText: {
    color: "#4ade80",
    fontSize: 13,
    fontWeight: "600",
  },
  priceContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  priceLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginBottom: 2,
  },
  priceValue: {
    color: "#ff6b6b",
    fontSize: 28,
    fontWeight: "700",
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
  },
  detailValue: {
    color: "#ffffff",
    fontSize: 14,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  distanceText: {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: "500",
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  descriptionText: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 12,
  },
  actionButton: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  // Ticket Types Styles
  ticketTypesContainer: {
    marginBottom: 20,
  },
  ticketTypesTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  ticketTypeCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  ticketTypeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketTypeName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ticketTypePrice: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "700",
  },
  ticketTypeDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 8,
  },
  ticketTypeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  ticketTypeAvailable: {
    color: "#4ade80",
    fontSize: 12,
  },
  ticketTypeMax: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  // Contact Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  contactInfo: {
    padding: 20,
  },
  organizerName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactItemText: {
    flex: 1,
    marginLeft: 16,
  },
  contactLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginBottom: 2,
  },
  contactValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  bioContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  bioLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginBottom: 8,
  },
  bioText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
  },
});
