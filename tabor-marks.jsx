// tabor-marks.jsx — Refined TABOR mark system
// The mountain of the Transfiguration: twin-peak silhouette, three lights
// (Christ flanked by Moses & Elijah / or Father-Son-Spirit), gold-leaf disc,
// cruciform halo. Built so every variant shares one silhouette grammar.

// ── Shared gold-leaf defs (reusable across SVGs via unique ids) ──
function GoldDefs({ id }) {
  return (
    <defs>
      <radialGradient id={`${id}-leaf`} cx="46%" cy="38%" r="62%">
        <stop offset="0%"  stopColor="#F4E2AC"/>
        <stop offset="40%" stopColor="#D8B86E"/>
        <stop offset="72%" stopColor="#C9A961"/>
        <stop offset="100%" stopColor="#7E5A1E"/>
      </radialGradient>
      <linearGradient id={`${id}-peak`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#F4E2AC"/>
        <stop offset="48%" stopColor="#CBA85F"/>
        <stop offset="100%" stopColor="#6E4E18"/>
      </linearGradient>
      <filter id={`${id}-grain`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" seed="7"/>
        <feColorMatrix values="0 0 0 0 0.13  0 0 0 0 0.08  0 0 0 0 0.02  0 0 0 0.5 0"/>
        <feComposite in2="SourceGraphic" operator="in"/>
      </filter>
      <filter id={`${id}-crack`}>
        <feTurbulence type="turbulence" baseFrequency="0.05 0.09" numOctaves="3" seed="4"/>
        <feDisplacementMap in="SourceGraphic" scale="2.4"/>
      </filter>
    </defs>
  );
}

// Three lights — descending hierarchy, central tallest
function ThreeLights({ cx = 70, top = 30, color = "#F6E9C2", glow = true }) {
  return (
    <g>
      {glow && (
        <g opacity="0.5">
          <circle cx={cx-16} cy={top+10} r="6" fill={color} opacity="0.4"/>
          <circle cx={cx}    cy={top}    r="8" fill={color} opacity="0.5"/>
          <circle cx={cx+16} cy={top+10} r="6" fill={color} opacity="0.4"/>
        </g>
      )}
      <circle cx={cx-16} cy={top+10} r="2.6" fill={color}/>
      <circle cx={cx}    cy={top}    r="3.4" fill={color}/>
      <circle cx={cx+16} cy={top+10} r="2.6" fill={color}/>
    </g>
  );
}

// ── VARIANT 1 — Primary: filled gold mountain, halo ring, three lights ──
function TaborPrimary({ size = 200 }) {
  const id = "tp";
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <GoldDefs id={id}/>
      {/* outer halo rings */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="#C9A961" strokeWidth="1" opacity="0.45"/>
      <circle cx="100" cy="100" r="84" fill="none" stroke="#C9A961" strokeWidth="0.5" opacity="0.3"/>
      {/* light haze */}
      <circle cx="100" cy="78" r="46" fill="#C9A961" opacity="0.10"/>
      {/* mountain — twin peak, central tallest */}
      <path d="M28 150 L74 78 L92 104 L116 66 L172 150 Z"
            fill={`url(#${id}-peak)`} stroke="#4E3712" strokeWidth="0.8"/>
      {/* grain overlay on mountain */}
      <path d="M28 150 L74 78 L92 104 L116 66 L172 150 Z"
            fill={`url(#${id}-peak)`} filter={`url(#${id}-grain)`} opacity="0.6"/>
      {/* snow / illuminated faces */}
      <path d="M74 78 L84 92 L78 100 L70 92 Z" fill="#F4E2AC" opacity="0.9"/>
      <path d="M116 66 L128 84 L120 92 L110 80 Z" fill="#F4E2AC" opacity="0.9"/>
      {/* crackle lines */}
      <g stroke="#4E3712" strokeWidth="0.5" fill="none" opacity="0.5" filter={`url(#${id}-crack)`}>
        <path d="M50 150 L66 110 M100 150 L96 110 M140 150 L124 104"/>
      </g>
      {/* three lights above */}
      <ThreeLights cx={100} top={36}/>
      {/* descending rays */}
      <g stroke="#F4E2AC" strokeWidth="0.6" opacity="0.5">
        <line x1="84" y1="46" x2="74" y2="74"/>
        <line x1="100" y1="40" x2="100" y2="70"/>
        <line x1="116" y1="46" x2="116" y2="62"/>
      </g>
    </svg>
  );
}

// ── VARIANT 2 — Disc: mountain reversed out of solid gold disc (icon-forward) ──
function TaborDisc({ size = 200 }) {
  const id = "td";
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <GoldDefs id={id}/>
      <circle cx="100" cy="100" r="88" fill={`url(#${id}-leaf)`}/>
      <circle cx="100" cy="100" r="88" fill={`url(#${id}-leaf)`} filter={`url(#${id}-grain)`} opacity="0.7"/>
      <circle cx="100" cy="100" r="78" fill="none" stroke="#3A2A0A" strokeWidth="0.8" opacity="0.5"/>
      {/* cruciform halo ticks */}
      <g stroke="#3A2A0A" strokeWidth="3.4" opacity="0.85">
        <line x1="100" y1="16" x2="100" y2="34"/>
        <line x1="100" y1="166" x2="100" y2="184"/>
        <line x1="16" y1="100" x2="34" y2="100"/>
        <line x1="166" y1="100" x2="184" y2="100"/>
      </g>
      {/* mountain knocked out in matte black */}
      <path d="M44 142 L80 90 L96 112 L116 82 L156 142 Z" fill="#0A0A0A"/>
      {/* three lights knocked out */}
      <circle cx="84"  cy="64" r="3" fill="#0A0A0A"/>
      <circle cx="100" cy="56" r="4" fill="#0A0A0A"/>
      <circle cx="116" cy="64" r="3" fill="#0A0A0A"/>
    </svg>
  );
}

// ── VARIANT 3 — Linework: thin gold strokes, tactical/system feel ──
function TaborLine({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="90" fill="none" stroke="#C9A961" strokeWidth="0.8" opacity="0.5"/>
      <circle cx="100" cy="100" r="78" fill="none" stroke="#C9A961" strokeWidth="0.4" opacity="0.3"/>
      {/* mountain outline */}
      <path d="M36 148 L78 82 L96 108 L118 72 L164 148"
            fill="none" stroke="#C9A961" strokeWidth="2.2" strokeLinejoin="round"/>
      {/* inner ridge lines */}
      <g stroke="#C9A961" strokeWidth="0.8" opacity="0.6" fill="none">
        <path d="M78 82 L86 100 M118 72 L110 92 M96 108 L100 124"/>
      </g>
      {/* base line */}
      <line x1="36" y1="148" x2="164" y2="148" stroke="#C9A961" strokeWidth="1" opacity="0.7"/>
      {/* three lights — open rings */}
      <circle cx="84"  cy="54" r="3" fill="none" stroke="#C9A961" strokeWidth="1.4"/>
      <circle cx="100" cy="46" r="3.8" fill="#C9A961"/>
      <circle cx="116" cy="54" r="3" fill="none" stroke="#C9A961" strokeWidth="1.4"/>
      {/* cross atop central peak */}
      <g stroke="#C9A961" strokeWidth="1.6">
        <line x1="118" y1="60" x2="118" y2="72"/>
        <line x1="113" y1="65" x2="123" y2="65"/>
      </g>
    </svg>
  );
}

// ── VARIANT 4 — Sigil: mountain inside a pointed-arch icon frame (diegetic) ──
function TaborSigil({ size = 200 }) {
  const id = "ts";
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <GoldDefs id={id}/>
      {/* pointed arch frame */}
      <path d="M40 176 L40 84 Q40 40 100 40 Q160 40 160 84 L160 176 Z"
            fill="#0A0A0A" stroke="#C9A961" strokeWidth="1.4"/>
      <path d="M48 170 L48 86 Q48 48 100 48 Q152 48 152 86 L152 170 Z"
            fill="none" stroke="#C9A961" strokeWidth="0.5" opacity="0.5"/>
      {/* light haze */}
      <circle cx="100" cy="92" r="34" fill="#C9A961" opacity="0.12"/>
      {/* mountain */}
      <path d="M56 162 L88 110 L102 130 L118 102 L146 162 Z"
            fill={`url(#${id}-peak)`} stroke="#4E3712" strokeWidth="0.6"/>
      <path d="M88 110 L96 122 L90 128 L84 120 Z" fill="#F4E2AC" opacity="0.85"/>
      {/* three lights */}
      <ThreeLights cx={100} top={70} glow={false}/>
      {/* corner rosettes */}
      {[[40,176],[160,176]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2.4" fill="#C9A961"/>
      ))}
    </svg>
  );
}

Object.assign(window, { TaborPrimary, TaborDisc, TaborLine, TaborSigil, ThreeLights, GoldDefs });
