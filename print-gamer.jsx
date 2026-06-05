// print-gamer.jsx — TABOR · Sacred Gamer crossover prompts (brand-safe, no foreign IP)
const { useState: useGS } = React;
const G = "#C9A961";
const INK = "#E8E2D5";
const MUT = "#8A8378";
const mono = "'JetBrains Mono', monospace";

// Corrected style block: explicit no-foreign-text / no-brand clause baked in.
const STYLE = "high-detail woodcut engraving illustration, dense cross-hatching and fine line shading, monochrome black-and-white line art on a pure black background, a single metallic Byzantine gold spot-color accent, sacred Orthodox iconography fused with video-game culture and premium streetwear, centered symmetrical composition, screen-print ready, very high contrast, in the tradition of Albrecht Durer and Gustave Dore engravings, no grayscale gradients, no photo realism, ABSOLUTELY NO TEXT, no lettering, no brand names, no logos, no watermark and no signature anywhere in the image";
const NEG = "no text, no lettering, no words, no brand name, no logo, no watermark, no signature, no caption, no 'operational industries', no photograph, no 3d render, no soft gradients, no copyrighted game characters, no recognizable game logos";
const PARAMS = "--ar 4:5 --style raw";

// Original gamer archetypes — evoke gaming culture WITHOUT any one franchise.
const C = [
  ["01", "The Respawn", "a fallen armored knight rising from the dust reborn in a column of golden light, resurrection as a checkpoint, a faint radiant halo above"],
  ["02", "Class Select", "four haloed warrior-saint archetypes lined up like a role-playing character roster, the guardian the scholar the crusader the pilgrim, each in distinct sacred armor"],
  ["03", "Status Window", "a translucent floating status panel rendered as an illuminated medieval manuscript page, sacred geometry borders, glowing golden runes and bars, held in the air"],
  ["04", "The Ashen Pilgrim", "a gaunt hooded undead wanderer kneeling before a sacred bonfire of golden flame, embers rising, a soulslike pilgrim at a holy fire"],
  ["05", "Controller Reliquary", "a game controller enshrined as a holy relic inside an ornate reliquary with a golden halo, venerated icon style"],
  ["06", "Pixel Halo Saint", "a haloed saint where the halo and light are rendered in blocky 8-bit pixel art while the figure is fine woodcut engraving, retro-sacred fusion, golden pixels"],
  ["07", "The Final Boss", "a colossal coiled dragon-serpent adversary reared over a small haloed knight-saint raising a cruciform sword, the great battle, golden eyes"],
  ["08", "Sacred Stat Bars", "three vertical stained-glass style health and mana bars built into a Gothic cathedral window, golden glowing fill, sacred RPG interface"],
  ["09", "Loot of Virtue", "the full armor of God arranged in a glowing inventory grid like an RPG loot screen, each piece in an engraved slot, golden item glow"],
  ["10", "The Save Point", "a lone knight kneeling at a glowing cross-shaped checkpoint shrine, golden light pillar, a moment of rest and saving grace"],
  ["11", "Co-op Brotherhood", "two armored warrior-saints standing back to back surrounded by foes, raising swords, no man climbs alone, golden halos joined"],
  ["12", "Rank Attained", "a sacred medal or relic descending in golden light over a kneeling knight, a ceremonial achievement unlocked, radiant rays"],
  ["13", "Arcade Shrine", "a retro arcade cabinet reimagined as a sacred altar shrine with candles and a golden icon screen, devotion and play fused"],
  ["14", "The Ascent Map", "a top-down dungeon and mountain level map drawn as an illuminated treasure map leading to a summit of golden light, sacred cartography"],
  ["15", "Mecha Crusader", "a towering armored mecha knight with a cruciform visor and a great sword, kneeling in prayer, golden energy halo, giant holy machine"],
  ["16", "The Quest Giver", "a robed haloed elder handing a glowing scroll quest to a young knight, an illuminated manuscript quest log, golden seal on the scroll"],
];

function buildPrompt(scene) { return `${scene}, ${STYLE}. ${PARAMS}`; }

