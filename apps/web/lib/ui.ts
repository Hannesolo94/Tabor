// Shared brand style constants for the web app (font CSS variables + palette).
export const GOLD = "#C9A961";
export const MONO = "var(--font-mono), monospace";
export const PIRATA = "var(--font-pirata), serif";
export const METAL = "var(--font-metal), var(--font-pirata), cursive";
export const CINZEL = "var(--font-cinzel), serif";
export const BODY = "var(--font-inter), sans-serif";
export const SCRIPTURE = "var(--font-cormorant), serif";

// Palette constants so new code stops hardcoding hex (L1). Existing inline
// literals can be migrated to these incrementally.
export const BLACK = "#0A0A0A";
export const SURFACE = "#15151A";
export const SURFACE2 = "#0E0E12";
export const IVORY = "#E8E2D5";
export const TEXT = "#C3BDB1";
export const MUTED = "#8A847A";
export const LINE = "rgba(201,169,97,0.16)";
export const GREEN = "#7BBF7B";
export const RED = "#C03A3A";
export const GOLD_LIGHT = "#E8D08C";

export const fmtPrice = (n: number) => `$${n}`;

/** Format an amount with the right currency symbol. */
export const formatMoney = (amount: number, code?: string | null) => `${code === "ZAR" ? "R" : "$"}${amount}`;
