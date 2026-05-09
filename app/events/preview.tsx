// preview.tsx now delegates straight to the real detail screen
// keeping this file avoids broken deep links from existing QR codes / shares
import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";

export default function EventPreviewScreen() {
  const { eventId, cityId, provinceId } = useLocalSearchParams<{
    eventId: string; cityId?: string; provinceId?: string;
  }>();

  useEffect(() => {
    router.replace(`/events/detail?eventId=${eventId}&cityId=${cityId ?? ""}&provinceId=${provinceId ?? ""}` as any);
  }, []);

  return null;
}
