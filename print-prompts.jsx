// print-prompts.jsx — TABOR · 50 AI art prompts (woodcut/engraving + gold direction)
const { useState: usePS } = React;
const G = "#C9A961";
const INK = "#E8E2D5";
const MUT = "#8A8378";
const mono = "'JetBrains Mono', monospace";

const STYLE = "high-detail woodcut engraving illustration, dense cross-hatching and fine line shading, monochrome black-and-white line art on a pure black background, a single metallic Byzantine gold spot-color accent, sacred Orthodox iconography fused with premium streetwear, centered symmetrical composition, screen-print ready, very high contrast, in the tradition of Albrecht Durer and Gustave Dore engravings, no grayscale gradients, no photo realism";
const NEG = "no photograph, no 3d render, no soft gradients, no blur, no neon, no modern brand logos, no extra text, no watermark, no frame border";
const PARAMS = "--ar 4:5 --style raw";

// [n, name, scene]
const C = [
  ["01", "The Transfiguration", "Jesus Christ standing transfigured in radiant uncreated light atop Mount Tabor, Moses and Elijah flanking him, three disciples shielding their eyes on the rocks below, a golden radiant halo and circular coordinate ring behind"],
  ["02", "Christ Pantocrator", "a frontal bust of Christ Pantocrator, right hand raised in blessing, jeweled gospel book in the left, flat golden halo with a cross"],
  ["03", "The Archangel", "a powerful winged archangel descending with a spear of light, treading a coiled serpent underfoot, wings spread wide"],
  ["04", "Chi-Rho Monogram", "the Chi-Rho christogram monogram inside a radiant halo, alpha and omega letters beside it, beaded circular border"],
  ["05", "Orthodox Cross Radiant", "a three-bar Orthodox cross planted on the hill of the skull, sunbeam rays bursting behind it"],
  ["06", "Pentecost Tongues of Fire", "tongues of golden flame descending upon a gathered band of men, the moment of Pentecost, sons of fire"],
  ["07", "Jacob's Ladder", "a tall ladder rising into heaven with angels ascending and descending, a sleeping pilgrim at its foot"],
  ["08", "The Burning Bush", "a bush wreathed in golden flame yet unconsumed, rays of holiness, rocky holy ground"],
  ["09", "Crown of Thorns and Halo", "a crown of thorns encircling a radiant golden halo, sharp interwoven thorns"],
  ["10", "The Good Shepherd", "Christ the Good Shepherd carrying a lamb across his shoulders, staff in hand, solemn"],
  ["11", "Lamb and Seven Seals", "the slain sacrificial Lamb standing upon a scroll sealed with seven golden seals, apocalyptic"],
  ["12", "Theotokos of the Sign", "the Mother of God with hands raised in prayer, the Christ-child in a golden medallion at her breast, frontal icon"],
  ["13", "The Ascent", "a lone hooded pilgrim climbing a steep switchback mountain path toward three golden lights at the summit"],
  ["14", "Mount Tabor Survey", "a topographic survey map of a sacred mountain with contour lines, a grid, elevation marks and coordinates"],
  ["15", "Summit Cross at Dawn", "a wooden cross planted on a rocky summit with a golden sunrise bursting behind it"],
  ["16", "The Three Lights", "three radiant golden orbs of light arranged in sacred geometry above a minimal mountain peak"],
  ["17", "The Narrow Path", "a strait narrow gate opening onto a winding road climbing toward distant light, engraved landscape"],
  ["18", "Pilgrim and Staff", "a single resolute hooded pilgrim with a walking staff and travel pack, high-contrast woodcut"],
  ["19", "Coordinate Stencil", "bold stencil letters TABOR with the coordinates 32 41 N 35 23 E and registration marks, military issue stamp"],
  ["20", "Elevation 588M", "a clean elevation profile line graph of a mountain labeled 588M with technical annotations"],
  ["21", "Iron Sharpens Iron", "two crossed swords striking sparks at the point of contact, golden sparks bursting, Proverbs 27:17"],
  ["22", "Anvil and Hammer", "a blacksmith hammer striking a glowing blade on an anvil, golden sparks flying"],
  ["23", "Kettlebell Crest", "a kettlebell framed within a heraldic crest with a ribbon banner, engraved"],
  ["24", "Forged in Fire", "a muscular hand drawing a glowing sword from a blazing forge, golden heat glow"],
  ["25", "The Tempered", "a sword plunged into golden flame, engraved, ceremonial"],
  ["26", "Body is a Temple", "an athletic classical male figure framed by temple columns, anatomical engraving"],
  ["27", "Break the Chains", "two powerful wrists snapping an iron chain at its golden weak link, discipline as freedom"],
  ["28", "Dawn Reps", "a silhouette of a man training with the sunrise breaking golden over a mountain"],
  ["29", "Altar of Sweat", "a barbell laid across a stone sacrificial altar, an offering, sacred gym fusion"],
  ["30", "Sword of the Spirit", "a cruciform sword wrapped in a ribbon of scripture, detailed blade engraving, golden ribbon"],
  ["31", "Iron Brotherhood", "two muscular forearms gripping each other by the wrist in an oath of brotherhood, golden cuff seal"],
  ["32", "The Guild Crest", "a full heraldic coat of arms with a shield, a mountain, swords and a motto banner, engraved"],
  ["33", "Shield Wall", "a row of locked overlapping shields forming an unbroken wall, one golden seal at center"],
  ["34", "The Centurion Saint", "an armored Roman soldier-saint with a halo, holding a shield and spear, icon style"],
  ["35", "No Man Climbs Alone", "a roped line of climbers ascending a mountain ridge together, golden rope"],
  ["36", "The Watch", "a lone sentinel standing guard at a mountain gate at night, holding a golden lantern"],
  ["37", "The Oath", "two clasped hands resting upon an open Bible, golden page edges, engraved"],
  ["38", "Band of Brothers", "a banner with crossed arms gripping and a guild name, ribbon scroll, engraved"],
  ["39", "Sons of Fire Slab", "the words SONS OF FIRE in heavy arched blackletter over a field of golden flame"],
  ["40", "Iron Sharpens Iron Type", "a bold typographic composition of Proverbs 27 17 with golden rule lines, mixed engraved type"],
  ["41", "Forged Not Bought", "the stencil slogan FORGED NOT BOUGHT stamped with registration marks, military issue"],
  ["42", "Valley of the Shadow", "Psalm 23 verse set in dramatic serif type over a dark engraved valley"],
  ["43", "Vive Deo", "a Latin banner reading VIVE DEO above a small golden skull, memento mori engraving"],
  ["44", "Theosis Stack", "stacked Greek inscriptions THEOSIS TABOR AGIOS in golden Roman capitals, sacred minimal"],
  ["45", "Die to Self", "the gothic slogan DIE TO SELF beneath an empty wooden cross, fine engraving"],
  ["46", "Armor of God", "an exploded technical diagram of the full armor of God, helmet breastplate shield sword belt boots, golden callout lines and labels, Ephesians 6"],
  ["47", "Brotherhood EDC", "a top-down flat-lay of a Bible, a journal, dog tags, a cross and a knife, engraved, golden tags"],
  ["48", "The Sword Schematic", "the sword of the Spirit drawn as a technical patent part diagram with golden callouts"],
  ["49", "Cross Compass", "a compass rose built from a cross pointing to true north, navigational engraving, golden needle"],
  ["50", "Issue 001 Stamp", "a ration stamp reading TABOR BROTHERHOOD ISSUE 001 with a barcode and a golden wax seal, stencil block"],
];