function Card({ d }) {
  const [n, name, scene] = d;
  const [copied, setCopied] = useGS(false);
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

function Gamer() {
  const [copiedAll, setCopiedAll] = useGS(false);
  const copyAll = () => { const all = C.map(d => `${d[0]} ${d[1]}\n${buildPrompt(d[2])}`).join("\n\n"); navigator.clipboard?.writeText(all); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1600); };
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 50% at 50% 0%, #16161a, #0a0a0a 60%)", padding: "44px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 22px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: G, letterSpacing: "0.3em" }}>[ SACRED GAMER · CROSSOVER PROMPTS ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, color: INK, margin: "8px 0 0", letterSpacing: "0.06em" }}>GAMING × THE SACRED</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: MUT, maxWidth: 720, marginTop: 10, lineHeight: 1.6 }}>Gamer-culture archetypes fused with sacred iconography, in the same woodcut + gold direction. Built as <strong style={{ color: INK }}>original archetypes</strong> (respawn, class-select, status window, the ashen pilgrim) so they evoke gaming without copying any single franchise.</p>
      </div>

      {/* fixes + IP guidance */}
      <div style={{ maxWidth: 1200, margin: "0 auto 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ggrid2">
        <div style={{ border: "1px solid rgba(201,169,97,0.3)", background: "#0E0E12", padding: "16px 18px" }}>
          <div style={{ fontFamily: mono, fontSize: 8.5, color: G, letterSpacing: "0.16em", marginBottom: 8 }}>◇ FIX: NO MORE STRAY BRAND TEXT</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#B8B2A6", lineHeight: 1.55 }}>The "Operational Industries LLC" text appeared because their <strong style={{ color: INK }}>branded screenshot was the image reference</strong>. Don't reference their image. These prompts now carry an explicit no-text / no-brand clause, and a negative prompt below. In Artlist, also type <span style={{ color: G }}>"no text, no brand names"</span> in the With-no field.</div>
        </div>
        <div style={{ border: "1px solid rgba(122,31,31,0.4)", background: "#0E0E12", padding: "16px 18px" }}>
          <div style={{ fontFamily: mono, fontSize: 8.5, color: "#C03A3A", letterSpacing: "0.16em", marginBottom: 8 }}>⚠ GAME-IP: STAY ORIGINAL</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#B8B2A6", lineHeight: 1.55 }}>Don't sell merch using real game characters or logos (Elden Ring, Halo, Solo Leveling, Zelda, etc.) — it's infringement and risks the store. These archetypes evoke the <strong style={{ color: INK }}>feeling</strong> of those worlds while staying 100% yours.</div>
        </div>
      </div>

      {/* style + negative */}
      <div style={{ maxWidth: 1200, margin: "0 auto 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ggrid2">
        <div style={{ border: "1px solid rgba(201,169,97,0.25)", background: "#0E0E12", padding: "14px 16px" }}>
          <div style={{ fontFamily: mono, fontSize: 8.5, color: G, letterSpacing: "0.16em", marginBottom: 8 }}>SHARED STYLE BLOCK</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#B8B2A6", lineHeight: 1.5 }}>{STYLE}. {PARAMS}</div>
        </div>
        <div style={{ border: "1px solid rgba(122,31,31,0.35)", background: "#0E0E12", padding: "14px 16px" }}>
          <div style={{ fontFamily: mono, fontSize: 8.5, color: "#C03A3A", letterSpacing: "0.16em", marginBottom: 8 }}>NEGATIVE PROMPT</div>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#B8B2A6", lineHeight: 1.5 }}>{NEG}</div>
          <button onClick={copyAll} style={{ marginTop: 12, cursor: "pointer", fontFamily: mono, fontSize: 9.5, letterSpacing: "0.14em", color: copiedAll ? "#0A0A0A" : G, background: copiedAll ? G : "transparent", border: `1px solid ${G}88`, padding: "9px 14px" }}>{copiedAll ? "ALL COPIED ✓" : "COPY ALL PROMPTS"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, maxWidth: 1200, margin: "0 auto" }} className="ggrid">
        {C.map(d => <Card key={d[0]} d={d} />)}
      </div>
      <div style={{ maxWidth: 1200, margin: "26px auto 0", textAlign: "center", fontFamily: mono, fontSize: 9, color: "#6E6A60", letterSpacing: "0.12em", lineHeight: 1.8 }}>
        TIP: GENERATE B&W FIRST, ADD THE GOLD SPOT IN POST · KEEP ARCHETYPES ORIGINAL · DON'T REFERENCE OTHER BRANDS' IMAGES
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Gamer />);
