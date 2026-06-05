// logos.jsx — HOLY Sprint 1 logo concepts
// 4 names × 4 directions each. Every mark is its own component so it can be
// reused at any size (status reveal, splash, button). Each renders inside an
// .lg-frame; the host (app.jsx) wraps it with name + direction label.

// ─────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────

// Halo: gold-leaf circle with cracked inner ring. Drawn flat in SVG so it
// can be sized to any glyph.
function Halo({ size = 120, intensity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{position:"absolute"}}>
      <defs>
        <radialGradient id="halo-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#F1DDA0" stopOpacity={0.95 * intensity}/>
          <stop offset="55%" stopColor="#C9A961" stopOpacity={0.85 * intensity}/>
          <stop offset="85%" stopColor="#8B6B22" stopOpacity={0.55 * intensity}/>
          <stop offset="100%" stopColor="#8B6B22" stopOpacity={0}/>
        </radialGradient>
        <filter id="halo-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3"/>
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.05  0 0 0 0.5 0"/>
          <feComposite in2="SourceGraphic" operator="in"/>
        </filter>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#halo-fill)"/>
      <circle cx="60" cy="60" r="56" fill="url(#halo-fill)" filter="url(#halo-grain)" opacity="0.7"/>
      <circle cx="60" cy="60" r="50" fill="none" stroke="#5C3F12" strokeWidth="0.6" opacity="0.55"/>
      <circle cx="60" cy="60" r="44" fill="none" stroke="#5C3F12" strokeWidth="0.3" opacity="0.35"/>
      {/* Crackle */}
      <g stroke="#3A2A0A" strokeWidth="0.5" fill="none" opacity="0.55">
        <path d="M30 50 L42 58 L38 70 L48 78"/>
        <path d="M78 38 L86 50 L80 62 L92 70"/>
        <path d="M58 22 L62 34 L56 42"/>
        <path d="M70 92 L66 80 L74 70"/>
      </g>
    </svg>
  );
}

// Solo-leveling-style tactical bracket frame around content.
function TacticalFrame({ children, color = "#C9A961" }) {
  return (
    <div style={{position:"relative", padding:"18px 26px"}}>
      <svg width="100%" height="100%" style={{position:"absolute", inset:0, pointerEvents:"none"}} preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* corner brackets */}
        <g stroke={color} strokeWidth="0.8" fill="none">
          <path d="M0 14 L0 0 L14 0"/>
          <path d="M100 14 L100 0 L86 0"/>
          <path d="M0 86 L0 100 L14 100"/>
          <path d="M100 86 L100 100 L86 100"/>
          {/* tick marks */}
          <path d="M48 0 L52 0" strokeWidth="1.2"/>
          <path d="M48 100 L52 100" strokeWidth="1.2"/>
        </g>
      </svg>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOLY — 4 directions
// ─────────────────────────────────────────────────────────────

function HOLY_Sacred() {
  return (
    <div style={{textAlign:"center", color:"var(--holy-ivory)"}}>
      <div style={{position:"relative", display:"inline-block", padding:"36px 8px 8px"}}>
        <div style={{position:"absolute", left:"50%", top:0, transform:"translate(-50%, -38%)"}}>
          <Halo size={120}/>
        </div>
        {/* tiny cross above O */}
        <svg width="20" height="20" viewBox="0 0 20 20" style={{position:"absolute", left:"calc(50% - 4px)", top:14, zIndex:2}}>
          <path d="M10 2 L10 18 M3 10 L17 10 M5 6 L15 6" stroke="#2A1A05" strokeWidth="1.2" fill="none"/>
        </svg>
        <h1 className="holy-roman" style={{fontSize:64, margin:0, color:"var(--holy-ivory)", position:"relative", zIndex:1, letterSpacing:"0.18em"}}>
          HOLY
        </h1>
      </div>
      <div className="holy-roman" style={{fontSize:9, color:"var(--holy-gold)", marginTop:14, letterSpacing:"0.45em"}}>
         ·  ΑΓΙΟΣ  ·
      </div>
    </div>
  );
}

function HOLY_Street() {
  return (
    <div style={{textAlign:"left", width:"100%"}}>
      <div style={{display:"flex", alignItems:"baseline", gap:6, marginBottom:6}}>
        <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>“</span>
        <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>SPRINT 01 / WORDMARK / IND.</span>
      </div>
      <h1 className="holy-display" style={{fontSize:104, margin:0, color:"var(--holy-ivory)", lineHeight:0.85}}>
        HOLY<span style={{color:"var(--holy-gold)"}}>.</span>
      </h1>
      <div style={{display:"flex", justifyContent:"space-between", marginTop:10, gap:12}}>
        <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>SONS OF FIRE  ®</span>
        <span className="holy-system" style={{color:"var(--holy-gold)"}}>“HOLY”</span>
      </div>
      <div style={{height:1, background:"var(--holy-ivory-muted)", opacity:0.4, marginTop:8}}/>
    </div>
  );
}

function HOLY_System() {
  return (
    <TacticalFrame>
      <div style={{textAlign:"center", padding:"24px 12px"}}>
        <div className="holy-system" style={{marginBottom:10}}>[ AWAKENING.0 ]</div>
        <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:14}}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:14, color:"var(--holy-gold)"}}>[</span>
          <h1 className="holy-display" style={{fontSize:56, margin:0, color:"var(--holy-ivory)", letterSpacing:"0.04em"}}>
            H<span style={{color:"var(--holy-gold)"}}>O</span>L<span style={{color:"var(--holy-gold)"}}>Y</span>
          </h1>
          <span style={{fontFamily:"var(--font-mono)", fontSize:14, color:"var(--holy-gold)"}}>]</span>
        </div>
        <div className="holy-system" style={{marginTop:14, fontSize:9, color:"var(--holy-ivory-muted)"}}>SYSTEM ◇ ONLINE</div>
      </div>
    </TacticalFrame>
  );
}

