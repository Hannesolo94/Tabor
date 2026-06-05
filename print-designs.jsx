// print-designs.jsx — TABOR operational / technical blueprint print graphics
const G = "#C9A961";
const INK = "#E8E2D5";
const MUT = "#8A8378";
const mono = "'JetBrains Mono', monospace";

// ── shared operational atoms ──
function CropMarks() {
  const m = (st) => <span style={{ position: "absolute", ...st }}><svg width="22" height="22"><path d={st.d} stroke={G} strokeWidth="1" fill="none" /></svg></span>;
  return (
    <>
      {[["top", 8, "left", 8, "M0 8 H8 V0"], ["top", 8, "right", 8, "M22 8 H14 V0"], ["bottom", 8, "left", 8, "M0 14 H8 V22"], ["bottom", 8, "right", 8, "M22 14 H14 V22"]].map(([vy, vyv, vx, vxv, d], i) => (
        <span key={i} style={{ position: "absolute", [vy]: vyv, [vx]: vxv, width: 22, height: 22, pointerEvents: "none" }}><svg width="22" height="22"><path d={d} stroke={G} strokeWidth="0.8" fill="none" opacity="0.7" /></svg></span>
      ))}
    </>
  );
}
function RegMark({ style }) {
  return <svg width="26" height="26" style={{ position: "absolute", ...style }}><circle cx="13" cy="13" r="9" fill="none" stroke={G} strokeWidth="0.8" /><line x1="13" y1="1" x2="13" y2="25" stroke={G} strokeWidth="0.8" /><line x1="1" y1="13" x2="25" y2="13" stroke={G} strokeWidth="0.8" /></svg>;
}
function Bars({ w = 120, color = G }) {
  const seq = "1011011100101101001110110101";
  return <svg width={w} height="26" viewBox={`0 0 ${seq.length * 3} 26`} preserveAspectRatio="none">{seq.split("").map((b, i) => b === "1" && <rect key={i} x={i * 3} y="0" width={i % 3 ? 1.4 : 2.2} height="26" fill={color} />)}</svg>;
}
function SpecRow({ k, v }) {
  return <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(201,169,97,0.18)", padding: "4px 0", fontFamily: mono, fontSize: 8.5, letterSpacing: "0.08em" }}><span style={{ color: MUT }}>{k}</span><span style={{ color: INK }}>{v}</span></div>;
}
// generic print board: fixed ratio, crop marks, header/footer plate
function Board({ w = 420, h = 540, code, title, children, ground = "#0A0A0A" }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ width: w, height: h, background: ground, position: "relative", overflow: "hidden", border: "1px solid rgba(201,169,97,0.25)" }}>
        <CropMarks />
        {/* top plate */}
        <div style={{ position: "absolute", top: 14, left: 18, right: 18, display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 8, letterSpacing: "0.16em", color: MUT }}>
          <span>TABOR · OPS DIV.</span><span>{code}</span>
        </div>
        {children}
        {/* bottom plate */}
        <div style={{ position: "absolute", bottom: 14, left: 18, right: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: mono, fontSize: 8, letterSpacing: "0.14em", color: MUT }}>
          <span>SONS OF FIRE</span><Bars w={70} color={MUT} /><span>32°41′N 35°23′E</span>
        </div>
      </div>
      <div style={{ fontFamily: mono, fontSize: 10, color: G, letterSpacing: "0.16em", marginTop: 12, textTransform: "uppercase" }}>{title}</div>
    </div>
  );
}

// ── DESIGN 01 · Technical Seal schematic ──
function D01() {
  return (
    <Board code="DWG-001 / REV.C" title="01 · Technical Seal">
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ position: "relative" }}>
          {/* crosshair behind */}
          <svg width="280" height="280" style={{ position: "absolute", top: -40, left: -40 }}>
            <line x1="140" y1="0" x2="140" y2="280" stroke={G} strokeWidth="0.4" opacity="0.4" />
            <line x1="0" y1="140" x2="280" y2="140" stroke={G} strokeWidth="0.4" opacity="0.4" />
            <circle cx="140" cy="140" r="120" fill="none" stroke={G} strokeWidth="0.4" opacity="0.4" strokeDasharray="3 4" />
            {[0, 90, 180, 270].map(a => { const r = a * Math.PI / 180; return <line key={a} x1={140 + Math.cos(r) * 110} y1={140 + Math.sin(r) * 110} x2={140 + Math.cos(r) * 124} y2={140 + Math.sin(r) * 124} stroke={G} strokeWidth="0.8" />; })}
          </svg>
          <TaborIconSeal id="pd-01" size={200} />
          {/* leader callouts */}
          {[["TOP RIGHT", -30, 210, "GOLD-LEAF · PMS 871C"], ["RIGHT", 230, 90, "MOUNTAIN OF TRANSFIGURATION"], ["BOTTOM", 70, -34, "INSCRIPTION · CINZEL 600"]].map(([pos, x, yb, label], i) => (
            <div key={i} style={{ position: "absolute", ...(yb >= 0 ? { bottom: yb } : { top: -yb }), ...(x >= 200 ? { left: x } : { left: x }), fontFamily: mono, fontSize: 7.5, letterSpacing: "0.1em", color: MUT, whiteSpace: "nowrap" }}>
              <span style={{ color: G }}>◄ </span>{label}
            </div>
          ))}
        </div>
      </div>
      <RegMark style={{ top: 40, right: 22 }} />
    </Board>
  );
}

