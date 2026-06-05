// patterns.jsx — Pattern library: 11 reusable motifs
// 4 Sacred · 3 Tactical · 3 Streetwear · 1 Hybrid

function PatternTile({ kind, name, code, children, dark = true }) {
  return (
    <div style={{
      width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background: dark ? "#0A0A0A" : "#E8E2D5", color: dark ? "var(--holy-ivory)" : "#2A1F10",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"10px 14px", borderBottom: `1px solid ${dark?"rgba(232,226,213,0.08)":"rgba(42,31,16,0.15)"}`,
      }}>
        <span style={{
          fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.22em",
          color:"var(--holy-gold)", textTransform:"uppercase",
        }}>{`[ ${kind} ]`}</span>
        <span style={{
          fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.16em",
          color: dark?"rgba(232,226,213,0.5)":"rgba(42,31,16,0.5)", textTransform:"uppercase",
        }}>{code}</span>
      </div>
      <div style={{flex:1, display:"grid", placeItems:"center", padding:"20px"}}>
        {children}
      </div>
      <div style={{
        padding:"8px 14px", borderTop: `1px solid ${dark?"rgba(232,226,213,0.08)":"rgba(42,31,16,0.15)"}`,
        fontFamily:"var(--font-display)", fontWeight:900, textTransform:"uppercase",
        fontSize:13, letterSpacing:"0.06em",
        color: dark ? "var(--holy-ivory)" : "#2A1F10",
      }}>{name}</div>
    </div>
  );
}

// ───── SACRED ─────

function P_OrthodoxCross() {
  // Three-bar Orthodox cross
  return (
    <PatternTile kind="SACRED" name="Orthodox Cross" code="S01">
      <svg width="120" height="160" viewBox="0 0 120 160">
        <g stroke="#C9A961" strokeWidth="3" strokeLinecap="square">
          <line x1="60" y1="14" x2="60" y2="150"/>
          {/* top short bar (INRI) */}
          <line x1="44" y1="36" x2="76" y2="36"/>
          {/* main horizontal */}
          <line x1="28" y1="62" x2="92" y2="62"/>
          {/* slanted footrest */}
          <line x1="36" y1="98" x2="84" y2="86"/>
        </g>
        {/* halo behind */}
        <circle cx="60" cy="62" r="44" fill="none" stroke="#C9A961" strokeWidth="0.6" opacity="0.5"/>
        <circle cx="60" cy="62" r="36" fill="none" stroke="#C9A961" strokeWidth="0.3" opacity="0.35"/>
      </svg>
    </PatternTile>
  );
}

function P_ChiRho() {
  return (
    <PatternTile kind="SACRED" name="Chi-Rho" code="S02">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* halo */}
        <circle cx="60" cy="60" r="54" fill="none" stroke="#C9A961" strokeWidth="0.6" opacity="0.55"/>
        {/* Chi (X) */}
        <g stroke="#C9A961" strokeWidth="3.5" strokeLinecap="square">
          <line x1="30" y1="22" x2="90" y2="98"/>
          <line x1="90" y1="22" x2="30" y2="98"/>
        </g>
        {/* Rho (P) — vertical with loop */}
        <g stroke="#0A0A0A" strokeWidth="6">
          <line x1="60" y1="14" x2="60" y2="106"/>
        </g>
        <g stroke="#C9A961" strokeWidth="3.5">
          <line x1="60" y1="14" x2="60" y2="106"/>
          <path d="M60 18 c14 0 22 8 22 18 s-8 18 -22 18" fill="none"/>
        </g>
        <g stroke="#C9A961" strokeWidth="0.6" fill="none" opacity="0.6">
          <path d="M14 60 L36 60"/>
          <path d="M84 60 L106 60"/>
        </g>
      </svg>
    </PatternTile>
  );
}

