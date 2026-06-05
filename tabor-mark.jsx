// tabor-mark.jsx — TABOR refined sacred mark
// Clean blackletter wordmark + minimal coin-seal emblem (halo ring + mountain).
// Gold with a subtle metallic sheen on matte black. No rivets/chrome/cosplay.

function MarkDefs({ id, gold = true }) {
  return (
    <defs>
      {/* metallic gold sheen (warm, soft horizon — not cold chrome) */}
      <linearGradient id={`${id}-au`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#F6EAC2"/>
        <stop offset="30%" stopColor="#DCC07A"/>
        <stop offset="48%" stopColor="#BE9A45"/>
        <stop offset="50%" stopColor="#8E6A24"/>
        <stop offset="53%" stopColor="#B08A37"/>
        <stop offset="72%" stopColor="#E8D08C"/>
        <stop offset="100%" stopColor="#9C7A30"/>
      </linearGradient>
      <radialGradient id={`${id}-seal`} cx="42%" cy="36%" r="66%">
        <stop offset="0%" stopColor="#F6EAC2"/><stop offset="58%" stopColor="#C9A961"/>
        <stop offset="100%" stopColor="#7E5A1E"/>
      </radialGradient>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(201,169,97,0.22)"/><stop offset="70%" stopColor="rgba(0,0,0,0)"/>
      </radialGradient>
      <filter id={`${id}-soft`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="10"/>
      </filter>
    </defs>
  );
}

// Blackletter word with metallic gold + crisp keyline + soft shadow
function WordTabor({ id, x = 300, y = 348, size = 140, word = "Tabor",
  family = "'Pirata One', serif", weight = 400, stretchX = 1, vAlign = "alphabetic",
  fill = "au", ink = "#15120A", shadow = "rgba(0,0,0,0.5)" }) {
  return (
    <g transform={`translate(${x} 0) scale(${stretchX} 1) translate(${-x} 0)`}>
      <text x={x+2} y={y+3} textAnchor="middle" dominantBaseline={vAlign} fontFamily={family} fontWeight={weight} fontSize={size} fill={shadow}>{word}</text>
      <text x={x} y={y} textAnchor="middle" dominantBaseline={vAlign} fontFamily={family} fontWeight={weight} fontSize={size}
            fill={`url(#${id}-${fill})`} stroke={ink} strokeWidth="0.9" paintOrder="stroke">{word}</text>
    </g>
  );
}

// Minimal mountain medallion (self-framed) — refined, not busy
function Medallion({ id, cx, cy, r = 34 }) {
  const s = r/34;
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <circle r="34" fill="#0A0A0A" stroke={`url(#${id}-au)`} strokeWidth="1.6"/>
      <circle r="27" fill={`url(#${id}-seal)`}/>
      {/* mountain */}
      <path d="M-16,13 L-3,-7 L4,2 L11,-9 L17,13 Z" fill="#0E0A04"/>
      {/* three lights */}
      <circle cx="-3" cy="-12" r="2.1" fill="#FBF1CF"/>
      <circle cx="6"  cy="-15" r="2.5" fill="#FBF1CF"/>
      <circle cx="14" cy="-11" r="2.1" fill="#FBF1CF"/>
    </g>
  );
}

// Runtime-centred group: translate children so their rendered bbox centre = (cx,cy)
function Centered({ cx = 300, cy = 300, children }) {
  const ref = React.useRef(null);
  const [tf, setTf] = React.useState("");
  React.useLayoutEffect(() => {
    let live = true;
    const measure = () => {
      const g = ref.current; if (!g || !live) return;
      try {
        const b = g.getBBox();
        setTf(`translate(${cx - (b.x + b.width/2)} ${cy - (b.y + b.height/2)})`);
      } catch (e) {}
    };
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    const t1 = setTimeout(measure, 300), t2 = setTimeout(measure, 1000);
    return () => { live = false; clearTimeout(t1); clearTimeout(t2); };
  }, [cx, cy]);
  return <g ref={ref} transform={tf}>{children}</g>;
}

// ── Full emblem: ring + medallion + inscription + word ──
function TaborEmblem({ id = "em", showInscription = true, glow = true }) {
  const motto = "✦   SONS OF FIRE   ✦   ΘΕΩΣΙΣ   ✦   MOUNT OF LIGHT   ✦";
  return (
    <svg viewBox="0 0 600 600" width="100%" style={{display:"block", maxHeight:520}}>
      <MarkDefs id={id}/>
      <defs><path id={`${id}-bottom`} d="M92,300 A208,208 0 0 0 508,300"/></defs>

      {glow && <ellipse cx="300" cy="300" rx="220" ry="150" fill={`url(#${id}-glow)`} filter={`url(#${id}-soft)`}/>}

      {/* rings: two gold hairlines + a faint steel hairline (the metal whisper) */}
      <circle cx="300" cy="300" r="226" fill="none" stroke={`url(#${id}-au)`} strokeWidth="1.6" opacity="0.85"/>
      <circle cx="300" cy="300" r="219" fill="none" stroke="#9AA3AF" strokeWidth="0.8" opacity="0.28"/>
      <circle cx="300" cy="300" r="182" fill="none" stroke={`url(#${id}-au)`} strokeWidth="1.1" opacity="0.7"/>

      {showInscription && (
        <text fontFamily="'Cinzel', serif" fontSize="18" fontWeight="600" letterSpacing="2.5" fill={`url(#${id}-au)`} opacity="0.92">
          <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">{motto}</textPath>
        </text>
      )}

      {/* side diamonds removed per direction */}

      <Medallion id={id} cx={300} cy={74}/>
      <Centered cx={300} cy={300}><WordTabor id={id} size={116} stretchX={1.06}/></Centered>
    </svg>
  );
}

// ── Wordmark only (compact lockup) ──
function TaborWordmark({ id = "wm", tagline = true }) {
  return (
    <div style={{textAlign:"center"}}>
      <svg viewBox="0 0 600 230" width="100%" style={{display:"block", maxHeight:200, overflow:"visible"}}>
        <MarkDefs id={id}/>
        <WordTabor id={id} y={166} size={132}/>
      </svg>
      {tagline && (
        <div style={{display:"flex", alignItems:"center", gap:14, justifyContent:"center", marginTop:6}}>
          <div style={{width:48, height:1, background:"linear-gradient(90deg, transparent, var(--holy-gold))"}}/>
          <span style={{fontFamily:"'Cinzel', serif", fontWeight:600, fontSize:12, letterSpacing:"0.42em", color:"var(--holy-gold)", textTransform:"uppercase"}}>Sons of Fire</span>
          <div style={{width:48, height:1, background:"linear-gradient(90deg, var(--holy-gold), transparent)"}}/>
        </div>
      )}
    </div>
  );
}

// ── Icon seal only (app icon) ──
function TaborIconSeal({ id = "ic", size = 200 }) {
  return (
    <svg viewBox="0 0 240 240" width={size} height={size} style={{display:"block"}}>
      <MarkDefs id={id}/>
      <circle cx="120" cy="120" r="116" fill="none" stroke={`url(#${id}-au)`} strokeWidth="2" opacity="0.85"/>
      <circle cx="120" cy="120" r="108" fill="none" stroke="#9AA3AF" strokeWidth="0.8" opacity="0.3"/>
      <circle cx="120" cy="120" r="100" fill="none" stroke={`url(#${id}-au)`} strokeWidth="1.2" opacity="0.6"/>
      {/* gothic cross */}
      <g stroke={`url(#${id}-au)`} strokeWidth="3.4" strokeLinecap="round">
        <path d="M120,44 L120,72 M108,56 L132,56 M112,50 L128,50"/>
      </g>
      <circle cx="104" cy="92" r="2.6" fill="#F6EAC2"/>
      <circle cx="120" cy="84" r="3.2" fill="#F6EAC2"/>
      <circle cx="136" cy="92" r="2.6" fill="#F6EAC2"/>
      <path d="M70,176 L104,116 L120,140 L140,108 L172,176 Z" fill={`url(#${id}-seal)`} stroke="#3A2A0A" strokeWidth="1"/>
      <path d="M104,116 L114,132 L107,140 L98,128 Z" fill="#FBF1CF" opacity="0.7"/>
      <path d="M140,108 L152,128 L145,136 L134,120 Z" fill="#FBF1CF" opacity="0.7"/>
      <line x1="70" y1="176" x2="172" y2="176" stroke={`url(#${id}-au)`} strokeWidth="2"/>
    </svg>
  );
}

Object.assign(window, { MarkDefs, WordTabor, Medallion, TaborEmblem, TaborWordmark, TaborIconSeal });
