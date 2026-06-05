// print-art.jsx — TABOR wearable graphic art (operational/techwear style) shown on garments
const G = "#C9A961";
const INK = "#E8E2D5";
const MUT = "#8A8378";
const mono = "'JetBrains Mono', monospace";

// halftone tonal fade (operational look)
function halftone(color, size = 5, op = 0.5) {
  return { backgroundImage: `radial-gradient(${color} ${size * 0.32}px, transparent ${size * 0.34}px)`, backgroundSize: `${size}px ${size}px`, opacity: op };
}
// grit/photocopy texture
const GRIT = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/></filter><rect width='100%25' height='100%25' filter='url(%23g)' opacity='0.18'/></svg>\")";

function Reg({ s, c = G }) { return <svg width="20" height="20" style={{ position: "absolute", ...s }}><circle cx="10" cy="10" r="7" fill="none" stroke={c} strokeWidth="0.7" /><line x1="10" y1="1" x2="10" y2="19" stroke={c} strokeWidth="0.7" /><line x1="1" y1="10" x2="19" y2="10" stroke={c} strokeWidth="0.7" /></svg>; }
function Bars({ w = 90, c = MUT }) { const seq = "10110111001011010011101"; return <svg width={w} height="18" viewBox={`0 0 ${seq.length * 3} 18`} preserveAspectRatio="none">{seq.split("").map((b, i) => b === "1" && <rect key={i} x={i * 3} width={i % 3 ? 1.3 : 2} height="18" fill={c} />)}</svg>; }