function HOLY_Mark() {
  // Symbol-only: cruciform halo + H ligature
  return (
    <div style={{display:"grid", placeItems:"center"}}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <radialGradient id="hmark-fill" cx="50%" cy="50%" r="55%">
            <stop offset="0%"  stopColor="#F1DDA0"/>
            <stop offset="60%" stopColor="#C9A961"/>
            <stop offset="100%" stopColor="#8B6B22"/>
          </radialGradient>
          <filter id="hmark-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9"/>
            <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.08  0 0 0 0 0.02  0 0 0 0.55 0"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
        <circle cx="70" cy="70" r="60" fill="url(#hmark-fill)"/>
        <circle cx="70" cy="70" r="60" fill="url(#hmark-fill)" filter="url(#hmark-grain)" opacity="0.7"/>
        {/* Inner ring */}
        <circle cx="70" cy="70" r="52" fill="none" stroke="#2A1A05" strokeWidth="0.8" opacity="0.6"/>
        {/* Cruciform halo lines */}
        <g stroke="#2A1A05" strokeWidth="2.2" opacity="0.85">
          <line x1="70" y1="10" x2="70" y2="28"/>
          <line x1="70" y1="112" x2="70" y2="130"/>
          <line x1="10" y1="70" x2="28" y2="70"/>
          <line x1="112" y1="70" x2="130" y2="70"/>
        </g>
        {/* H ligature */}
        <g fill="#0A0A0A">
          <rect x="46" y="42" width="9" height="56"/>
          <rect x="85" y="42" width="9" height="56"/>
          <rect x="46" y="64" width="48" height="12"/>
          {/* top cross-stroke ↑ converts H into a subtle cross */}
          <rect x="66" y="34" width="9" height="22"/>
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TABOR — 4 directions
// ─────────────────────────────────────────────────────────────

function TABOR_Sacred() {
  return (
    <div style={{textAlign:"center", color:"var(--holy-ivory)"}}>
      <svg width="140" height="80" viewBox="0 0 140 80" style={{marginBottom:8}}>
        <defs>
          <radialGradient id="tabor-sun" cx="50%" cy="40%" r="40%">
            <stop offset="0%"  stopColor="#F1DDA0" stopOpacity="1"/>
            <stop offset="60%" stopColor="#C9A961" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0"/>
          </radialGradient>
        </defs>
        {/* Glow */}
        <circle cx="70" cy="30" r="32" fill="url(#tabor-sun)"/>
        {/* Three rays — Father, Son, Spirit at the Transfiguration */}
        <g stroke="#C9A961" strokeWidth="0.7" opacity="0.7">
          <line x1="70" y1="2"  x2="70" y2="14"/>
          <line x1="48" y1="10" x2="56" y2="20"/>
          <line x1="92" y1="10" x2="84" y2="20"/>
        </g>
        {/* Mountain peak — three triangles, central tallest */}
        <g fill="none" stroke="#C9A961" strokeWidth="1.6">
          <path d="M22 78 L56 38 L70 56"/>
          <path d="M50 78 L70 22 L90 78"/>
          <path d="M70 56 L86 38 L118 78"/>
        </g>
        {/* Cross atop peak */}
        <g stroke="#C9A961" strokeWidth="1.3" opacity="0.95">
          <line x1="70" y1="14" x2="70" y2="26"/>
          <line x1="65" y1="20" x2="75" y2="20"/>
        </g>
      </svg>
      <h1 className="holy-roman" style={{fontSize:42, margin:0, letterSpacing:"0.32em"}}>TABOR</h1>
      <div className="holy-roman" style={{fontSize:8, color:"var(--holy-gold)", marginTop:10, letterSpacing:"0.4em"}}>
        MOUNT  ·  THE  ·  LIGHT
      </div>
    </div>
  );
}

function TABOR_Street() {
  return (
    <div style={{width:"100%", color:"var(--holy-ivory)"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:6}}>
        <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>EL. 588m</span>
        <span className="holy-system" style={{color:"var(--holy-gold)"}}>32°41′N · 35°23′E</span>
      </div>
      <h1 className="holy-display" style={{fontSize:84, margin:0, color:"var(--holy-ivory)", lineHeight:0.85}}>
        TA<span style={{display:"inline-block", color:"var(--holy-gold)"}}>/</span>BOR
      </h1>
      <div style={{display:"flex", alignItems:"center", gap:8, marginTop:8}}>
        <div style={{height:1, flex:1, background:"var(--holy-gold)"}}/>
        <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>BROTHERHOOD APPAREL DIV.</span>
        <div style={{height:1, width:24, background:"var(--holy-gold)"}}/>
      </div>
    </div>
  );
}

function TABOR_System() {
  return (
    <TacticalFrame>
      <div style={{padding:"22px 14px", textAlign:"center"}}>
        <div className="holy-system" style={{marginBottom:10}}>[ MOUNT.LOCKED ]</div>
        <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:10}}>
          {/* Mini-icon */}
          <svg width="32" height="32" viewBox="0 0 32 32">
            <path d="M2 28 L12 14 L16 18 L20 12 L30 28 Z" fill="none" stroke="#C9A961" strokeWidth="1.4"/>
            <circle cx="20" cy="6" r="1.6" fill="#C9A961"/>
          </svg>
          <h1 className="holy-display" style={{fontSize:48, margin:0, color:"var(--holy-ivory)", letterSpacing:"0.06em"}}>
            TABOR
          </h1>
        </div>
        <div className="holy-system" style={{marginTop:12, color:"var(--holy-ivory-muted)"}}>NODE.04 ◇ ASCEND</div>
      </div>
    </TacticalFrame>
  );
}

