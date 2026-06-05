// Product + collection data, ported from site-store.jsx.
// TODO (Phase 2 wiring): replace this static list with a fetch from the Supabase
// `products` table (cached from Printful via the printful-products Edge Function).

export const GOLD = "#C9A961";

export interface Collection {
  id: string;
  name: string;
  tag: string;
  blurb: string;
  accent: string;
}

export interface Product {
  sku: string;
  pfid: string;
  name: string;
  price: number;
  collection: string;
  tone: string;
  ink: string;
  mark: "word" | "seal";
  note: string;
  tagline: string;
}

export const COLLECTIONS: Collection[] = [
  { id: "sentinel", name: "The Sentinel", tag: "The guardian", blurb: "Balanced, steady, holds the line. Clean staples for the man who shows up.", accent: "#C9A961" },
  { id: "crusader", name: "The Crusader", tag: "The fighter", blurb: "Strength and the iron. Heavyweight training gear built to be punished.", accent: "#A8843E" },
  { id: "scribe", name: "The Scribe", tag: "The student", blurb: "Wisdom and the Word. Quiet, considered pieces with sacred detail.", accent: "#9FB8C9" },
  { id: "pilgrim", name: "The Pilgrim", tag: "The seeker", blurb: "New to the climb. Entry pieces, every-day, the start of the journey.", accent: "#A88BC9" },
];

export const PRODUCTS: Product[] = [
  { sku: "tabor-tee-sof", pfid: "", name: "Sons of Fire Tee", price: 38, collection: "sentinel", tone: "#15151A", ink: "#E8E2D5", mark: "word", note: "240gsm heavyweight", tagline: "Back-print wordmark" },
  { sku: "tabor-crew-tempered", pfid: "", name: "Tempered Crewneck", price: 58, collection: "sentinel", tone: "#131318", ink: "#E8E2D5", mark: "seal", note: "Midweight loopback", tagline: "Chest seal, nape text" },
  { sku: "tabor-cap-seal", pfid: "", name: "Seal Cap", price: 32, collection: "sentinel", tone: "#17140E", ink: GOLD, mark: "seal", note: "Structured 6-panel", tagline: "Gold-thread seal" },
  { sku: "tabor-hoodie-ascent", pfid: "", name: "Ascent Hoodie", price: 72, collection: "crusader", tone: "#121216", ink: GOLD, mark: "seal", note: "Brushed-back fleece", tagline: "Tonal seal, gold cuff" },
  { sku: "tabor-joggers-forge", pfid: "", name: "Forge Joggers", price: 64, collection: "crusader", tone: "#14140F", ink: "#E8E2D5", mark: "word", note: "Tapered heavyweight", tagline: "Cuff wordmark" },
  { sku: "tabor-straps-iron", pfid: "", name: "Iron Lifting Straps", price: 24, collection: "crusader", tone: "#1A1410", ink: GOLD, mark: "seal", note: "Reinforced cotton", tagline: "Seal-stamped" },
  { sku: "tabor-crew-scribe", pfid: "", name: "Theosis Crewneck", price: 60, collection: "scribe", tone: "#101216", ink: "#9FB8C9", mark: "word", note: "Premium loopback", tagline: "Greek inscription" },
  { sku: "tabor-tee-prov", pfid: "", name: "Iron Sharpens Tee", price: 40, collection: "scribe", tone: "#E8E2D5", ink: "#15151A", mark: "word", note: "Bone, scripture back", tagline: "Proverbs 27:17" },
  { sku: "tabor-beanie-cuff", pfid: "", name: "Cuffed Beanie", price: 28, collection: "scribe", tone: "#14140F", ink: GOLD, mark: "seal", note: "Ribbed merino blend", tagline: "Cuff seal" },
  { sku: "tabor-tee-pilgrim", pfid: "", name: "First Light Tee", price: 34, collection: "pilgrim", tone: "#15151A", ink: GOLD, mark: "seal", note: "180gsm everyday", tagline: "Small chest seal" },
  { sku: "tabor-stickers", pfid: "", name: "Sigil Sticker Pack", price: 12, collection: "pilgrim", tone: "#0F0F12", ink: GOLD, mark: "seal", note: "Die-cut vinyl x6", tagline: "Seal + wordmark" },
  { sku: "tabor-bottle", pfid: "", name: "Dawn Water Bottle", price: 30, collection: "pilgrim", tone: "#16140E", ink: GOLD, mark: "seal", note: "Insulated steel 750ml", tagline: "Etched seal" },
];
