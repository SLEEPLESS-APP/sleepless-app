// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, MaterialIconName> = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "person.fill": "person",
  "lock.fill": "lock",
  "envelope.fill": "email",
  "calendar": "event",
  "questionmark.circle.fill": "help",
  "arrow.left": "arrow-back",
  "magnifyingglass": "search",
  "location.fill": "location-on",
  "heart.fill": "favorite",
  "bubble.left.fill": "chat-bubble",
  "camera.fill": "camera-alt",
  "car.fill": "directions-car",
  "figure.walk": "directions-walk",
  "xmark": "close",
  "cake.fill": "cake",
  "star.fill": "star",
  "info.circle.fill": "info",
  "gearshape.fill": "settings",
  "arrow.right.square.fill": "logout",
  "share.fill": "share",
  "bookmark.fill": "bookmark",
  "clock.fill": "schedule",
  "music.note": "music-note",
};

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
