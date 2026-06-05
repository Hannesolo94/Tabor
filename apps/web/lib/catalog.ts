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
}

// Apparel/headwear size sets.
const TEE = ["S", "M", "L", "XL", "2XL"];
const ONE = ["One size"];

export const PRODUCTS: Product[] = [
  // ── SENTINEL — clean staples, balanced ──
  { sku: "snt-tee-sof", name: "Sons of Fire Tee", price: 38, persona: "sentinel", category: "apparel", tagline: "Back-print wordmark", note: "240gsm heavyweight", blurb: "The flagship tee. Heavyweight, back-print wordmark.", description: "A 240gsm heavyweight cotton tee with the blackletter wordmark printed large across the back and a small seal at the chest. Muted, structured, built to outlast trends. The uniform of the man who simply shows up.", tone: "#15151A", ink: "#E8E2D5", mark: "word", sizes: TEE, featured: true },
  { sku: "snt-crew-tempered", name: "Tempered Crewneck", price: 58, persona: "sentinel", category: "apparel", tagline: "Chest seal, nape text", note: "Midweight loopback", blurb: "Midweight loopback crew with chest seal.", description: "A midweight loopback crewneck carrying the coin-seal at the chest and the creed printed at the nape. Clean, considered, and warm enough for the dawn watch.", tone: "#131318", ink: "#E8E2D5", mark: "seal", sizes: TEE },
  { sku: "snt-cap-seal", name: "Seal Cap", price: 32, persona: "sentinel", category: "headwear", tagline: "Gold-thread seal", note: "Structured 6-panel", blurb: "Structured 6-panel with gold-thread seal.", description: "A structured six-panel cap with the seal embroidered in gold thread. Holds its shape, holds the line.", tone: "#17140E", ink: GOLD, mark: "seal", sizes: ONE },
  { sku: "snt-flag-standard", name: "The Standard Flag", price: 44, persona: "sentinel", category: "flag", tagline: "Wall standard", note: "Single-sided, grommeted", blurb: "Wall standard for the war room.", description: "A single-sided wall flag bearing the TABOR seal and wordmark, grommeted for hanging. Fly the standard over the place you train, game, and pray.", tone: "#121216", ink: GOLD, mark: "seal", featured: true },
  { sku: "snt-sticker-pack", name: "Sigil Sticker Pack", price: 12, persona: "sentinel", category: "sticker", tagline: "Seal + wordmark", note: "Die-cut vinyl x6", blurb: "Six die-cut vinyl decals.", description: "Six die-cut weatherproof vinyl stickers: the seal, the wordmark, and the three lights. Mark your laptop, bottle, or rig.", tone: "#0F0F12", ink: GOLD, mark: "seal" },
  { sku: "snt-mug-dawn", name: "Dawn Watch Mug", price: 18, persona: "sentinel", category: "drinkware", tagline: "Seal, both sides", note: "11oz ceramic", blurb: "11oz ceramic for the morning.", description: "An 11oz ceramic mug marked with the seal on both sides. For the coffee before the climb.", tone: "#16140E", ink: GOLD, mark: "seal", sizes: ONE },

  // ── CRUSADER — iron, training, heavyweight ──
  { sku: "crs-hoodie-ascent", name: "Ascent Hoodie", price: 72, persona: "crusader", category: "apparel", tagline: "Tonal seal, gold cuff", note: "Brushed-back fleece", blurb: "Brushed-back fleece, tonal seal.", description: "A heavyweight brushed-back fleece hoodie with a tonal seal at the chest and a gold cuff mark. Built to be trained in and punished. The Crusader's second skin.", tone: "#121216", ink: GOLD, mark: "seal", sizes: TEE, featured: true },
  { sku: "crs-joggers-forge", name: "Forge Joggers", price: 64, persona: "crusader", category: "apparel", tagline: "Cuff wordmark", note: "Tapered heavyweight", blurb: "Tapered heavyweight joggers.", description: "Tapered heavyweight joggers with the wordmark at the cuff. Cut for movement, weighted for the cold of the early session.", tone: "#14140F", ink: "#E8E2D5", mark: "word", sizes: TEE },
  { sku: "crs-tee-iron", name: "Iron Body Tee", price: 40, persona: "crusader", category: "apparel", tagline: "Train the temple", note: "Performance cotton", blurb: "Performance tee for the iron.", description: "A performance-cotton training tee. The body is a temple, so train it. Built to move and to soak the work.", tone: "#15151A", ink: GOLD, mark: "word", sizes: TEE },
  { sku: "crs-towel-gym", name: "Forge Gym Towel", price: 26, persona: "crusader", category: "towel", tagline: "Seal corner", note: "Woven cotton", blurb: "Woven gym towel, seal corner.", description: "A woven cotton gym towel with the seal at the corner. For the sweat of the climb. Sized for the bench and the bag.", tone: "#1A1410", ink: GOLD, mark: "seal", featured: true },
  { sku: "crs-beanie-cuff", name: "Watch Beanie", price: 28, persona: "crusader", category: "headwear", tagline: "Cuff seal", note: "Ribbed knit", blurb: "Ribbed cuffed beanie.", description: "A ribbed cuffed beanie with the seal stitched at the fold. For the cold walk to the early session.", tone: "#14140F", ink: GOLD, mark: "seal", sizes: ONE },
  { sku: "crs-flag-banner", name: "War Room Banner", price: 48, persona: "crusader", category: "flag", tagline: "Vertical banner", note: "Single-sided", blurb: "Vertical training banner.", description: "A vertical single-sided banner for the home gym or war room. The seal and creed, large. Hang it where the work happens.", tone: "#121012", ink: GOLD, mark: "seal" },

  // ── SCRIBE — word, wisdom, sacred detail ──
  { sku: "scr-crew-theosis", name: "Theosis Crewneck", price: 60, persona: "scribe", category: "apparel", tagline: "Greek inscription", note: "Premium loopback", blurb: "Premium crew with Greek inscription.", description: "A premium loopback crewneck carrying a quiet Greek inscription and the wordmark. Considered, sacred in its detail, made for the man who leans into the Word.", tone: "#101216", ink: "#9FB8C9", mark: "word", sizes: TEE, featured: true },
  { sku: "scr-tee-prov", name: "Iron Sharpens Tee", price: 40, persona: "scribe", category: "apparel", tagline: "Proverbs 27:17", note: "Black, scripture back", blurb: "Black tee, scripture back-print.", description: "A black tee with Proverbs 27:17 set across the back in a quiet serif. Iron sharpeneth iron. Wear the verse you live by.", tone: "#121214", ink: "#9FB8C9", mark: "word", sizes: TEE },
  { sku: "scr-journal-quest", name: "Quest Log Journal", price: 22, persona: "scribe", category: "stationery", tagline: "Daily quest log", note: "Hardcover, lined", blurb: "Hardcover quest log + scripture journal.", description: "A hardcover lined journal built as a daily quest log and scripture journal. Record the climb, the Word, and the work. Ribboned and seal-stamped.", tone: "#14140F", ink: GOLD, mark: "seal", featured: true },
  { sku: "scr-print-scripture", name: "Proverbs Wall Print", price: 30, persona: "scribe", category: "print", tagline: "Framed scripture", note: "Matte poster", blurb: "Matte scripture wall print.", description: "A matte wall print setting Proverbs 27:17 beneath the seal. For the study, the desk, or the wall you face when you rise.", tone: "#101216", ink: "#9FB8C9", mark: "seal" },
  { sku: "scr-candle-vigil", name: "Vigil Candle", price: 24, persona: "scribe", category: "candle", tagline: "Dawn watch", note: "Soy, printed label", blurb: "Soy candle for the dawn watch.", description: "A soy candle with a printed seal label, for the dawn watch and quiet prayer. Light it when you read.", tone: "#16140E", ink: GOLD, mark: "seal", sizes: ONE },
  { sku: "scr-cap-scribe", name: "Scribe Cap", price: 32, persona: "scribe", category: "headwear", tagline: "Tonal seal", note: "Unstructured dad cap", blurb: "Unstructured cap, tonal seal.", description: "An unstructured low-profile cap with a tonal seal. Quiet and considered, for the student of the Word.", tone: "#101216", ink: "#9FB8C9", mark: "seal", sizes: ONE },

  // ── PILGRIM — entry, everyday, the start ──
  { sku: "pil-tee-firstlight", name: "First Light Tee", price: 34, persona: "pilgrim", category: "apparel", tagline: "Small chest seal", note: "180gsm everyday", blurb: "Everyday tee, small chest seal.", description: "A 180gsm everyday tee with a small seal at the chest. The first piece of the journey. Light, clean, and easy to live in.", tone: "#15151A", ink: GOLD, mark: "seal", sizes: TEE, featured: true },
  { sku: "pil-hoodie-pilgrim", name: "Pilgrim Hoodie", price: 62, persona: "pilgrim", category: "apparel", tagline: "Small seal", note: "Midweight fleece", blurb: "Approachable midweight hoodie.", description: "A midweight fleece hoodie with a small seal at the chest. Approachable and warm, for the man at the start of the climb.", tone: "#15151A", ink: GOLD, mark: "seal", sizes: TEE },
  { sku: "pil-bottle-dawn", name: "Dawn Water Bottle", price: 30, persona: "pilgrim", category: "drinkware", tagline: "Etched seal", note: "Insulated steel 750ml", blurb: "Insulated 750ml steel bottle.", description: "A 750ml insulated steel water bottle with an etched seal. Keeps the cold through the session. Carry it from day one.", tone: "#16140E", ink: GOLD, mark: "seal", sizes: ONE, featured: true },
  { sku: "pil-blanket-watch", name: "Watch Blanket", price: 52, persona: "pilgrim", category: "blanket", tagline: "Woven seal", note: "Sherpa fleece", blurb: "Sherpa fleece throw, woven seal.", description: "A sherpa fleece throw with the seal woven in. Warmth for the watch, the couch, and the cold mornings of the early road.", tone: "#16140E", ink: GOLD, mark: "seal" },
  { sku: "pil-rug-ground", name: "Holy Ground Rug", price: 64, persona: "pilgrim", category: "rug", tagline: "Centered seal", note: "Chenille, dye-sub", blurb: "Chenille rug with centered seal.", description: "A dye-sublimated chenille rug with the seal centered. Ground for the floor you train and pray on. Take off your shoes; this is holy ground.", tone: "#14120E", ink: GOLD, mark: "seal" },
  { sku: "pil-sticker-firstlight", name: "First Light Sticker", price: 6, persona: "pilgrim", category: "sticker", tagline: "Seal decal", note: "Die-cut vinyl", blurb: "Single die-cut seal decal.", description: "A single die-cut weatherproof seal decal. The smallest first step. Mark something with the seal and begin.", tone: "#0F0F12", ink: GOLD, mark: "seal" },
];

