// print-catalogue.jsx — TABOR · 50 print concept directions (artist hand-off catalogue)
const G = "#C9A961";
const INK = "#E8E2D5";
const MUT = "#8A8378";
const mono = "'JetBrains Mono', monospace";

const CATS = {
  SACRED: { c: "#C9A961", glyph: (s) => <g stroke={s} strokeWidth="1.4" fill="none"><path d="M11 3 L11 19 M5 9 L17 9 M7 6 L15 6" /></g> },
  CLIMB: { c: "#C9A961", glyph: (s) => <path d="M2 18 L9 7 L12 11 L15 6 L20 18 Z" stroke={s} strokeWidth="1.2" fill="none" /> },
  FORGE: { c: "#C9A961", glyph: (s) => <path d="M11 2 C13 6 16 8 16 12 C16 16 14 19 11 19 C8 19 6 16 6 12 C6 10 8 9 8 7 C9.5 8 11 6 11 2Z" stroke={s} strokeWidth="1.2" fill="none" /> },
  BROTHER: { c: "#C9A961", glyph: (s) => <path d="M11 2 L19 5 L19 11 C19 16 11 20 11 20 C11 20 3 16 3 11 L3 5 Z" stroke={s} strokeWidth="1.2" fill="none" /> },
  TYPE: { c: "#C9A961", glyph: (s) => <g stroke={s} strokeWidth="1.3" fill="none"><path d="M5 6 L5 11 M5 6 L8 6 M5 8.5 L7.5 8.5" /><path d="M14 11 L14 6 M14 6 L17 6 L17 11" /></g> },
  TACTICAL: { c: "#C9A961", glyph: (s) => <g stroke={s} strokeWidth="1.1" fill="none"><circle cx="11" cy="11" r="7" /><path d="M11 1 L11 5 M11 17 L11 21 M1 11 L5 11 M17 11 L21 11" /></g> },
};

