// tabor-calligraffiti.jsx — refined sacred blackletter emblem (no drips)
// Clean coin-seal layout: concentric gold hairlines, an upright bottom-arc
// inscription, a self-framed mountain medallion at 12 o'clock that breaks the
// ring, and the blackletter word sized to sit fully inside the inner ring.

function CalligraffitiMark({
  ink = "#F3EEE2", inkShadow = "rgba(0,0,0,0.5)",
  ringText = "#A33636", ringHair = "#C9A961",
  glow = "rgba(201,169,97,0.28)", showGlow = true,
  word = "Tabor", maxHeight = 520,
}) {
  const motto = "✦   SONS OF FIRE   ✦   ΘΕΩΣΙΣ   ✦   MOUNT OF LIGHT   ✦";
  return (
    <svg viewBox="0 0 600 600" width="100%" style={{display:"block", maxHeight}}>
      <defs>
        <radialGradient id="cg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glow}/><stop offset="70%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
        <radialGradient id="cg-seal" cx="42%" cy="36%" r="66%">
          <stop offset="0%" stopColor="#F6E6B0"/><stop offset="58%" stopColor="#C9A961"/>
          <stop offset="100%" stopColor="#7E5A1E"/>
        </radialGradient>
        <linearGradient id="cg-ink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ink}/><stop offset="80%" stopColor={ink}/>
          <stop offset="100%" stopColor="#CFC7B6"/>
        </linearGradient>
        {/* bottom arc, left→right through the bottom → upright motto */}
        <path id="cg-bottom" d="M90,300 A210,210 0 0 1 510,300"/>
        <filter id="cg-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10"/>
        </filter>
      </defs>

      {showGlow && <ellipse cx="300" cy="300" rx="230" ry="150" fill="url(#cg-glow)" filter="url(#cg-soft)"/>}

      {/* concentric structure */}
      <circle cx="300" cy="300" r="238" fill="none" stroke={ringHair} strokeWidth="1.6" opacity="0.6"/>
      <circle cx="300" cy="300" r="226" fill="none" stroke={ringText} strokeWidth="1" opacity="0.45"/>
      <circle cx="300" cy="300" r="182" fill="none" stroke={ringHair} strokeWidth="1.1" opacity="0.45"/>

      {/* upright bottom-arc inscription */}
      <text fontFamily="'Cinzel', serif" fontSize="20" fontWeight="600" letterSpacing="2.5"
            fill={ringText} opacity="0.95">
        <textPath href="#cg-bottom" startOffset="50%" textAnchor="middle">{motto}</textPath>
      </text>

      {/* balancing ornaments: stars upper-sides, crosses at 3 & 9 */}
      <g fill={ringHair}>
        <path d="M128,180 l4,11 11,1 -9,7 3,11 -10,-6 -10,6 3,-11 -9,-7 11,-1Z" opacity="0.85"/>
        <path d="M472,180 l4,11 11,1 -9,7 3,11 -10,-6 -10,6 3,-11 -9,-7 11,-1Z" opacity="0.85"/>
      </g>
      <g stroke={ringHair} strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
        <path d="M90,293 L90,307 M83,300 L97,300"/>
        <path d="M510,293 L510,307 M503,300 L517,300"/>
      </g>

      {/* mountain medallion at 12 o'clock — self-framed dark disc breaks the ring */}
      <g transform="translate(300,62)">
        <circle r="34" fill="#0A0A0A" stroke={ringHair} strokeWidth="1.6"/>
        <circle r="27" fill="url(#cg-seal)"/>
        <path d="M-16,13 L-3,-7 L4,2 L11,-9 L17,13 Z" fill="#0E0A04" stroke="#3A2A0A" strokeWidth="0.5"/>
        <circle cx="-3" cy="-12" r="2.1" fill="#FBF1CF"/>
        <circle cx="6"  cy="-15" r="2.5" fill="#FBF1CF"/>
        <circle cx="14" cy="-11" r="2.1" fill="#FBF1CF"/>
      </g>

      {/* blackletter word — shadow copy for depth, then fill; fits inside inner ring */}
      <text x="302" y="348" textAnchor="middle" fontFamily="'UnifrakturMaguntia', serif"
            fontSize="150" fill={inkShadow}>{word}</text>
      <text x="300" y="345" textAnchor="middle" fontFamily="'UnifrakturMaguntia', serif"
            fontSize="150" fill="url(#cg-ink)" stroke={ink} strokeWidth="1.4"
            paintOrder="stroke">{word}</text>
    </svg>
  );
}

Object.assign(window, { CalligraffitiMark });
