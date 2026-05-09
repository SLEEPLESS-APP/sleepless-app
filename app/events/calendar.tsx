import { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Image, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { GradientBackground, EventsHeader, HomeButton, BackButton } from "@/components/sleepless";
import { trpc } from "@/lib/trpc";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: allEvents = [] } = trpc.events.getApproved.useQuery({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, any[]>();
    allEvents.forEach((event: any) => {
      const d = new Date(event.eventDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        map.set(day, [...(map.get(day) ?? []), event]);
      }
    });
    return map;
  }, [allEvents, year, month]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter((event: any) => {
      const d = new Date(event.eventDate);
      return d.getFullYear() === selectedDate.getFullYear() &&
             d.getMonth() === selectedDate.getMonth() &&
             d.getDate() === selectedDate.getDate();
    });
  }, [selectedDate, allEvents]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [year, month]);

  const goToPrevMonth = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDayPress = (day: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedDate(new Date(year, month, day));
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/events/detail?eventId=${eventId}` as any);
  };

  const renderDay = ({ item: day }: { item: number | null }) => {
    if (day === null) {
      return <View style={styles.dayCell} />;
    }

    const hasEvents = eventsByDay.has(day);
    const isSelected =
      selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year;
    const isToday =
      new Date().getDate() === day &&
      new Date().getMonth() === month &&
      new Date().getFullYear() === year;

    return (
      <Pressable
        onPress={() => handleDayPress(day)}
        style={[
          styles.dayCell,
          isSelected && styles.dayCellSelected,
          isToday && !isSelected && styles.dayCellToday,
        ]}
      >
        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
          {day}
        </Text>
        {hasEvents && (
          <View style={styles.eventDot}>
            <Text style={styles.eventDotText}>{eventsByDay.get(day)!.length}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <Pressable
      onPress={() => handleEventPress(item.id)}
      style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}
    >
      <Image source={{ uri: item.posterUrl }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventName} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.eventVenue} numberOfLines={1}>{item.venue}</Text>
        <Text style={styles.eventTime}>{item.time}</Text>
        <View style={styles.eventMeta}>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>R{(item.price/100).toFixed(0)}</Text>
          </View>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{item.eventType}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <EventsHeader />

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <Pressable
              onPress={goToPrevMonth}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="chevron-left" size={28} color="#ffffff" />
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTHS[month]} {year}
            </Text>
            <Pressable
              onPress={goToNextMonth}
              style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
            >
              <MaterialIcons name="chevron-right" size={28} color="#ffffff" />
            </Pressable>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <FlatList
            data={calendarDays}
            keyExtractor={(_, index) => index.toString()}
            numColumns={7}
            renderItem={renderDay}
            scrollEnabled={false}
            style={styles.calendarGrid}
          />

          {/* Selected Date Events */}
          {selectedDate && (
            <View style={styles.eventsSection}>
              <Text style={styles.eventsSectionTitle}>
                Events on {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}
              </Text>
              {selectedEvents.length > 0 ? (
                <FlatList
                  data={selectedEvents}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderEventItem}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.eventsList}
                />
              ) : (
                <View style={styles.noEventsContainer}>
                  <MaterialIcons name="event-busy" size={32} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.noEventsText}>No events on this date</Text>
                </View>
              )}
            </View>
          )}

          {!selectedDate && (
            <View style={styles.hintContainer}>
              <MaterialIcons name="touch-app" size={24} color="rgba(255,255,255,0.5)" />
              <Text style={styles.hintText}>Tap a date to see events</Text>
            </View>
          )}

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
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  monthTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  dayHeaders: {
    flexDirection: "row",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "600",
  },
  calendarGrid: {
    paddingHorizontal: 8,
    flexGrow: 0,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    borderRadius: 8,
    position: "relative",
  },
  dayCellSelected: {
    backgroundColor: "#ff6b6b",
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: "#ff6b6b",
  },
  dayText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  dayTextSelected: {
    fontWeight: "700",
  },
  eventDot: {
    position: "absolute",
    bottom: 4,
    backgroundColor: "#ff6b6b",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  eventDotText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  eventsSection: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  eventsSectionTitle: {
    color: "#ff6b6b",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  eventsList: {
    paddingBottom: 16,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  eventImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  eventInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  eventName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventVenue: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginBottom: 2,
  },
  eventTime: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: "row",
    gap: 8,
  },
  priceTag: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  typeTag: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: "#ffffff",
    fontSize: 11,
    textTransform: "capitalize",
  },
  noEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  noEventsText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
  hintContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  hintText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 16,
  },
});