const DATA = [
  // SACRED · ICONOGRAPHY
  ["01", "SACRED", "The Transfiguration", "Christ in uncreated light atop Tabor, Moses & Elijah flanking, disciples below.", "Byzantine icon in woodcut, framed by our gold halo + coordinate ring.", "FULL BACK"],
  ["02", "SACRED", "Christ Pantocrator", "The all-ruler bust, hand raised in blessing, gospel book in hand.", "Frontal icon, stipple + hatch modelling, flat gold halo.", "BACK PANEL"],
  ["03", "SACRED", "The Archangel", "Winged archangel treading down the serpent, spear of light.", "Dynamic woodcut, our own composition (not OI's St. Michael).", "FULL BACK"],
  ["04", "SACRED", "Chi-Rho Monogram", "The ☧ monogram in a radiant halo with alpha & omega.", "Engraved monogram, beaded ring, gold spot on the loop.", "CHEST · BACK"],
  ["05", "SACRED", "Orthodox Cross Radiant", "Three-bar cross on the skull-hill, rays bursting behind.", "Bold blackwork cross, fine ray hatching in gold.", "FULL BACK"],
  ["06", "SACRED", "Pentecost · Tongues of Fire", "Flames descending on the gathered, the literal Sons of Fire.", "Woodcut crowd, gold flames only. Ties to the tagline.", "FULL BACK"],
  ["07", "SACRED", "Jacob's Ladder", "Angels ascending and descending a ladder to heaven.", "Vertical engraving, ladder as the climb motif.", "BACK · SLEEVE"],
  ["08", "SACRED", "The Burning Bush", "Bush aflame yet unconsumed, holy ground.", "Dense flame linework, gold fire, black mass.", "CHEST · BACK"],
  ["09", "SACRED", "Crown of Thorns + Halo", "Thorn crown ringing a radiant halo.", "Tight thorn engraving, gold halo behind.", "CHEST"],
  ["10", "SACRED", "The Good Shepherd", "Christ carrying the lamb across his shoulders.", "Icon-style woodcut, solemn, restrained.", "BACK PANEL"],
  ["11", "SACRED", "Lamb & Seven Seals", "The slain Lamb upon the scroll of seven seals.", "Apocalyptic engraving, gold seals.", "FULL BACK"],
  ["12", "SACRED", "Theotokos of the Sign", "Mother of God, hands raised, Christ-child in medallion.", "Frontal icon, flat gold, hierarchical scale.", "BACK PANEL"],

  // THE CLIMB · MOUNTAIN
  ["13", "CLIMB", "The Ascent", "Lone pilgrim climbing the switchback toward the three lights.", "Woodcut figure + topographic mountain, gold path.", "FULL BACK"],
  ["14", "CLIMB", "Mount Tabor Survey", "Topographic map of Tabor with grid, elevation, coordinates.", "Pure contour linework, operational annotation.", "BACK · SLEEVE"],
  ["15", "CLIMB", "Summit Cross at Dawn", "Cross planted at the peak, sun breaking behind.", "Heavy black peak, gold sunburst hatch.", "FULL BACK"],
  ["16", "CLIMB", "The Three Lights", "The three lights of the Transfiguration, abstracted into geometry.", "Minimal sacred geometry + gold dots.", "CHEST"],
  ["17", "CLIMB", "The Narrow Path", "Strait gate and narrow road winding upward.", "Engraved landscape, gold path line.", "BACK"],
  ["18", "CLIMB", "Pilgrim & Staff", "Hooded pilgrim with staff, pack, resolute.", "Single woodcut figure, high contrast.", "FRONT · BACK"],
  ["19", "CLIMB", "Coordinate Stencil", "TABOR + 32°41′N 35°23′E in stencil type.", "Type-led, register marks, gold coords.", "BACK · SLEEVE"],
  ["20", "CLIMB", "Elevation 588M", "Elevation profile line of the mountain with data.", "Clinical line graph, mono labels.", "SLEEVE · HEM"],

  // THE FORGE · IRON
  ["21", "FORGE", "Iron Sharpens Iron", "Two crossed blades striking sparks. Proverbs 27:17.", "Blackwork blades, gold spark burst.", "BACK · SLEEVE"],
  ["22", "FORGE", "Anvil & Hammer", "Hammer mid-strike on the anvil, sparks flying.", "Heavy engraving, gold sparks only.", "FULL BACK"],
  ["23", "FORGE", "Kettlebell Crest", "Kettlebell framed in a heraldic crest with banner.", "Crest engraving, gold banner text.", "CHEST"],
  ["24", "FORGE", "Forged in Fire", "Hand drawing a glowing blade from the forge.", "Woodcut hand + gold heat glow.", "FULL BACK"],
  ["25", "FORGE", "The Tempered", "Sword plunged into flame, rank name beneath.", "Engraved sword, gold flame.", "BACK"],
  ["26", "FORGE", "Body is a Temple", "Athletic figure framed by temple columns.", "Classical engraving meets anatomy plate.", "FULL BACK"],
  ["27", "FORGE", "Break the Chains", "Wrists snapping a chain, discipline as freedom.", "High-contrast woodcut, gold break-point.", "BACK · CHEST"],
  ["28", "FORGE", "Dawn Reps", "Silhouette training as the sun rises over the peak.", "Black figure, gold sunrise.", "BACK"],
  ["29", "FORGE", "Altar of Sweat", "Barbell laid across an altar, offering motif.", "Sacred + gym fusion engraving.", "FULL BACK"],
  ["30", "FORGE", "Sword of the Spirit", "Cruciform sword wrapped in scripture ribbon.", "Detailed blade engraving, gold ribbon text.", "BACK · SLEEVE"],

  // BROTHERHOOD · WAR
  ["31", "BROTHER", "Iron Brotherhood", "Two forearms gripping wrists, an oath.", "Tight muscle engraving, gold cuff seal.", "CHEST · BACK"],
  ["32", "BROTHER", "The Guild Crest", "Full heraldic crest: shield, mountain, motto banner.", "Classical heraldry engraving, gold accents.", "FULL BACK"],
  ["33", "BROTHER", "Shield Wall", "Locked shields, a line that holds.", "Repeating engraved shields, one gold seal.", "BACK · HEM"],
  ["34", "BROTHER", "The Centurion Saint", "Armored saint-soldier, halo and shield.", "Icon + Roman armor woodcut.", "FULL BACK"],
  ["35", "BROTHER", "No Man Climbs Alone", "Roped climbers ascending in a line.", "Woodcut figures, gold rope.", "BACK"],
  ["36", "BROTHER", "The Watch", "Sentinel standing guard at the mountain gate.", "Lone figure, heavy shadow, gold lantern.", "BACK PANEL"],
  ["37", "BROTHER", "The Oath", "Clasped hands over an open Bible.", "Engraved hands, gold page edges.", "CHEST"],
  ["38", "BROTHER", "Band of Brothers", "Banner with crossed arms and the guild name.", "Banner engraving, gold lettering.", "SLEEVE · BACK"],

  // SCRIPTURE · TYPE-LED
  ["39", "TYPE", "Sons of Fire Slab", "Arched blackletter SONS OF FIRE over a flame ground.", "Pure type, gold flame fill.", "FULL BACK"],
  ["40", "TYPE", "Iron Sharpens Iron (type)", "Proverbs 27:17 as a typographic composition.", "Stacked mixed type, gold rule lines.", "BACK"],
  ["41", "TYPE", "Forged Not Bought", "Stencil-stamp slogan, military issue feel.", "Stencil type + register marks.", "CHEST · SLEEVE"],
  ["42", "TYPE", "Valley of the Shadow", "Psalm 23:4 set in dramatic serif over a dark vale.", "Type + minimal engraving.", "BACK"],
  ["43", "TYPE", "Vive Deo", "Latin 'Live for God' / Memento Mori counter.", "Engraved banner + small skull in gold.", "CHEST"],
  ["44", "TYPE", "Theosis Stack", "ΘΕΩΣΙΣ · TABOR · ΑΓΙΟΣ Greek inscription stack.", "Cinzel caps, gold, sacred restraint.", "BACK · SLEEVE"],
  ["45", "TYPE", "Die to Self", "Gothic slogan over an empty cross.", "Blackletter + fine cross engraving.", "BACK"],

  // TACTICAL · OPERATIONAL
  ["46", "TACTICAL", "Armor of God", "Exploded technical diagram of Ephesians 6 armor.", "Engraving + schematic callouts, gold leaders.", "FULL BACK"],
  ["47", "TACTICAL", "Brotherhood EDC", "Flat-lay: Bible, journal, dog-tags, cross, knife.", "Top-down engraving, gold tags.", "FULL BACK"],
  ["48", "TACTICAL", "The Sword Schematic", "Sword of the Spirit as a technical part drawing.", "Patent-plate linework, gold callouts.", "BACK · SLEEVE"],
  ["49", "TACTICAL", "Cross Compass", "Compass rose built from a cross, true-north faith.", "Navigational engraving, gold needle.", "CHEST · BACK"],
  ["50", "TACTICAL", "Issue 001 Stamp", "Ration-stamp 'TABOR BROTHERHOOD · ISSUE 001'.", "Stamped stencil block, barcode, gold seal.", "SLEEVE · HEM · TAG"],
];

