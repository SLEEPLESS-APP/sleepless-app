import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function OrganizerLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="create-event" />
      <Stack.Screen name="edit-event" />
      <Stack.Screen name="my-events" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="bookings" />
    </Stack>
  );
}