function TABOR_Mark() {
  return (
    <div style={{display:"grid", placeItems:"center"}}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <linearGradient id="tabor-mark-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E6CB85"/>
            <stop offset="100%" stopColor="#8B6B22"/>
          </linearGradient>
        </defs>
        {/* Halo */}
        <circle cx="70" cy="70" r="64" fill="none" stroke="#C9A961" strokeWidth="0.7" opacity="0.5"/>
        <circle cx="70" cy="70" r="58" fill="none" stroke="#C9A961" strokeWidth="0.4" opacity="0.3"/>
        {/* Mountain */}
        <path d="M22 108 L56 56 L70 76 L86 54 L120 108 Z" fill="url(#tabor-mark-grad)" stroke="#5C3F12" strokeWidth="0.6"/>
        {/* Snow line / light */}
        <path d="M50 70 L56 56 L70 76 L86 54 L94 66 L84 64 L70 80 L60 70 Z" fill="#F1DDA0" opacity="0.85"/>
        {/* Three lights */}
        <circle cx="56" cy="42" r="2.4" fill="#F1DDA0"/>
        <circle cx="70" cy="32" r="3" fill="#F1DDA0"/>
        <circle cx="86" cy="42" r="2.4" fill="#F1DDA0"/>
        {/* Glow lines */}
        <g stroke="#F1DDA0" strokeWidth="0.5" opacity="0.5">
          <line x1="56" y1="42" x2="70" y2="32"/>
          <line x1="70" y1="32" x2="86" y2="42"/>
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// THEOSIS — 4 directions
// ─────────────────────────────────────────────────────────────

function THEOSIS_Sacred() {
  return (
    <div style={{textAlign:"center", color:"var(--holy-ivory)"}}>
      <div style={{position:"relative", display:"inline-block", marginBottom:6}}>
        <Halo size={90}/>
        <div style={{position:"relative", width:90, height:90, display:"grid", placeItems:"center"}}>
          {/* Theta — Θ */}
          <svg width="48" height="48" viewBox="0 0 48 48">
            <ellipse cx="24" cy="24" rx="16" ry="20" fill="none" stroke="#0A0A0A" strokeWidth="2.2"/>
            <line x1="12" y1="24" x2="36" y2="24" stroke="#0A0A0A" strokeWidth="2.2"/>
          </svg>
        </div>
      </div>
      <h1 className="holy-roman" style={{fontSize:30, margin:0, letterSpacing:"0.28em", color:"var(--holy-ivory)"}}>
        THEOSIS
      </h1>
      <div className="holy-roman" style={{fontSize:8, color:"var(--holy-gold)", marginTop:10, letterSpacing:"0.42em"}}>
        ΘΕΩΣΙΣ
      </div>
    </div>
  );
}

function THEOSIS_Street() {
  return (
    <div style={{width:"100%", color:"var(--holy-ivory)"}}>
      <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>NOUN · GR.</span>
      <h1 className="holy-display" style={{fontSize:60, margin:"4px 0 0", lineHeight:0.9, letterSpacing:"-0.01em"}}>
        THE<span style={{color:"var(--holy-gold)"}}>OS</span>IS
      </h1>
      <div style={{height:1, background:"var(--holy-ivory)", margin:"10px 0 8px", opacity:0.7}}/>
      <div style={{display:"flex", justifyContent:"space-between"}}>
        <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>“BECOMING LIKE”</span>
        <span className="holy-system" style={{color:"var(--holy-gold)"}}>θ — 008</span>
      </div>
    </div>
  );
}

function THEOSIS_System() {
  return (
    <TacticalFrame>
      <div style={{padding:"22px 14px", textAlign:"center"}}>
        <div className="holy-system" style={{marginBottom:8}}>[ QUEST.LINE ]</div>
        <h1 className="holy-display" style={{fontSize:36, margin:0, color:"var(--holy-ivory)", letterSpacing:"0.04em"}}>
          THEOSIS
        </h1>
        {/* progress bar — ceremonial */}
        <div style={{margin:"14px auto 6px", height:6, width:"75%", background:"rgba(201,169,97,0.12)", border:"1px solid rgba(201,169,97,0.35)", position:"relative"}}>
          <div style={{position:"absolute", left:0, top:0, bottom:0, width:"68%", background:"linear-gradient(90deg, #8B6B22, #E6CB85, #C9A961)"}}/>
        </div>
        <div className="holy-system" style={{fontSize:9, color:"var(--holy-ivory-muted)"}}>ASCEND ▸ 68%</div>
      </div>
    </TacticalFrame>
  );
}

function THEOSIS_Mark() {
  // Ascending arrow inside Θ + halo
  return (
    <div style={{display:"grid", placeItems:"center"}}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <radialGradient id="th-fill" cx="50%" cy="50%" r="55%">
            <stop offset="0%"  stopColor="#F1DDA0"/>
            <stop offset="60%" stopColor="#C9A961"/>
            <stop offset="100%" stopColor="#8B6B22"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="70" r="60" fill="url(#th-fill)"/>
        <circle cx="70" cy="70" r="52" fill="none" stroke="#2A1A05" strokeWidth="0.6" opacity="0.5"/>
        {/* Theta */}
        <ellipse cx="70" cy="70" rx="28" ry="38" fill="none" stroke="#0A0A0A" strokeWidth="4.5"/>
        {/* Ascending arrow inside */}
        <g stroke="#0A0A0A" strokeWidth="4" fill="none" strokeLinecap="square">
          <line x1="70" y1="92" x2="70" y2="50"/>
          <polyline points="58,62 70,50 82,62"/>
        </g>
        {/* Crackle */}
        <g stroke="#2A1A05" strokeWidth="0.45" fill="none" opacity="0.5">
          <path d="M28 50 L40 58 M30 80 L42 76 M100 56 L112 50 M98 90 L108 96"/>
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IMAGO — 4 directions
// ─────────────────────────────────────────────────────────────

function IMAGO_Sacred() {
  return (
    <div style={{textAlign:"center", color:"var(--holy-ivory)"}}>
      <div style={{position:"relative", display:"inline-block", marginBottom:8}}>
        <Halo size={92}/>
        <div style={{position:"relative", width:92, height:92, display:"grid", placeItems:"center"}}>
          {/* Mirrored I — divine reflection */}
          <svg width="56" height="56" viewBox="0 0 56 56">
            <g fill="#0A0A0A">
              <rect x="14" y="8"  width="28" height="4"/>
              <rect x="26" y="8"  width="4"  height="40"/>
              <rect x="14" y="44" width="28" height="4"/>
            </g>
            {/* horizontal mirror line */}
            <line x1="8" y1="28" x2="48" y2="28" stroke="#2A1A05" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5"/>
          </svg>
        </div>
      </div>
      <h1 className="holy-roman" style={{fontSize:36, margin:0, letterSpacing:"0.28em"}}>
        IMAGO
      </h1>
      <div className="holy-roman" style={{fontSize:8, color:"var(--holy-gold)", marginTop:10, letterSpacing:"0.42em"}}>
        ·  DEI  ·
      </div>
    </div>
  );
}

function IMAGO_Street() {
  return (
    <div style={{width:"100%", color:"var(--holy-ivory)"}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
        <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>“IMAGE OF”</span>
        <span className="holy-system" style={{color:"var(--holy-gold)"}}>VOL.01</span>
      </div>
      <h1 className="holy-display" style={{fontSize:88, margin:0, color:"var(--holy-ivory)", lineHeight:0.85, letterSpacing:"-0.02em"}}>
        IMA<span style={{color:"var(--holy-gold)"}}>GO</span>
      </h1>
      <div style={{display:"flex", alignItems:"center", marginTop:10, gap:8}}>
        <div style={{width:18, height:1, background:"var(--holy-ivory)"}}/>
        <span className="holy-system" style={{color:"var(--holy-ivory-muted)"}}>BROTHERHOOD.</span>
        <div style={{flex:1, height:1, background:"var(--holy-ivory)", opacity:0.4}}/>
      </div>
    </div>
  );
}

function IMAGO_System() {
  return (
    <TacticalFrame>
      <div style={{padding:"22px 14px", textAlign:"center"}}>
        <div className="holy-system" style={{marginBottom:10}}>[ IMAGO.SYS ]</div>
        <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:12}}>
          <svg width="22" height="22" viewBox="0 0 22 22">
            <circle cx="11" cy="11" r="9" fill="none" stroke="#C9A961" strokeWidth="1.2"/>
            <line x1="2" y1="11" x2="20" y2="11" stroke="#C9A961" strokeWidth="0.6" strokeDasharray="1.5 1.5"/>
            <circle cx="11" cy="6" r="1.4" fill="#C9A961"/>
            <circle cx="11" cy="16" r="1.4" fill="#C9A961" opacity="0.5"/>
          </svg>
          <h1 className="holy-display" style={{fontSize:46, margin:0, color:"var(--holy-ivory)", letterSpacing:"0.06em"}}>
            IMAGO
          </h1>
        </div>
        <div className="holy-system" style={{marginTop:10, fontSize:9, color:"var(--holy-ivory-muted)"}}>MIRROR ◇ ACTIVE</div>
      </div>
    </TacticalFrame>
  );
}

function IMAGO_Mark() {
  return (
    <div style={{display:"grid", placeItems:"center"}}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <defs>
          <radialGradient id="im-fill" cx="50%" cy="50%" r="55%">
            <stop offset="0%"  stopColor="#F1DDA0"/>
            <stop offset="60%" stopColor="#C9A961"/>
            <stop offset="100%" stopColor="#8B6B22"/>
          </radialGradient>
        </defs>
        <circle cx="70" cy="70" r="60" fill="url(#im-fill)"/>
        <circle cx="70" cy="70" r="52" fill="none" stroke="#2A1A05" strokeWidth="0.6" opacity="0.5"/>
        {/* Capital I bordered top + bottom; with subtle horizontal reflection line */}
        <g fill="#0A0A0A">
          <rect x="48" y="36" width="44" height="6"/>
          <rect x="66" y="36" width="8" height="68"/>
          <rect x="48" y="98" width="44" height="6"/>
        </g>
        {/* Reflection dash line */}
        <line x1="30" y1="70" x2="110" y2="70" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"/>
        {/* Halo cross marks (cruciform) */}
        <g stroke="#2A1A05" strokeWidth="1.8" opacity="0.6">
          <line x1="70" y1="12" x2="70" y2="22"/>
          <line x1="70" y1="118" x2="70" y2="128"/>
        </g>
      </svg>
    </div>
  );
}

Object.assign(window, {
  HOLY_Sacred, HOLY_Street, HOLY_System, HOLY_Mark,
  TABOR_Sacred, TABOR_Street, TABOR_System, TABOR_Mark,
  THEOSIS_Sacred, THEOSIS_Street, THEOSIS_System, THEOSIS_Mark,
  IMAGO_Sacred, IMAGO_Street, IMAGO_System, IMAGO_Mark,
  Halo, TacticalFrame,
});