const ORDER = ["SACRED", "CLIMB", "FORGE", "BROTHER", "TYPE", "TACTICAL"];
const LABELS = { SACRED: "Sacred · Iconography", CLIMB: "The Climb · Mountain", FORGE: "The Forge · Iron", BROTHER: "Brotherhood · War", TYPE: "Scripture · Type-Led", TACTICAL: "Tactical · Operational" };

function Card({ d }) {
  const [n, cat, name, subject, draw, place] = d;
  const cfg = CATS[cat];
  return (
    <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "14px 15px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
        <svg width="22" height="22" viewBox="0 0 22 22">{cfg.glyph(cfg.c)}</svg>
        <span style={{ fontFamily: mono, fontSize: 9, color: MUT, letterSpacing: "0.12em" }}>{n}</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: INK, lineHeight: 1.1 }}>{name}</span>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#B8B2A6", lineHeight: 1.45, marginBottom: 8 }}>{subject}</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: MUT, lineHeight: 1.45, marginBottom: 10 }}><span style={{ color: G, fontFamily: mono, fontSize: 7.5, letterSpacing: "0.14em" }}>DRAW ▸ </span>{draw}</div>
      <div style={{ marginTop: "auto", fontFamily: mono, fontSize: 7.5, color: G, letterSpacing: "0.12em", paddingTop: 8, borderTop: "1px solid rgba(201,169,97,0.12)" }}>{place}</div>
    </div>
  );
}

function Catalogue() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 50% at 50% 0%, #16161a, #0a0a0a 60%)", padding: "44px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 30px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: G, letterSpacing: "0.3em" }}>[ PRINT CONCEPT CATALOGUE · 50 DIRECTIONS ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, color: INK, margin: "8px 0 0", letterSpacing: "0.06em" }}>FIFTY GRAPHICS TO HAND-RENDER</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: MUT, maxWidth: 700, marginTop: 10, lineHeight: 1.6 }}>A working catalogue of fifty print directions, grouped by theme. Each is a tight brief: subject, how to draw it, and placement. All in the woodcut / engraving language, B&W on black with a single Byzantine-gold spot. Hand any of these to an illustrator to render properly. (The detailed visual blocking for the lead six lives in <strong style={{ color: INK }}>TABOR Print Concepts</strong>.)</p>
      </div>
      {ORDER.map(cat => {
        const items = DATA.filter(d => d[1] === cat);
        const cfg = CATS[cat];
        return (
          <div key={cat} style={{ maxWidth: 1200, margin: "0 auto 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <svg width="20" height="20" viewBox="0 0 22 22">{cfg.glyph(G)}</svg>
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 18, color: INK, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{LABELS[cat]}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: MUT }}>{String(items.length).padStart(2, "0")}</span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(201,169,97,0.4), transparent)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }} className="catgrid">
              {items.map(d => <Card key={d[0]} d={d} />)}
            </div>
          </div>
        );
      })}
      <div style={{ maxWidth: 1200, margin: "24px auto 0", textAlign: "center", fontFamily: mono, fontSize: 9, color: "#6E6A60", letterSpacing: "0.14em" }}>50 DIRECTIONS · WOODCUT / ENGRAVING / ICON LINEWORK · B&W + 1 GOLD SPOT · CENTERED ON BLACK</div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Catalogue />);
