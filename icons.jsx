// icons.jsx — three app icon variants (1024×1024 logic, rendered at 256)
// Strongest direction = HOLY-Mark cruciform halo + H, tested across treatments.

function IconA() {
  // V1 — Gold-leaf disc, cruciform halo, H ligature with internal cross
  return (
    <div className="ic-stage" style={{background:"#0A0A0A", display:"grid", placeItems:"center"}}>
      <svg viewBox="0 0 256 256" width="100%" height="100%">
        <defs>
          <radialGradient id="ica-leaf" cx="48%" cy="42%" r="58%">
            <stop offset="0%"  stopColor="#F4E0A8"/>
            <stop offset="55%" stopColor="#C9A961"/>
            <stop offset="100%" stopColor="#7A5618"/>
          </radialGradient>
          <filter id="ica-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>
            <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.08  0 0 0 0 0.02  0 0 0 0.45 0"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
        <rect width="256" height="256" fill="#0A0A0A"/>
        <circle cx="128" cy="128" r="100" fill="url(#ica-leaf)"/>
        <circle cx="128" cy="128" r="100" fill="url(#ica-leaf)" filter="url(#ica-grain)" opacity="0.7"/>
        <circle cx="128" cy="128" r="86" fill="none" stroke="#2A1A05" strokeWidth="1.2" opacity="0.55"/>
        {/* Cruciform halo strokes */}
        <g stroke="#2A1A05" strokeWidth="4">
          <line x1="128" y1="36"  x2="128" y2="58"/>
          <line x1="128" y1="198" x2="128" y2="220"/>
          <line x1="36"  y1="128" x2="58"  y2="128"/>
          <line x1="198" y1="128" x2="220" y2="128"/>
        </g>
        {/* H ligature, top arm extended into a cross */}
        <g fill="#0A0A0A">
          <rect x="92"  y="80"  width="14" height="92"/>
          <rect x="150" y="80"  width="14" height="92"/>
          <rect x="92"  y="118" width="72" height="16"/>
          <rect x="121" y="68"  width="14" height="20"/>
        </g>
      </svg>
    </div>
  );
}

function IconB() {
  // V2 — Reversed: matte black base, gold cruciform inset
  return (
    <div className="ic-stage" style={{background:"#E8E2D5", display:"grid", placeItems:"center"}}>
      <svg viewBox="0 0 256 256" width="100%" height="100%">
        <defs>
          <filter id="icb-grit">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5"/>
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.3 0"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
        <rect width="256" height="256" fill="#E8E2D5"/>
        {/* Paper grain */}
        <rect width="256" height="256" fill="#8A8378" opacity="0.06"/>
        <circle cx="128" cy="128" r="104" fill="#0A0A0A"/>
        <circle cx="128" cy="128" r="104" fill="#0A0A0A" filter="url(#icb-grit)" opacity="0.6"/>
        {/* Inner thin ring */}
        <circle cx="128" cy="128" r="92" fill="none" stroke="#C9A961" strokeWidth="0.8" opacity="0.55"/>
        {/* Cruciform halo */}
        <g stroke="#C9A961" strokeWidth="3.8">
          <line x1="128" y1="32"  x2="128" y2="56"/>
          <line x1="128" y1="200" x2="128" y2="224"/>
          <line x1="32"  y1="128" x2="56"  y2="128"/>
          <line x1="200" y1="128" x2="224" y2="128"/>
        </g>
        {/* H ligature in gold */}
        <g fill="#C9A961">
          <rect x="92"  y="80"  width="14" height="92"/>
          <rect x="150" y="80"  width="14" height="92"/>
          <rect x="92"  y="118" width="72" height="16"/>
          <rect x="121" y="68"  width="14" height="20"/>
        </g>
      </svg>
    </div>
  );
}

function IconC() {
  // V3 — Tactical / system: black square with thin glowing brackets + H mark
  return (
    <div className="ic-stage" style={{background:"#0A0A0A", position:"relative", display:"grid", placeItems:"center"}}>
      <svg viewBox="0 0 256 256" width="100%" height="100%">
        <defs>
          <radialGradient id="icc-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%"  stopColor="#C9A961" stopOpacity="0.35"/>
            <stop offset="80%" stopColor="#C9A961" stopOpacity="0"/>
          </radialGradient>
          <filter id="icc-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7"/>
            <feColorMatrix values="0 0 0 0 0.79  0 0 0 0 0.66  0 0 0 0 0.38  0 0 0 0.18 0"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>
        </defs>
        <rect width="256" height="256" fill="#0A0A0A"/>
        <rect width="256" height="256" fill="url(#icc-glow)"/>
        {/* tactical corner brackets */}
        <g stroke="#C9A961" strokeWidth="2.4" fill="none">
          <path d="M28 64 L28 28 L64 28"/>
          <path d="M228 64 L228 28 L192 28"/>
          <path d="M28 192 L28 228 L64 228"/>
          <path d="M228 192 L228 228 L192 228"/>
        </g>
        {/* tick marks */}
        <g stroke="#C9A961" strokeWidth="2.4">
          <line x1="120" y1="28" x2="136" y2="28"/>
          <line x1="120" y1="228" x2="136" y2="228"/>
          <line x1="28" y1="120" x2="28" y2="136"/>
          <line x1="228" y1="120" x2="228" y2="136"/>
        </g>
        {/* H ligature with internal cross — leaf-painted */}
        <g fill="#C9A961">
          <rect x="92"  y="76"  width="16" height="104"/>
          <rect x="148" y="76"  width="16" height="104"/>
          <rect x="92"  y="120" width="72" height="16"/>
          <rect x="120" y="60"  width="16" height="22"/>
        </g>
        <g fill="#C9A961" filter="url(#icc-grain)" opacity="0.7">
          <rect x="92"  y="76"  width="16" height="104"/>
          <rect x="148" y="76"  width="16" height="104"/>
          <rect x="92"  y="120" width="72" height="16"/>
          <rect x="120" y="60"  width="16" height="22"/>
        </g>
        {/* faint system label */}
        <text x="128" y="208" textAnchor="middle"
              fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#C9A961"
              letterSpacing="3" opacity="0.7">[ HOLY ]</text>
      </svg>
    </div>
  );
}

// Mini preview row — shows icon at home-screen scale (60x60)
function IconScale({ icon: Icon }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:14, marginTop:14,
      padding:"10px 12px",
      background:"#15151A",
      border:"1px solid rgba(232,226,213,0.08)",
    }}>
      <div style={{width:60, height:60, borderRadius:14, overflow:"hidden", flex:"0 0 60px"}}>
        <Icon/>
      </div>
      <div style={{width:44, height:44, borderRadius:10, overflow:"hidden", flex:"0 0 44px"}}>
        <Icon/>
      </div>
      <div style={{width:28, height:28, borderRadius:6, overflow:"hidden", flex:"0 0 28px"}}>
        <Icon/>
      </div>
      <div style={{
        marginLeft:"auto", fontFamily:"JetBrains Mono, monospace", fontSize:9,
        color:"#8A8378", letterSpacing:"0.18em", textTransform:"uppercase",
      }}>
        60 · 44 · 28
      </div>
    </div>
  );
}

Object.assign(window, { IconA, IconB, IconC, IconScale });
