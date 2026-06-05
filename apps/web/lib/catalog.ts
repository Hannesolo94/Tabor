// TABOR catalog — the product backbone for the website.
//
// Two-axis information architecture (per founder direction):
//   PERSONA (collection)  = the primary brand line a product belongs to.
//   CATEGORY (type)       = the product type, a cross-cutting "shop by type" axis.
// Every product carries both. Personas are the main navigation; categories are a
// separate menu that slices across all personas.
//
// This is a curated Phase 1 (true no-MOQ POD) range. Real Printful/SA-POD variant
// IDs, per-region pricing, and generated artwork get wired in later; for now each
// product renders with the seal/wordmark placeholder system from the prototype.

export const GOLD = "#C9A961";

// ── Personas ──────────────────────────────────────────────────────────────────
export type PersonaId = "sentinel" | "crusader" | "scribe" | "pilgrim";

export interface Persona {
  id: PersonaId;
  name: string;
  tag: string;
  blurb: string; // one line for cards/menus
  meaning: string; // who this man is — the archetype it represents
  design: string; // the design language of this collection
  accent: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "sentinel",
    name: "The Sentinel",
    tag: "The guardian",
    blurb: "Balanced, steady, holds the line. Clean staples for the man who shows up.",
    meaning:
      "The Sentinel is the guardian. Balanced and steady, he holds the line for his brothers and his house. He is not the loudest in the room, he is the one still standing when the day is done. He shows up, every day, and that consistency is his strength.",
    design:
      "Clean, structured, restrained. Gold seal on matte black, minimal placement, nothing wasted. The Sentinel collection is the baseline uniform: pieces that read as quiet authority rather than noise.",
    accent: "#C9A961",
  },
  {
    id: "crusader",
    name: "The Crusader",
    tag: "The fighter",
    blurb: "Strength and the iron. Heavyweight training gear built to be punished.",
    meaning:
      "The Crusader is the fighter. He leans into the iron and into the strength God gave him to steward. The body is a temple, so he trains it like one. He runs toward the hard thing, and he carries weight so his brothers do not have to.",
    design:
      "Heavyweight, rugged, blacked-out. Tonal seals, gold cuff marks, training-built fabrics. The Crusader collection is the gear you punish in the gym and on the road: bolder, denser, made to take a beating and hold.",
    accent: "#A8843E",
  },
  {
    id: "scribe",
    name: "The Scribe",
    tag: "The student",
    blurb: "Wisdom and the Word. Quiet, considered pieces with sacred detail.",
    meaning:
      "The Scribe is the student. He leans into the Word and into wisdom, and he would rather understand than be seen. He keeps the watch with a book open. Iron sharpens iron, and he is the friend who sharpens the mind.",
    design:
      "Quiet, considered, sacred in its detail. Greek inscriptions, scripture back-prints, muted blue-grey accents against black. The Scribe collection rewards a close look: the marks are subtle, liturgical, made for the man who reads.",
    accent: "#9FB8C9",
  },
  {
    id: "pilgrim",
    name: "The Pilgrim",
    tag: "The seeker",
    blurb: "New to the climb. Entry pieces, everyday, the start of the journey.",
    meaning:
      "The Pilgrim is the seeker. He is new to the climb, and he is welcome. No one is born forged. The Pilgrim is the man taking his first honest step, and the brotherhood meets him there and walks with him.",
    design:
      "Approachable, light, everyday. Small chest seals, simple placement, easy-living fabrics in black. The Pilgrim collection is the start of the journey: pieces that do not demand you have already arrived.",
    accent: "#A88BC9",
  },
];

export const personaById = (id: string) => PERSONAS.find((p) => p.id === id);

// ── Categories (product types) ────────────────────────────────────────────────
export type CategoryId =
  | "apparel"
  | "headwear"
  | "flag"
  | "rug"
  | "blanket"
  | "towel"
  | "candle"
  | "sticker"
  | "drinkware"
  | "stationery"
  | "print";

export interface Category {
  id: CategoryId;
  name: string; // plural, for menus
  blurb: string;
}

export const CATEGORIES: Category[] = [
  { id: "apparel", name: "Apparel", blurb: "Tees, hoodies, crews, and joggers. Heavyweight, muted, premium." },
  { id: "headwear", name: "Headwear", blurb: "Caps and beanies, marked with the seal." },
  { id: "flag", name: "Flags", blurb: "Fly the standard. Wall banners for the war room." },
  { id: "rug", name: "Rugs", blurb: "Ground for the floor you train and pray on." },
  { id: "blanket", name: "Blankets", blurb: "Sherpa and fleece. Warmth for the watch." },
  { id: "towel", name: "Towels", blurb: "Gym and shower. For the sweat of the climb." },
  { id: "candle", name: "Candles", blurb: "Light for the dawn watch and quiet prayer." },
  { id: "sticker", name: "Stickers", blurb: "Seal and wordmark. Mark your gear." },
  { id: "drinkware", name: "Drinkware", blurb: "Bottles and mugs for water and the morning." },
  { id: "stationery", name: "Journals", blurb: "Quest logs and scripture journals." },
  { id: "print", name: "Wall Art", blurb: "Scripture and the standard, framed for the wall." },
];

export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id);

// ── Product ───────────────────────────────────────────────────────────────────
export interface Product {
  sku: string;
  name: string;
  price: number;
  persona: PersonaId;
  category: CategoryId;
  tagline: string; // short label shown on the art
  note: string; // spec line (e.g. "240gsm heavyweight")
  blurb: string; // one line for cards
  description: string; // PDP body
  tone: string; // art background
  ink: string; // mark color
  mark: "word" | "seal";
  sizes?: string[]; // apparel/headwear variants
  featured?: boolean;
  inStock: boolean; // derived from inventory/track_inventory
  imageUrl?: string | null; // real product image (falls back to generated art)
  currencySymbol: string; // resolved for the viewing region ($ or R)
  currencyCode: string; // USD | ZAR
}

/** Which categories actually have products, given a fetched product list. */
export function categoriesPresent(products: Product[]): Category[] {
  return CATEGORIES.filter((c) => products.some((p) => p.category === c.id));
}

// Product DATA now lives in the database (the products table) and is fetched via
// lib/products-db.ts so the admin can edit it live. This module keeps only the
// fixed taxonomy (personas, categories) and pure helpers.