// ── Accessors ─────────────────────────────────────────────────────────────────
export const productBySku = (sku: string) => PRODUCTS.find((p) => p.sku === sku);
export const productsByPersona = (id: string) => PRODUCTS.filter((p) => p.persona === id);
export const productsByCategory = (id: string) => PRODUCTS.filter((p) => p.category === id);
export const featuredProducts = () => PRODUCTS.filter((p) => p.featured);

/** Categories that actually have products in a given persona (for persona pages). */
export const categoriesInPersona = (id: string): Category[] =>
  CATEGORIES.filter((c) => PRODUCTS.some((p) => p.persona === id && p.category === c.id));

/**
 * "You may also like": same persona first, then same category, excluding self.
 * Used on product detail pages.
 */
export function suggestions(sku: string, limit = 4): Product[] {
  const p = productBySku(sku);
  if (!p) return [];
  const samePersona = PRODUCTS.filter((x) => x.sku !== sku && x.persona === p.persona);
  const sameCategory = PRODUCTS.filter((x) => x.sku !== sku && x.category === p.category && x.persona !== p.persona);
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const x of [...samePersona, ...sameCategory]) {
    if (seen.has(x.sku)) continue;
    seen.add(x.sku);
    out.push(x);
    if (out.length >= limit) break;
  }
  return out;
}
