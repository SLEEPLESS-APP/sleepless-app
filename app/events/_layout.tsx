import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animation: "slide_from_right",
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="provinces" />
      <Stack.Screen name="cities" />
      <Stack.Screen name="grid" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="location" />
      <Stack.Screen name="comments" />
      <Stack.Screen name="about" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="my-bookings" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="booking-confirmation" />
      <Stack.Screen name="ticket" />
      <Stack.Screen name="search" />
    </Stack>
  );
}
