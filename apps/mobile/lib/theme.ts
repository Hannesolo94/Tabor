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
  // depth / glass system
  glass: "rgba(32,32,40,0.72)",
  glassSoft: "rgba(44,44,54,0.5)",
  glassBorder: "rgba(201,169,97,0.18)",
  hairline: "rgba(255,255,255,0.06)",
};

// rounded-corner scale
export const R = { xs: 8, sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

// elevation presets (RN shadow + Android elevation). Pure RN, no native module.
export const SH = {
  card: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 7 },
  float: { shadowColor: "#000", shadowOffset: { width: 0, height: 22 }, shadowOpacity: 0.6, shadowRadius: 34, elevation: 16 },
  glow: { shadowColor: k.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 22, elevation: 10 },
} as const;