// ── DESIGN 02 · Spec-sheet back print ──
function D02() {
  return (
    <Board code="BACK-PRT / 02" title="02 · Spec-Sheet Back Print">
      <div style={{ position: "absolute", top: 56, left: 24, right: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: MUT, letterSpacing: "0.16em" }}>FIG.02 — CREED PLATE</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: G, letterSpacing: "0.14em" }}>LOT HC-0001</span>
        </div>
        <h1 style={{ fontFamily: "'Pirata One', serif", fontSize: 76, color: INK, margin: "14px 0 0", lineHeight: 0.86 }}>Sons<br />of Fire</h1>
        <div style={{ display: "flex", gap: 6, alignItems: "center", margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: G }} /><span style={{ fontFamily: mono, fontSize: 7.5, color: G, letterSpacing: "0.2em" }}>◇ FORGED NOT BOUGHT ◇</span><div style={{ flex: 1, height: 1, background: G }} />
        </div>
        <div style={{ marginTop: 8 }}>
          <SpecRow k="CLASS" v="SENTINEL / SCRIBE / CRUSADER / PILGRIM" />
          <SpecRow k="RANK" v="RECRUIT → ASCENDED" />
          <SpecRow k="ISSUE" v="PROVERBS 27:17" />
          <SpecRow k="MAT." v="240GSM HEAVYWEIGHT COTTON" />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 44, left: 24, fontFamily: mono, fontSize: 7.5, color: MUT, letterSpacing: "0.14em" }}>SCREENPRINT · 1 COLOR · BONE ON BLACK</div>
    </Board>
  );
}

// ── DESIGN 03 · Garment tech pack (tee flat) ──
function D03() {
  return (
    <Board code="TECH-PACK / TEE" title="03 · Garment Tech Pack">
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <svg width="240" height="260" viewBox="0 0 240 260">
          {/* grid */}
          {Array.from({ length: 12 }).map((_, i) => <line key={"v" + i} x1={i * 20} y1="0" x2={i * 20} y2="260" stroke={G} strokeWidth="0.3" opacity="0.12" />)}
          {Array.from({ length: 13 }).map((_, i) => <line key={"h" + i} x1="0" y1={i * 20} x2="240" y2={i * 20} stroke={G} strokeWidth="0.3" opacity="0.12" />)}
          {/* tee flat outline */}
          <path d="M70 40 L40 60 L20 100 L44 116 L52 96 L52 220 L188 220 L188 96 L196 116 L220 100 L200 60 L170 40 C160 56 140 62 120 62 C100 62 80 56 70 40 Z" fill="none" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M70 40 C80 56 100 62 120 62 C140 62 160 56 170 40" fill="none" stroke={G} strokeWidth="1" />
          {/* seal placement at chest */}
          <circle cx="120" cy="108" r="16" fill="none" stroke={G} strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="120" y1="108" x2="120" y2="100" stroke={G} strokeWidth="0.5" /><line x1="120" y1="108" x2="120" y2="116" stroke={G} strokeWidth="0.5" /><line x1="112" y1="108" x2="128" y2="108" stroke={G} strokeWidth="0.5" />
          {/* dim lines */}
          <line x1="52" y1="234" x2="188" y2="234" stroke={G} strokeWidth="0.5" /><line x1="52" y1="230" x2="52" y2="238" stroke={G} strokeWidth="0.5" /><line x1="188" y1="230" x2="188" y2="238" stroke={G} strokeWidth="0.5" />
          <text x="120" y="246" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill={MUT} letterSpacing="1">52 CM</text>
        </svg>
      </div>
      <div style={{ position: "absolute", top: 56, right: 22, textAlign: "right", fontFamily: mono, fontSize: 7.5, color: MUT, letterSpacing: "0.1em", lineHeight: 2 }}>
        <div><span style={{ color: G }}>A ▸</span> SEAL · Ø45MM</div><div><span style={{ color: G }}>B ▸</span> EMBROIDERY TONAL</div><div><span style={{ color: G }}>C ▸</span> NECK LABEL WOVEN</div>
      </div>
    </Board>
  );
}

