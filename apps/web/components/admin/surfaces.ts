// Scoped "dark glass + depth" surface tokens for the admin dashboard.
// Approved design direction (see app/lab/preview): glass panels, soft depth
// shadows, gold-tinted borders, rounded corners, gradient gold buttons.
// These are plain CSSProperties fragments meant to be spread into inline styles.
import type { CSSProperties } from "react";
import { GOLD } from "@/lib/ui";

// Glass card / panel surface: translucent gradient, gold-tinted border, soft
// depth shadow + faint top highlight. Use for cards, panels, modals.
export const glassPanel: CSSProperties = {
  background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))",
  border: "1px solid rgba(201,169,97,0.14)",
  borderRadius: 16,
  boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
};

// Slightly inset tile (stat tiles, nested panels) — lighter depth.
export const glassTile: CSSProperties = {
  background: "linear-gradient(160deg, rgba(40,40,50,0.5), rgba(16,16,22,0.42))",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 30px -22px rgba(0,0,0,0.9)",
};

// Sticky / floating chrome (sidebars, sticky headers, modals): add blur.
export const glassChrome: CSSProperties = {
  background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(12,12,16,0.66))",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

// Primary gold button.
export const goldButton: CSSProperties = {
  background: "linear-gradient(180deg, #f0d89a, #c9a961)",
  color: "#1a1408",
  border: 0,
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
};

// Secondary / ghost button: translucent gold-tinted border.
export const ghostButton: CSSProperties = {
  background: "rgba(201,169,97,0.06)",
  color: "#E8D08C",
  border: `1px solid ${GOLD}59`,
  borderRadius: 12,
  cursor: "pointer",
};

// Form inputs / selects.
export const inputSurface: CSSProperties = {
  background: "rgba(15,15,20,0.6)",
  border: "1px solid rgba(201,169,97,0.2)",
  borderRadius: 10,
};

// Small pill / chip / badge.
export const chipSurface: CSSProperties = {
  borderRadius: 8,
};