function P_HaloGeometry() {
  return (
    <PatternTile kind="SACRED" name="Halo Geometry" code="S03">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <radialGradient id="hg-fill" cx="50%" cy="50%" r="55%">
            <stop offset="0%"  stopColor="#F1DDA0" stopOpacity="0.95"/>
            <stop offset="70%" stopColor="#C9A961" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="70" r="60" fill="url(#hg-fill)"/>
        {/* 12-point concentric structure */}
        <g stroke="#C9A961" strokeWidth="0.5" fill="none" opacity="0.55">
          <circle cx="70" cy="70" r="54"/>
          <circle cx="70" cy="70" r="44"/>
          <circle cx="70" cy="70" r="34"/>
          <circle cx="70" cy="70" r="24"/>
        </g>
        {Array.from({length:12}).map((_,i)=>{
          const a = (i*Math.PI*2)/12;
          const x1 = 70 + Math.cos(a)*24, y1 = 70 + Math.sin(a)*24;
          const x2 = 70 + Math.cos(a)*54, y2 = 70 + Math.sin(a)*54;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A961" strokeWidth="0.5" opacity="0.55"/>;
        })}
        {/* center cross */}
        <g stroke="#0A0A0A" strokeWidth="1.4">
          <line x1="70" y1="58" x2="70" y2="82"/>
          <line x1="58" y1="70" x2="82" y2="70"/>
        </g>
      </svg>
    </PatternTile>
  );
}

function P_SacredFrame() {
  return (
    <PatternTile kind="SACRED" name="Icon Frame" code="S04" dark={false}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* outer carved frame */}
        <rect x="6" y="6" width="148" height="148" fill="none" stroke="#5C3F12" strokeWidth="2"/>
        <rect x="14" y="14" width="132" height="132" fill="none" stroke="#8B6B22" strokeWidth="0.8"/>
        {/* arched inner panel */}
        <path d="M30 146 L30 60 Q30 30 80 30 Q130 30 130 60 L130 146 Z" fill="#0A0A0A" stroke="#C9A961" strokeWidth="0.8"/>
        {/* corner rosettes */}
        {[[14,14],[146,14],[14,146],[146,146]].map(([x,y],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="#C9A961"/>
            <circle cx={x} cy={y} r="1" fill="#0A0A0A"/>
          </g>
        ))}
        {/* inner cross */}
        <g stroke="#C9A961" strokeWidth="2">
          <line x1="80" y1="74" x2="80" y2="118"/>
          <line x1="64" y1="92" x2="96" y2="92"/>
        </g>
        <circle cx="80" cy="92" r="22" fill="none" stroke="#C9A961" strokeWidth="0.5" opacity="0.6"/>
      </svg>
    </PatternTile>
  );
}

// ───── TACTICAL ─────

function P_HUDBrackets() {
  return (
    <PatternTile kind="TACTICAL" name="HUD Brackets" code="T01">
      <div style={{position:"relative", width:180, height:120}}>
        <svg width="180" height="120" viewBox="0 0 180 120">
          <g stroke="#C9A961" strokeWidth="1.2" fill="none">
            <path d="M0 22 L0 0 L22 0"/>
            <path d="M180 22 L180 0 L158 0"/>
            <path d="M0 98 L0 120 L22 120"/>
            <path d="M180 98 L180 120 L158 120"/>
          </g>
          <g stroke="#C9A961" strokeWidth="1.5">
            <line x1="86" y1="0" x2="94" y2="0"/>
            <line x1="86" y1="120" x2="94" y2="120"/>
            <line x1="0" y1="56" x2="0" y2="64"/>
            <line x1="180" y1="56" x2="180" y2="64"/>
          </g>
        </svg>
        <div style={{
          position:"absolute", inset:0, display:"grid", placeItems:"center",
          fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)",
          letterSpacing:"0.32em",
        }}>[ STATUS ]</div>
      </div>
    </PatternTile>
  );
}

