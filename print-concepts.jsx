// print-concepts.jsx — TABOR print concepts in the OI-adjacent woodcut style (for hand-render)
const G = "#C9A961";
const INK = "#E8E2D5";
const MUT = "#8A8378";
const mono = "'JetBrains Mono', monospace";

const sk = { fill: "none", stroke: INK, strokeWidth: 1.1, strokeLinejoin: "round", strokeLinecap: "round" };
const skG = { fill: "none", stroke: G, strokeWidth: 1, strokeLinejoin: "round", strokeLinecap: "round" };
const skF = { stroke: "#7A746A", strokeWidth: 0.7, strokeDasharray: "3 3", fill: "none" };

// arched blackletter headline (OI signature) via textPath
function ArchText({ id, text, r = 120, color = G, size = 22, flip }) {
  const d = flip ? `M ${150 - r} 150 A ${r} ${r} 0 0 0 ${150 + r} 150` : `M ${150 - r} 150 A ${r} ${r} 0 0 1 ${150 + r} 150`;
  return (
    <svg width="300" height="160" viewBox="0 0 300 160" style={{ position: "absolute", top: flip ? "auto" : 0, bottom: flip ? 0 : "auto", left: "50%", transform: "translateX(-50%)" }}>
      <defs><path id={id} d={d} /></defs>
      <text fontFamily="'Pirata One', serif" fontSize={size} fill={color} letterSpacing="1.5"><textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{text}</textPath></text>
    </svg>
  );
}