// ── THE HERO BACK-PRINT ARTWORK (the actual graphic) ──
function AscentArt({ scale = 1 }) {
  return (
    <div style={{ width: 300 * scale, position: "relative", color: INK, fontFamily: mono }}>
      {/* top register row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 7 * scale, letterSpacing: "0.18em", color: MUT, marginBottom: 8 * scale }}>
        <Reg s={{ position: "static" }} /><span>ISSUE 001 — SONS OF FIRE</span><span>REV.C</span>
      </div>
      {/* central emblem: coordinate ring + halftone mountain + three lights */}
      <div style={{ position: "relative", height: 220 * scale, display: "grid", placeItems: "center" }}>
        <svg width={260 * scale} height={220 * scale} viewBox="0 0 260 220" style={{ position: "absolute" }}>
          {/* broken coordinate ring */}
          <circle cx="130" cy="120" r="96" fill="none" stroke={G} strokeWidth="0.7" strokeDasharray="2 6" opacity="0.7" />
          <circle cx="130" cy="120" r="104" fill="none" stroke={G} strokeWidth="0.4" opacity="0.4" />
          {[0, 90, 180, 270].map(a => { const r = a * Math.PI / 180; return <line key={a} x1={130 + Math.cos(r) * 96} y1={120 + Math.sin(r) * 96} x2={130 + Math.cos(r) * 108} y2={120 + Math.sin(r) * 108} stroke={G} strokeWidth="1" />; })}
          {/* three lights */}
          {[[96, 52], [130, 40], [164, 52]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="3" fill="#F1DDA0" /><circle cx={x} cy={y} r="8" fill="none" stroke={G} strokeWidth="0.4" opacity="0.6" /></g>)}
          <line x1="96" y1="52" x2="130" y2="40" stroke={G} strokeWidth="0.4" opacity="0.5" /><line x1="130" y1="40" x2="164" y2="52" stroke={G} strokeWidth="0.4" opacity="0.5" />
          {/* mountain contour */}
          <path d="M58 186 L112 96 L142 130 L172 86 L226 186 Z" fill="none" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M78 186 L112 130 L142 150 L172 122 L206 186 Z" fill="none" stroke={G} strokeWidth="0.6" opacity="0.7" />
        </svg>
        {/* halftone fade behind mountain */}
        <div style={{ position: "absolute", bottom: 10 * scale, width: 168 * scale, height: 90 * scale, ...halftone(G, 4.4 * scale, 0.4), maskImage: "linear-gradient(to top, #000, transparent)", WebkitMaskImage: "linear-gradient(to top, #000, transparent)", clipPath: "polygon(20% 100%, 42% 30%, 55% 52%, 68% 22%, 88% 100%)" }} />
        {/* leader callouts */}
        <div style={{ position: "absolute", left: 0, top: 70 * scale, fontSize: 6.5 * scale, color: MUT, letterSpacing: "0.1em" }}>ELEV ▸<br />588M</div>
        <div style={{ position: "absolute", right: 0, top: 64 * scale, fontSize: 6.5 * scale, color: MUT, letterSpacing: "0.1em", textAlign: "right" }}>◂ MATT<br />17:1-9</div>
      </div>
      {/* big blackletter wordmark */}
      <div style={{ textAlign: "center", marginTop: -6 * scale }}>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 58 * scale, color: INK, lineHeight: 0.86 }}>Sons<span style={{ color: G }}>·</span>of<span style={{ color: G }}>·</span>Fire</div>
      </div>
      {/* coordinate + scripture bottom bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 * scale, marginTop: 12 * scale }}>
        <span style={{ fontSize: 8 * scale, color: G, letterSpacing: "0.1em" }}>32°41′N</span>
        <div style={{ flex: 1, height: 1, background: "rgba(201,169,97,0.4)" }} />
        <span style={{ fontSize: 8 * scale, color: G, letterSpacing: "0.1em" }}>35°23′E</span>
      </div>
      <div style={{ textAlign: "center", fontFamily: "var(--font-scripture)", fontStyle: "italic", fontSize: 11 * scale, color: "#CFC9BD", marginTop: 8 * scale }}>“Iron sharpeneth iron.”</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 * scale, fontSize: 6.5 * scale, color: MUT, letterSpacing: "0.14em" }}>
        <span>FORGED NOT BOUGHT</span><Bars w={64 * scale} /><span>HC-0001</span>
      </div>
    </div>
  );
}

// front chest hit
function ChestArt({ scale = 1 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * scale, fontFamily: mono, color: INK }}>
      <TaborIconSeal id="pa-chest" size={46 * scale} />
      <div>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 22 * scale, color: INK, lineHeight: 0.9 }}>Tabor</div>
        <div style={{ fontSize: 6 * scale, color: G, letterSpacing: "0.18em", marginTop: 2 }}>[ FORGED ]</div>
        <div style={{ fontSize: 6 * scale, color: MUT, letterSpacing: "0.1em" }}>32°41′N 35°23′E</div>
      </div>
    </div>
  );
}

// sleeve strip
function SleeveArt({ scale = 1 }) {
  return <div style={{ fontFamily: mono, fontSize: 7 * scale, color: G, letterSpacing: "0.32em", writingMode: "vertical-rl", textTransform: "uppercase" }}>SONS OF FIRE · 001</div>;
}

// ── garment flats with art applied ──
function GarmentFrame({ label, sub, children, art, artStyle, hoodie }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ width: 330, height: 380, background: "#0E0E12", border: "1px solid rgba(201,169,97,0.22)", position: "relative", overflow: "hidden", display: "grid", placeItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, ...halftone("#1c1c22", 6, 0.5) }} />
        {/* garment silhouette */}
        <svg width="300" height="330" viewBox="0 0 300 330" style={{ position: "absolute" }}>
          {hoodie ? (
            <>
              <path d="M96 56 C96 30 204 30 204 56 L250 84 L274 140 L240 158 L228 130 L228 312 L72 312 L72 130 L60 158 L26 140 L50 84 Z" fill="#17171c" stroke="#2a2a30" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M118 52 C130 78 170 78 182 52 L182 96 C170 110 130 110 118 96 Z" fill="#101015" stroke="#2a2a30" strokeWidth="1" />
              <line x1="138" y1="60" x2="138" y2="150" stroke="#2a2a30" strokeWidth="1" /><line x1="162" y1="60" x2="162" y2="150" stroke="#2a2a30" strokeWidth="1" />
              <rect x="96" y="210" width="108" height="46" rx="6" fill="none" stroke="#2a2a30" strokeWidth="1" />
            </>
          ) : (
            <>
              <path d="M104 50 L70 72 L40 120 L70 140 L82 116 L82 312 L218 312 L218 116 L230 140 L260 120 L230 72 L196 50 C184 70 160 78 150 78 C140 78 116 70 104 50 Z" fill="#17171c" stroke="#2a2a30" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M104 50 C116 70 140 78 150 78 C160 78 184 70 196 50" fill="none" stroke="#2a2a30" strokeWidth="1.2" />
            </>
          )}
        </svg>
        {/* art print area */}
        <div style={{ position: "relative", ...artStyle }}>{art}</div>
        <div style={{ position: "absolute", inset: 0, background: GRIT, mixBlendMode: "overlay", pointerEvents: "none", opacity: 0.5 }} />
      </div>
      <div style={{ fontFamily: mono, fontSize: 10, color: G, letterSpacing: "0.16em", marginTop: 12, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: mono, fontSize: 8, color: MUT, letterSpacing: "0.1em", marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function PrintArt() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 50% at 50% 0%, #16161a, #0a0a0a 60%)", padding: "44px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 36px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: G, letterSpacing: "0.3em" }}>[ WEARABLE GRAPHICS · DROP 001 ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, color: INK, margin: "8px 0 0", letterSpacing: "0.06em" }}>THE ART ON THE GEAR</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: MUT, maxWidth: 640, marginTop: 10, lineHeight: 1.6 }}>The actual print graphics, drawn in the operational / techwear language: halftone tonal fills, technical contour linework, coordinate rings, leader callouts, register marks and grit, fused with the blackletter wordmark and the mountain seal. Shown placed on the garments.</p>
      </div>

      {/* isolated hero artwork */}
      <div style={{ maxWidth: 1200, margin: "0 auto 30px" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: G, letterSpacing: "0.18em", marginBottom: 16 }}>◇ THE ASCENT — FULL BACK PRINT (ARTWORK)</div>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ background: "#0A0A0A", border: "1px solid rgba(201,169,97,0.22)", padding: "30px 40px", position: "relative" }}>
            <AscentArt scale={1} />
          </div>
          <div style={{ maxWidth: 280, fontFamily: "var(--font-body)", fontSize: 13, color: "#9A948A", lineHeight: 1.65 }}>
            <p style={{ margin: "0 0 12px" }}>The hero graphic. The mountain of the Transfiguration as a technical schematic: halftone tonal mass, contour linework, the three lights ringed and wired, coordinate annotations.</p>
            <p style={{ margin: 0 }}>Blackletter <strong style={{ color: INK }}>Sons of Fire</strong> anchors it; scripture and the Mount Tabor coordinates close it out. One-color screenprint, bone or gold on black.</p>
          </div>
        </div>
      </div>

      {/* on garments */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 36, justifyContent: "center", maxWidth: 1320, margin: "0 auto" }}>
        <GarmentFrame label="Tee · Full Back" sub="THE ASCENT · 1-COLOR SCREENPRINT" art={<AscentArt scale={0.78} />} artStyle={{ marginTop: 4 }} />
        <GarmentFrame label="Tee · Front Chest" sub="SEAL HIT · LEFT CHEST" art={<div style={{ marginRight: 120, marginBottom: 150 }}><ChestArt scale={0.9} /></div>} artStyle={{}} />
        <GarmentFrame label="Hoodie · Front" sub="CHEST SEAL + COORD" hoodie art={<div style={{ marginBottom: 40, textAlign: "center" }}><TaborIconSeal id="pa-hood" size={64} /><div style={{ fontFamily: mono, fontSize: 7, color: G, letterSpacing: "0.28em", marginTop: 8 }}>SONS OF FIRE</div></div>} artStyle={{}} />
        <GarmentFrame label="Long-Sleeve · Arm" sub="SLEEVE STRIP" art={<div style={{ marginLeft: 210, height: 180 }}><SleeveArt scale={1.4} /></div>} artStyle={{}} />
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<PrintArt />);
