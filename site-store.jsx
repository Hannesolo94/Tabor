// site-store.jsx — TABOR collections by persona + product data (Printful-ready)
const GOLD = "#C9A961";
const mono = "'JetBrains Mono', monospace";

// Brand personas drive the collections (the four classes).
const COLLECTIONS = [
  { id: "sentinel", name: "The Sentinel", tag: "The guardian", blurb: "Balanced, steady, holds the line. Clean staples for the man who shows up.", accent: "#C9A961" },
  { id: "crusader", name: "The Crusader", tag: "The fighter", blurb: "Strength and the iron. Heavyweight training gear built to be punished.", accent: "#A8843E" },
  { id: "scribe", name: "The Scribe", tag: "The student", blurb: "Wisdom and the Word. Quiet, considered pieces with sacred detail.", accent: "#9FB8C9" },
  { id: "pilgrim", name: "The Pilgrim", tag: "The seeker", blurb: "New to the climb. Entry pieces, every-day, the start of the journey.", accent: "#A88BC9" },
];

// Each product is tagged to a collection/persona and carries Printful binding attrs.
const PRODUCTS = [
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

function ProductCard({ p, onAdd, big }) {
  return (
    <div data-printful-id={p.pfid} data-sku={p.sku} data-collection={p.collection} style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12" }}>
      <div style={{ position: "relative", aspectRatio: big ? "1/1" : "4/5", background: p.tone, display: "grid", placeItems: "center", overflow: "hidden", borderBottom: "1px solid rgba(201,169,97,0.18)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 11px, transparent 11px 22px)" }} />
        {p.mark === "seal" ? <TaborIconSeal id={"pc-" + p.sku} size={big ? 110 : 84} /> : <div style={{ fontFamily: "'Pirata One', serif", fontSize: big ? 50 : 38, color: p.ink, position: "relative" }}>Tabor</div>}
        <div style={{ position: "absolute", top: 10, left: 10, fontFamily: mono, fontSize: 7.5, letterSpacing: "0.14em", color: p.ink, opacity: 0.6 }}>{p.tagline.toUpperCase()}</div>
      </div>
      <div style={{ padding: "14px 15px" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "#E8E2D5" }}>{p.name}</div>
        <div style={{ fontFamily: mono, fontSize: 9, color: "#7A746A", letterSpacing: "0.1em", marginTop: 3 }}>{p.note.toUpperCase()}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontFamily: mono, fontSize: 15, color: GOLD }}>${p.price}</span>
          <button onClick={() => onAdd(p)} style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "8px 13px", cursor: "pointer", textTransform: "uppercase" }}>Add to Bag</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { COLLECTIONS, PRODUCTS, ProductCard, GOLD, MONO: mono });
