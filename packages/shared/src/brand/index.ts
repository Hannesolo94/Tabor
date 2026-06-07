// TABOR brand tokens — the single source of truth for color and type.
// Ported from docs/BRAND.md and tokens.css. Consumed by the web Tailwind config
// and the React Native theme so both platforms render identical brand values.
//
// Brand rule: gold is treated like leaf (a subtle metallic gradient), never a
// flat fill. Crimson is for crisis states ONLY. No em dashes in any copy.

export const colors = {
  black: "#0A0A0A",
  surface: "#15151A",
  surface2: "#0E0E12",
  gold: "#C9A961",
  goldDeep: "#A8843E",
  goldLight: "#E8D08C",
  bronze: "#8B5A2B",
  silver: "#C0C0C0",
  ivory: "#E8E2D5",
  // runtime tokens kept identical to the rendered app (single source of truth)
  text: "#C3BDB1",
  muted: "#8A847A",
  line: "rgba(201,169,97,0.16)",
  green: "#7BBF7B",
  red: "#C03A3A",
  ivoryMuted: "#8A8378",
  crimson: "#7A1F1F",
  crimsonGlow: "#C03A3A",
  parchment: "#E8E2D5",
  parchment2: "#D4CCB8",
  parchmentDeep: "#B8AE96",
} as const;

/** The metallic gold-leaf gradient. Use this for gold surfaces, never a flat fill. */
export const goldLeafGradient =
  "linear-gradient(135deg, #C9A961 0%, #A8843E 50%, #C9A961 100%)";

/**
 * Font families. Loaded via Google Fonts on both platforms.
 * Note: docs/BRAND.md specifies Cinzel (display) + Pirata One (wordmark);
 * tokens.css from the later prototype uses Big Shoulders Display + UnifrakturMaguntia.
 * Both stacks are captured here so the build can pick per surface. Confirm the
 * final pairing against the prototype before locking type.
 */
export const fonts = {
  display: '"Big Shoulders Display", "Archivo Black", system-ui, sans-serif',
  roman: '"Cinzel", "Trajan Pro", serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
  scripture: '"Cormorant Garamond", Georgia, serif',
  mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
  blackletter: '"UnifrakturMaguntia", "Old English Text MT", serif',
} as const;

/** Translucent tactical panel style (the Solo-Leveling-ish glass card). */
export const tacticalPanel = {
  background: "rgba(20, 22, 30, 0.72)",
  border: "1px solid rgba(201, 169, 97, 0.45)",
  boxShadow:
    "inset 0 0 24px rgba(201, 169, 97, 0.08), 0 0 0 1px rgba(201, 169, 97, 0.08), 0 0 32px rgba(201, 169, 97, 0.15)",
} as const;

/** Class names and rank ladder, surfaced here for non-game-engine consumers. */
export const CLASS_NAMES = ["Sentinel", "Scribe", "Crusader", "Pilgrim"] as const;

export const tagline = "Sons of Fire.";
export const creedLines = [
  "Forged not bought.",
  "No one climbs alone.",
  "Iron sharpens iron.",
  "Free for life.",
] as const;