function P_GlowBorder() {
  return (
    <PatternTile kind="TACTICAL" name="Glow Panel" code="T02">
      <div style={{
        width:160, height:100,
        background:"rgba(20,22,30,0.6)",
        border:"1px solid rgba(201,169,97,0.5)",
        boxShadow:"inset 0 0 24px rgba(201,169,97,0.15), 0 0 28px rgba(201,169,97,0.2)",
        backdropFilter:"blur(6px)",
        display:"grid", placeItems:"center",
        position:"relative",
      }}>
        <div className="holy-system" style={{color:"var(--holy-gold)"}}>[RANK ATTAINED]</div>
        {/* corner ticks */}
        <svg style={{position:"absolute", inset:0, pointerEvents:"none"}} viewBox="0 0 160 100" preserveAspectRatio="none">
          <g stroke="#C9A961" strokeWidth="0.8" fill="none">
            <path d="M0 10 L4 10 M0 0 L10 0 M150 0 L160 0 M156 0 L156 10"/>
            <path d="M0 100 L10 100 M0 96 L0 100 M150 100 L160 100 M160 90 L160 100"/>
          </g>
        </svg>
      </div>
    </PatternTile>
  );
}

function P_Reticle() {
  return (
    <PatternTile kind="TACTICAL" name="Target Reticle" code="T03">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="58" fill="none" stroke="#C9A961" strokeWidth="0.6" opacity="0.4"/>
        <circle cx="70" cy="70" r="46" fill="none" stroke="#C9A961" strokeWidth="1" strokeDasharray="2 4"/>
        <circle cx="70" cy="70" r="28" fill="none" stroke="#C9A961" strokeWidth="1.2"/>
        <g stroke="#C9A961" strokeWidth="1.4">
          <line x1="70" y1="4" x2="70" y2="22"/>
          <line x1="70" y1="118" x2="70" y2="136"/>
          <line x1="4" y1="70" x2="22" y2="70"/>
          <line x1="118" y1="70" x2="136" y2="70"/>
        </g>
        <circle cx="70" cy="70" r="3" fill="#C9A961"/>
        <g stroke="#C9A961" strokeWidth="0.5" fill="none" opacity="0.7">
          {[15, 75, 135, 195, 255, 315].map(a => {
            const r=a*Math.PI/180;
            return <line key={a} x1={70+Math.cos(r)*46} y1={70+Math.sin(r)*46}
                              x2={70+Math.cos(r)*58} y2={70+Math.sin(r)*58}/>;
          })}
        </g>
      </svg>
    </PatternTile>
  );
}

// ───── STREETWEAR ─────

function P_IndustrialLabel() {
  return (
    <PatternTile kind="STREETWEAR" name="Industrial Label" code="X01">
      <div style={{width:200, transform:"rotate(-2deg)"}}>
        <div style={{
          background:"#E8E2D5", padding:"8px 12px", color:"#0A0A0A",
          display:"flex", justifyContent:"space-between",
          fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.2em",
          textTransform:"uppercase", fontWeight:600,
        }}>
          <span>SONS OF FIRE</span>
          <span>“01”</span>
        </div>
        <div style={{
          background:"#0A0A0A", color:"#E8E2D5", padding:"14px 12px",
          fontFamily:"var(--font-display)", fontWeight:900, fontSize:36,
          textTransform:"uppercase", letterSpacing:"-0.02em", lineHeight:0.9,
          borderTop:"3px solid #C9A961",
        }}>
          HOLY<span style={{color:"#C9A961"}}>.</span>
        </div>
        <div style={{
          background:"#E8E2D5", padding:"6px 12px", color:"#0A0A0A",
          display:"flex", justifyContent:"space-between",
          fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.18em",
        }}>
          <span>LOT  ·  HC0001</span>
          <span>BRTHRHD ®</span>
        </div>
      </div>
    </PatternTile>
  );
}

function P_GraffitiTag() {
  return (
    <PatternTile kind="STREETWEAR" name="Hand Tag" code="X02">
      <div style={{position:"relative", padding:"20px 8px"}}>
        <svg width="200" height="80" viewBox="0 0 200 80">
          <defs>
            <filter id="gt">
              <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2"/>
              <feDisplacementMap in="SourceGraphic" scale="2.5"/>
            </filter>
          </defs>
          <g filter="url(#gt)" fill="none" stroke="#E8E2D5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* H */}
            <path d="M14 14 L14 66 M14 40 L42 40 M42 14 L42 66"/>
            {/* O */}
            <path d="M52 40 c0-14 8-22 18-22 s18 8 18 22 -8 22 -18 22 -18 -8 -18 -22z"/>
            {/* L */}
            <path d="M98 14 L98 66 L122 66"/>
            {/* Y */}
            <path d="M130 14 L150 40 L170 14 M150 40 L150 66"/>
            {/* underline whip */}
            <path d="M8 72 q90 14 184 -2"/>
          </g>
          {/* cross spark */}
          <g stroke="#C9A961" strokeWidth="2" strokeLinecap="round">
            <line x1="180" y1="14" x2="180" y2="28"/>
            <line x1="173" y1="21" x2="187" y2="21"/>
          </g>
        </svg>
      </div>
    </PatternTile>
  );
}