function buildPrompt(scene) { return `${scene}, ${STYLE}. ${PARAMS}`; }

function PromptCard({ d }) {
  const [n, name, scene] = d;
  const [copied, setCopied] = usePS(false);
  const prompt = buildPrompt(scene);
  const copy = () => { navigator.clipboard?.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  return (
    <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "14px 15px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: MUT, letterSpacing: "0.12em" }}>{n}</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: INK }}>{name}</span>
        <button onClick={copy} style={{ marginLeft: "auto", cursor: "pointer", fontFamily: mono, fontSize: 8.5, letterSpacing: "0.12em", color: copied ? "#0A0A0A" : G, background: copied ? G : "transparent", border: `1px solid ${G}88`, padding: "5px 9px" }}>{copied ? "COPIED ✓" : "COPY"}</button>
      </div>
      <div style={{ fontFamily: mono, fontSize: 10.5, color: "#B8B2A6", lineHeight: 1.5, background: "#0A0A0A", border: "1px solid rgba(201,169,97,0.12)", padding: "10px 11px", flex: 1 }}>{prompt}</div>
    </div>
  );
}

function Prompts() {
  const [copiedAll, setCopiedAll] = usePS(false);
  const copyAll = () => { const all = C.map(d => `${d[0]} ${d[1]}\n${buildPrompt(d[2])}`).join("\n\n"); navigator.clipboard?.writeText(all); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1600); };
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 50% at 50% 0%, #16161a, #0a0a0a 60%)", padding: "44px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 24px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: G, letterSpacing: "0.3em" }}>[ AI ART PROMPTS · 50 ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, color: INK, margin: "8px 0 0", letterSpacing: "0.06em" }}>PROMPTS FOR AI GENERATION</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: MUT, maxWidth: 700, marginTop: 10, lineHeight: 1.6 }}>Each of the fifty concepts written as a ready-to-paste image prompt, engineered for the woodcut / engraving + Byzantine-gold direction. Works in Midjourney, DALL-E, Stable Diffusion, Firefly and others. Copy one, or copy all. Tune the shared style block below to taste.</p>
      </div>

      {/* shared style + controls */}
      <div style={{ maxWidth: 1200, margin: "0 auto 26px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pgrid2">
        <div style={{ border: "1px solid rgba(201,169,97,0.3)", background: "#0E0E12", padding: "16px 18px" }}>
          <div style={{ fontFamily: mono, fontSize: 8.5, color: G, letterSpacing: "0.16em", marginBottom: 8 }}>SHARED STYLE BLOCK (appended to every prompt)</div>
          <div style={{ fontFamily: mono, fontSize: 10.5, color: "#B8B2A6", lineHeight: 1.5 }}>{STYLE}. {PARAMS}</div>
        </div>
        <div style={{ border: "1px solid rgba(122,31,31,0.4)", background: "#0E0E12", padding: "16px 18px" }}>
          <div style={{ fontFamily: mono, fontSize: 8.5, color: "#C03A3A", letterSpacing: "0.16em", marginBottom: 8 }}>NEGATIVE PROMPT (for SD / tools that support it)</div>
          <div style={{ fontFamily: mono, fontSize: 10.5, color: "#B8B2A6", lineHeight: 1.5 }}>{NEG}</div>
          <button onClick={copyAll} style={{ marginTop: 12, cursor: "pointer", fontFamily: mono, fontSize: 9.5, letterSpacing: "0.14em", color: copiedAll ? "#0A0A0A" : G, background: copiedAll ? G : "transparent", border: `1px solid ${G}88`, padding: "9px 14px" }}>{copiedAll ? "ALL 50 COPIED ✓" : "COPY ALL 50 PROMPTS"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, maxWidth: 1200, margin: "0 auto" }} className="pgrid">
        {C.map(d => <PromptCard key={d[0]} d={d} />)}
      </div>
      <div style={{ maxWidth: 1200, margin: "26px auto 0", textAlign: "center", fontFamily: mono, fontSize: 9, color: "#6E6A60", letterSpacing: "0.12em", lineHeight: 1.8 }}>
        TIP: GENERATE B&W FIRST, THEN ADD THE GOLD SPOT IN POST FOR CLEAN SCREENPRINT SEPARATION.<br />USE AI FOR EXPLORATION · COMMISSION A REAL ARTIST FOR FINAL, PRINT-READY ART.
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Prompts />);