// ── DESIGN 04 · Coordinate stencil ──
function D04() {
  return (
    <Board code="STENCIL / 04" title="04 · Coordinate Stencil">
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px" }}>
        <div style={{ fontFamily: mono, fontSize: 8, color: G, letterSpacing: "0.2em", marginBottom: 14 }}>// ELEV. 588M · GALILEE</div>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 92, color: INK, lineHeight: 0.8, letterSpacing: "0.02em" }}>TABOR</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18 }}>
          <span style={{ fontFamily: mono, fontSize: 13, color: G, letterSpacing: "0.1em" }}>32°41′N</span>
          <div style={{ flex: 1, height: 1, background: "rgba(201,169,97,0.4)" }} />
          <span style={{ fontFamily: mono, fontSize: 13, color: G, letterSpacing: "0.1em" }}>35°23′E</span>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 22, fontFamily: mono, fontSize: 7.5, color: MUT, letterSpacing: "0.12em" }}>
          <span>[ THE TRANSFIGURATION ]</span><span>MATT 17:1-9</span>
        </div>
      </div>
      <RegMark style={{ bottom: 40, left: 22 }} />
    </Board>
  );
}

// ── DESIGN 05 · Exploded mountain ──
function D05() {
  return (
    <Board code="EXPLODED / 05" title="05 · Exploded Schematic">
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* three offset peak layers */}
          {[[0, "#8B6B22", 0.5], [20, G, 0.8], [40, "#F1DDA0", 1]].map(([dy, c, op], i) => (
            <g key={i} opacity={op} transform={`translate(0 ${-dy})`}>
              <path d="M60 220 L120 130 L150 162 L180 120 L240 220 Z" fill="none" stroke={c} strokeWidth={1.2} />
              <line x1="150" y1="220" x2="150" y2="232" stroke={c} strokeWidth="0.4" opacity="0.5" />
            </g>
          ))}
          {/* three lights */}
          {[[120, 92], [150, 78], [180, 92]].map(([x, y], i) => <circle key={i} cx={x} cy={y - 40} r="2.6" fill="#F1DDA0" />)}
          {/* leader labels */}
          <text x="250" y="140" fontFamily="JetBrains Mono" fontSize="7" fill={MUT} letterSpacing="1">◄ LAYER 03 · GLORY</text>
          <text x="250" y="180" fontFamily="JetBrains Mono" fontSize="7" fill={MUT} letterSpacing="1">◄ LAYER 02 · ASCENT</text>
          <text x="250" y="220" fontFamily="JetBrains Mono" fontSize="7" fill={MUT} letterSpacing="1">◄ LAYER 01 · BASE</text>
          <line x1="244" y1="138" x2="190" y2="120" stroke={G} strokeWidth="0.4" /><line x1="244" y1="178" x2="180" y2="150" stroke={G} strokeWidth="0.4" /><line x1="244" y1="218" x2="200" y2="200" stroke={G} strokeWidth="0.4" />
        </svg>
      </div>
    </Board>
  );
}

function PrintDesigns() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 50% at 50% 0%, #16161a, #0a0a0a 60%)", padding: "44px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto 36px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: G, letterSpacing: "0.3em" }}>[ PRINT · OPERATIONAL SERIES ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, color: INK, margin: "8px 0 0", letterSpacing: "0.06em" }}>TECHNICAL GRAPHICS · VOL.01</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: MUT, maxWidth: 620, marginTop: 10, lineHeight: 1.6 }}>Print designs in the operational / technical-blueprint language: garment tech packs, spec-sheet plates, coordinate stencils, registration marks, and exploded schematics. Built on the TABOR seal and Mount Tabor coordinates. Apply to tees, hoodies, hangtags, and lookbook pages.</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center", maxWidth: 1320, margin: "0 auto" }}>
        <D01 /><D02 /><D03 /><D04 /><D05 />
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<PrintDesigns />);