function P_BrutalistDivider() {
  return (
    <PatternTile kind="STREETWEAR" name="Brutalist Divider" code="X03">
      <div style={{width:"100%", padding:"0 20px"}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>“01”</span>
          <div style={{flex:1, height:1, background:"var(--holy-ivory)"}}/>
        </div>
        <div style={{
          fontFamily:"var(--font-display)", fontWeight:900, fontSize:42,
          textTransform:"uppercase", color:"var(--holy-ivory)", lineHeight:1, margin:"10px 0",
          letterSpacing:"-0.01em",
        }}>SCRIPTURE RAID</div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div style={{flex:1, height:1, background:"var(--holy-gold)"}}/>
          <span className="holy-system" style={{color:"var(--holy-gold)"}}>JOHN  ·  01:01</span>
          <div style={{width:24, height:1, background:"var(--holy-gold)"}}/>
        </div>
      </div>
    </PatternTile>
  );
}

// ───── HYBRID ─────

function P_HybridWax() {
  // Sacred wax seal + tactical bracket + system stamp
  return (
    <PatternTile kind="HYBRID" name="Seal & System" code="H01">
      <div style={{position:"relative", padding:"10px"}}>
        <svg width="180" height="140" viewBox="0 0 180 140">
          {/* Tactical bracket */}
          <g stroke="#C9A961" strokeWidth="0.8" fill="none">
            <path d="M0 18 L0 0 L18 0"/>
            <path d="M180 18 L180 0 L162 0"/>
            <path d="M0 122 L0 140 L18 140"/>
            <path d="M180 122 L180 140 L162 140"/>
          </g>
          {/* Wax seal */}
          <defs>
            <radialGradient id="hwax" cx="40%" cy="38%" r="65%">
              <stop offset="0%"  stopColor="#A33333"/>
              <stop offset="70%" stopColor="#7A1F1F"/>
              <stop offset="100%" stopColor="#3A0F0F"/>
            </radialGradient>
            <filter id="hwax-bumps">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3"/>
              <feDisplacementMap in="SourceGraphic" scale="3"/>
            </filter>
          </defs>
          <g filter="url(#hwax-bumps)">
            <circle cx="90" cy="70" r="42" fill="url(#hwax)"/>
          </g>
          <g stroke="#3A0F0F" strokeWidth="0.6" fill="none" opacity="0.7">
            <circle cx="90" cy="70" r="32"/>
          </g>
          {/* Embossed cross + system tag */}
          <g stroke="#3A0F0F" strokeWidth="2" opacity="0.85">
            <line x1="90" y1="52" x2="90" y2="88"/>
            <line x1="72" y1="70" x2="108" y2="70"/>
            <line x1="78" y1="58" x2="102" y2="58"/>
          </g>
          <text x="90" y="118" textAnchor="middle"
                fontFamily="JetBrains Mono, monospace" fontSize="7"
                fill="#C9A961" letterSpacing="2.5">[ SEALED ]</text>
        </svg>
      </div>
    </PatternTile>
  );
}

function PatternLibrary() {
  // 4 sacred + 3 tactical + 3 streetwear + 1 hybrid = 11 motifs
  return null;
}

Object.assign(window, {
  P_OrthodoxCross, P_ChiRho, P_HaloGeometry, P_SacredFrame,
  P_HUDBrackets, P_GlowBorder, P_Reticle,
  P_IndustrialLabel, P_GraffitiTag, P_BrutalistDivider,
  P_HybridWax, PatternTile,
});