// ── concept illustration blocks (rough, suggestive — for hand-render) ──
function ITransfig() {
  return (
    <svg width="170" height="200" viewBox="0 0 170 200">
      <circle cx="85" cy="78" r="48" fill="none" stroke={G} strokeWidth="0.8" />
      {Array.from({ length: 16 }).map((_, i) => { const a = i * 22.5 * Math.PI / 180; return <line key={i} x1={85 + Math.cos(a) * 34} y1={78 + Math.sin(a) * 34} x2={85 + Math.cos(a) * 58} y2={78 + Math.sin(a) * 58} stroke={G} strokeWidth="0.5" opacity="0.7" />; })}
      <g {...sk}><path d="M85 44 a9 9 0 1 1 0.1 0" /><path d="M85 62 L85 112 M85 72 L66 94 M85 72 L104 94 M85 112 L73 146 M85 112 L97 146" /></g>
      <g {...skF}><path d="M46 86 a6 6 0 1 1 .1 0 M46 98 L46 138" /><path d="M124 86 a6 6 0 1 1 .1 0 M124 98 L124 138" /></g>
      <path d="M22 176 L66 132 L85 150 L104 132 L148 176 Z" {...sk} />
      <g {...skF}><circle cx="60" cy="184" r="6" /><circle cx="85" cy="190" r="6" /><circle cx="110" cy="184" r="6" /></g>
    </svg>
  );
}
function IAscent() {
  return (
    <svg width="170" height="200" viewBox="0 0 170 200">
      {[[71, 44], [85, 34], [99, 44]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={G} />)}
      <path d="M18 178 L70 66 L98 104 L130 54 L160 178 Z" {...sk} />
      {Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M${30 + i * 6} 178 Q85 ${150 - i * 16} ${150 - i * 6} 178`} fill="none" stroke={INK} strokeWidth="0.4" opacity="0.4" />)}
      <path d="M128 172 L80 148 L112 124 L74 102 L100 82" stroke={G} strokeWidth="1" fill="none" strokeDasharray="4 4" />
      <g {...sk}><circle cx="100" cy="74" r="4" /><path d="M100 78 L100 92 M100 82 L92 88 M100 82 L108 86 M100 92 L94 104 M100 92 L106 102" /></g>
    </svg>
  );
}
function IArmor() {
  return (
    <svg width="170" height="200" viewBox="0 0 170 200">
      <ellipse cx="85" cy="34" rx="18" ry="12" {...sk} />
      <path d="M62 66 L108 66 L102 110 L85 120 L68 110 Z" {...sk} />
      <path d="M46 134 L66 130 L68 170 L48 174 Z" {...sk} />
      <line x1="120" y1="104" x2="120" y2="186" {...skG} /><line x1="110" y1="120" x2="130" y2="120" {...skG} />
      <rect x="70" y="178" width="13" height="18" {...sk} /><rect x="88" y="178" width="13" height="18" {...sk} />
      {[[85, 34, "HELM"], [85, 88, "BREAST"], [56, 152, "SHIELD"], [120, 150, "SWORD"]].map(([x, y, l], i) => <g key={i}><line x1={x} y1={y} x2={150} y2={y} stroke={G} strokeWidth="0.3" opacity="0.5" /><text x="152" y={y + 3} fontFamily="JetBrains Mono" fontSize="5.5" fill={MUT}>{l}</text></g>)}
    </svg>
  );
}
function IWarrior() {
  return (
    <svg width="170" height="200" viewBox="0 0 170 200">
      <rect x="30" y="18" width="110" height="166" {...skF} />
      <circle cx="85" cy="74" r="30" fill="none" stroke={G} strokeWidth="1" />
      {Array.from({ length: 12 }).map((_, i) => { const a = i * 30 * Math.PI / 180; return <line key={i} x1={85 + Math.cos(a) * 30} y1={74 + Math.sin(a) * 30} x2={85 + Math.cos(a) * 36} y2={74 + Math.sin(a) * 36} stroke={G} strokeWidth="0.5" />; })}
      <g {...sk}><circle cx="85" cy="80" r="18" /><path d="M62 132 C62 106 108 106 108 132 L108 176 L62 176 Z" /></g>
      <line x1="118" y1="96" x2="118" y2="172" {...skG} /><line x1="108" y1="112" x2="128" y2="112" {...skG} />
      <text x="85" y="196" textAnchor="middle" fontFamily="Cinzel" fontWeight="600" fontSize="9" fill={G} letterSpacing="3">ΑΓΙΟΣ</text>
    </svg>
  );
}
function IIron() {
  return (
    <svg width="170" height="200" viewBox="0 0 170 200">
      <g {...sk}><path d="M40 50 L130 150 M34 56 L46 44 M130 150 L142 146 L138 158 Z" /><path d="M130 50 L40 150 M136 56 L124 44 M40 150 L28 146 L32 158 Z" /></g>
      {Array.from({ length: 10 }).map((_, i) => { const a = i * 36 * Math.PI / 180; return <line key={i} x1={85 + Math.cos(a) * 12} y1={100 + Math.sin(a) * 12} x2={85 + Math.cos(a) * 22} y2={100 + Math.sin(a) * 22} stroke={G} strokeWidth="0.9" />; })}
      <text x="85" y="186" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill={MUT} letterSpacing="1.5">PROV 27:17</text>
    </svg>
  );
}
function ISeal() {
  return (
    <svg width="170" height="200" viewBox="0 0 170 200">
      <circle cx="85" cy="92" r="56" fill="none" stroke={G} strokeWidth="1.2" /><circle cx="85" cy="92" r="48" fill="none" stroke={G} strokeWidth="0.5" />
      {Array.from({ length: 40 }).map((_, i) => { const a = i * 9 * Math.PI / 180; return <line key={i} x1={85 + Math.cos(a) * 52} y1={92 + Math.sin(a) * 52} x2={85 + Math.cos(a) * 56} y2={92 + Math.sin(a) * 56} stroke={G} strokeWidth="0.5" />; })}
      <path d="M52 120 L78 80 L92 100 L106 78 L124 120 Z" {...sk} />
      {[[78, 64], [92, 54], [106, 64]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill={G} />)}
      <path d="M40 158 Q85 174 130 158 L130 170 Q85 186 40 170 Z" {...skG} />
      <text x="85" y="169" textAnchor="middle" fontFamily="Cinzel" fontWeight="600" fontSize="6.5" fill={G} letterSpacing="2">SONS OF FIRE</text>
    </svg>
  );
}

const CONCEPTS = [
  { n: "01", arch: "Transfiguration", archB: "Sons of Fire", I: ITransfig, place: "FULL BACK · B&W + GOLD",
    subject: "Christ atop Mount Tabor in uncreated light, Moses and Elijah flanking, three disciples shielding their eyes below. Our namesake moment.",
    draw: "Dense engraving / woodcut after the Byzantine icon, but framed by OUR radiant gold halo and coordinate ring, not a square icon panel. Light rays as fine gold hatch. Keep composition distinctly ours.",
    refs: "Byzantine icon · Doré · woodcut hatching" },
  { n: "02", arch: "Answer the Call", archB: "Forged Not Bought", I: IAscent, place: "FULL BACK or LARGE FRONT",
    subject: "A lone pilgrim climbing a switchback path up the mountain toward the three lights at the summit. The daily climb, in one image.",
    draw: "Woodcut figure + topographic contour mountain. Heavy black mass with carved white highlights. Gold spot only on the three lights and the path. Elevation + coordinate annotations engraved in.",
    refs: "Mountaineering plates · survey maps · woodcut" },
  { n: "03", arch: "Armor of God", archB: "Ephesians VI", I: IArmor, place: "FULL BACK",
    subject: "The full armor of God as an exploded technical diagram: helm, breastplate, shield, sword, belt, boots, separated with leader-line labels.",
    draw: "Engraving meets operational schematic, our most 'OI-tactical' concept. Each piece rendered in detailed woodcut, then wired with clean gold callout lines. Latin + English labels.",
    refs: "Field-manual diagrams · patent plates · engraving" },
  { n: "04", arch: "Show No Fear", archB: "Tabor Brotherhood", I: IWarrior, place: "CHEST or BACK PANEL",
    subject: "A half-figure warrior-saint, haloed, gripping the sword of the Spirit, framed like an icon panel with Greek inscription.",
    draw: "Hand-engraved icon with stipple + cross-hatch modelling. Gold leaf halo flat. Solemn, weighty, high-contrast. Reads strong even small.",
    refs: "Orthodox icon · engraved holy cards · stipple" },
  { n: "05", arch: "Iron Sharpens Iron", archB: "Hold the Line", I: IIron, place: "SLEEVE · YOKE · FRONT",
    subject: "Two crossed blades striking sparks at the cross-point. Proverbs 27:17. Brotherhood and accountability as one mark.",
    draw: "Bold blackwork engraving, dramatic spark burst in fine gold lines. Minimal, high contrast, scales down to a sleeve hit.",
    refs: "Heraldic crest · tattoo flash · blackwork" },
  { n: "06", arch: "Sealed", archB: "32°41′N 35°23′E", I: ISeal, place: "CHEST · HANGTAG · PATCH",
    subject: "The mountain seal as a hand-engraved heraldic coin: beaded ring, three lights, restrained banner reading Sons of Fire.",
    draw: "Fine coin / intaglio engraving. Tight hatch relief on the mountain, beaded border, scrollwork banner. The premium small-scale mark.",
    refs: "Coin & seal engraving · currency line-art" },
];

function ConceptCard({ c }) {
  const I = c.I;
  return (
    <div style={{ border: "1px solid rgba(201,169,97,0.22)", background: "#0E0E12" }}>
      {/* tee-graphic preview (OI layout: arched type + centered illustration + arched base) */}
      <div style={{ background: "#0A0A0A", position: "relative", height: 320, display: "grid", placeItems: "center", borderBottom: "1px solid rgba(201,169,97,0.18)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 8, left: 10, fontFamily: mono, fontSize: 7, color: MUT, letterSpacing: "0.14em" }}>CONCEPT {c.n}</div>
        <div style={{ position: "absolute", top: 8, right: 10, fontFamily: mono, fontSize: 6.5, color: G, letterSpacing: "0.1em" }}>WOODCUT · FOR HAND-RENDER</div>
        <div style={{ position: "relative", width: 300, height: 300, display: "grid", placeItems: "center" }}>
          <ArchText id={`a-${c.n}`} text={c.arch} color={G} size={24} r={132} />
          <I />
          <ArchText id={`b-${c.n}`} text={c.archB} color={MUT} size={14} r={132} flip />
        </div>
      </div>
      <div style={{ padding: "16px 18px" }}>
        <div style={{ fontFamily: mono, fontSize: 8, color: G, letterSpacing: "0.16em", marginBottom: 10 }}>PLACEMENT ▸ {c.place}</div>
        <Brief k="SUBJECT" v={c.subject} />
        <Brief k="HOW TO DRAW" v={c.draw} />
        <Brief k="REFERENCES" v={c.refs} accent />
      </div>
    </div>
  );
}
function Brief({ k, v, accent }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ fontFamily: mono, fontSize: 7.5, color: G, letterSpacing: "0.16em", marginBottom: 3 }}>{k}</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: accent ? MUT : "#B8B2A6", lineHeight: 1.5 }}>{v}</div>
    </div>
  );
}

function Concepts() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 50% at 50% 0%, #16161a, #0a0a0a 60%)", padding: "44px 24px 80px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto 28px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: G, letterSpacing: "0.3em" }}>[ PRINT CONCEPTS · DROP 001 ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, color: INK, margin: "8px 0 0", letterSpacing: "0.06em" }}>GRAPHIC CONCEPTS FOR HAND-RENDER</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: MUT, maxWidth: 680, marginTop: 10, lineHeight: 1.6 }}>Six directions for the first drop, in the dense woodcut / engraving language: arched blackletter headline, a centered illustration on black, a base lockup. Each is a rough concept plus an artist brief, meant to be <strong style={{ color: INK }}>handed to an illustrator to render properly</strong>.</p>
      </div>

      {/* direction / differentiation note */}
      <div style={{ maxWidth: 1180, margin: "0 auto 30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="cgrid">
        <div style={{ border: "1px solid rgba(201,169,97,0.3)", background: "#0E0E12", padding: "18px 20px" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: G, letterSpacing: "0.18em", marginBottom: 10 }}>◇ ADOPT (THE GENRE)</div>
          {["Dense woodcut / engraving illustration, B&W on black", "Arched blackletter headline over the art", "One centered hero print, small chest hit + sleeve", "Sacred and tactical subjects rendered in fine linework"].map((t, i) => <div key={i} style={{ display: "flex", gap: 8, fontFamily: "var(--font-body)", fontSize: 12.5, color: "#B8B2A6", padding: "3px 0", lineHeight: 1.4 }}><span style={{ color: G }}>▸</span>{t}</div>)}
        </div>
        <div style={{ border: "1px solid rgba(201,169,97,0.3)", background: "#0E0E12", padding: "18px 20px" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: G, letterSpacing: "0.18em", marginBottom: 10 }}>◇ DIFFERENTIATE (STAY TABOR)</div>
          {["Byzantine GOLD spot color, never their red", "Tone of ascent, light and the forge, not death and skulls", "Our mountain seal + Mount Tabor coordinate system woven in", "Brotherhood and hope, not nihilism"].map((t, i) => <div key={i} style={{ display: "flex", gap: 8, fontFamily: "var(--font-body)", fontSize: 12.5, color: "#B8B2A6", padding: "3px 0", lineHeight: 1.4 }}><span style={{ color: G }}>▸</span>{t}</div>)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, maxWidth: 1180, margin: "0 auto" }} className="cgrid3">
        {CONCEPTS.map(c => <ConceptCard key={c.n} c={c} />)}
      </div>
      <div style={{ maxWidth: 1180, margin: "30px auto 0", textAlign: "center", fontFamily: mono, fontSize: 9, color: "#6E6A60", letterSpacing: "0.14em" }}>HAND OFF TO ARTIST · ENGRAVING / WOODCUT / ICON LINEWORK · B&W + 1 GOLD SPOT · CENTERED ON BLACK</div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Concepts />);
