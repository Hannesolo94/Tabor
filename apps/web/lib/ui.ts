// Shared brand style constants for the web app (font CSS variables + gold).
export const GOLD = "#C9A961";
export const MONO = "var(--font-mono), monospace";
export const PIRATA = "var(--font-pirata), serif";
export const CINZEL = "var(--font-cinzel), serif";
export const BODY = "var(--font-inter), sans-serif";
export const SCRIPTURE = "var(--font-cormorant), serif";

export const fmtPrice = (n: number) => `$${n}`;

/** Format an amount with the right currency symbol. */
export const formatMoney = (amount: number, code?: string | null) => `${code === "ZAR" ? "R" : "$"}${amount}`;
