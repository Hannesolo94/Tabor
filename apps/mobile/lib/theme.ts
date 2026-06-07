// Brand tokens. Colors come from @tabor/shared (single source of truth). Fonts
// stay here because RN uses loaded font module names, not CSS families.
import { brand } from "@tabor/shared";

export const F = {
  display: "PirataOne_400Regular",
  head: "Cinzel_700Bold",
  headMid: "Cinzel_600SemiBold",
  body: "Inter_400Regular",
  bodyMid: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
  mono: "JetBrainsMono_400Regular",
  scripture: "CormorantGaramond_500Medium_Italic",
};

const k = brand.colors;
export const C = {
  black: k.black,
  surface: k.surface,
  surface2: k.surface2,
  gold: k.gold,
  goldLight: k.goldLight,
  ivory: k.ivory,
  text: k.text,
  muted: k.muted,
  line: k.line,
  green: k.green,
  red: k.red,
};
