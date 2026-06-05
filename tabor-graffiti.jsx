// tabor-graffiti.jsx — TABOR drawn as REAL graffiti (custom SVG letterforms)
// Styles: Gold Throw-Up · Handstyle Tag · Blackletter Calligraffiti · Crimson colorway
const { useState: useStateG } = React;

// Static speckle: plain SVG circles (deterministic, no feTurbulence, no blend/mask).
const SPECKLE = (() => {
  let s = 1; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  let dots = "";
  for (let i = 0; i < 130; i++) {
    const x = (rnd()*240).toFixed(1), y = (rnd()*240).toFixed(1);
    const r = (rnd()*1.1 + 0.4).toFixed(1), o = (rnd()*0.5 + 0.3).toFixed(2);
    dots += `<circle cx='${x}' cy='${y}' r='${r}' fill='%23DBB86B' fill-opacity='${o}'/>`;
  }
  for (let i = 0; i < 14; i++) {
    const x = (rnd()*240).toFixed(1), y = (rnd()*240).toFixed(1);
    const r = (rnd()*2.2 + 1.3).toFixed(1), o = (rnd()*0.35 + 0.2).toFixed(2);
    dots += `<circle cx='${x}' cy='${y}' r='${r}' fill='%23E6C878' fill-opacity='${o}'/>`;
  }
  return "data:image/svg+xml," + "%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E" + dots + "%3C/svg%3E";
})();

// Concrete = pure CSS gradients (no image, no turbulence). Cheap to composite.
const concreteBg = `
  radial-gradient(ellipse 90% 60% at 50% 0%, rgba(40,36,32,0.9), transparent 60%),
  radial-gradient(ellipse 70% 50% at 18% 90%, rgba(30,27,24,0.7), transparent 65%),
  radial-gradient(ellipse 60% 45% at 85% 75%, rgba(22,20,18,0.8), transparent 60%),
  #0A0A0A`;

function Wall({ children, brick = false, pad = "44px 32px" }) {
  return (
    <div style={{position:"relative", overflow:"hidden", background:concreteBg, padding:pad}}>
      {children}
    </div>
  );
}

function Speckle({ opacity = 0.45, inset = -10 }) {
  return <div aria-hidden="true" style={{position:"absolute", inset, backgroundImage:`url("${SPECKLE}")`, backgroundSize:"240px 240px", opacity, pointerEvents:"none"}}/>;
}

// Drip: outlined gold/ivory run with a bead
function gripDrip(x, top, len, fillId, w = 13) {
  return (
    <g key={`d${x}-${top}`}>
      <line x1={x} y1={top} x2={x} y2={top+len} stroke="#0A0A0A" strokeWidth={w+9} strokeLinecap="round"/>
      <circle cx={x} cy={top+len} r={(w+9)/2} fill="#0A0A0A"/>
      <line x1={x} y1={top} x2={x} y2={top+len} stroke={`url(#${fillId})`} strokeWidth={w} strokeLinecap="round"/>
      <circle cx={x} cy={top+len} r={w/2 + 2} fill={`url(#${fillId})`}/>
      <circle cx={x-2} cy={top+len-2} r={2.4} fill="#FBF1CF" opacity="0.8"/>
    </g>
  );
}

// ════════════ 1 · GOLD THROW-UP ════════════
// Skeleton center-lines rendered as fat black outline + gold fill (bubble).
const COLORWAYS = {
  "tu-gold": ["#F8E9BC","#D8B86E","#C9A961","#8A6420"],
  "tu-crim": ["#E08585","#C03A3A","#8E2424","#4E1010"],
};
function ThrowUp({ fillId = "tu-gold", glow = "#C9A961", glowOp = 0.5, hi = "#FBF1CF" }) {
  const cw = COLORWAYS[fillId] || COLORWAYS["tu-gold"];
  const letters = [
    "M34,72 L116,72", "M75,72 L75,212",                                  // T
    "M134,212 L176,72 L218,212", "M152,156 L200,156",                    // A
    "M250,72 L250,212", "M250,72 C306,72 306,140 250,140", "M250,140 C320,140 320,212 250,212", // B
    "M470,212 L470,72", "M470,72 C524,72 524,142 470,142", "M470,142 L520,212", // R
  ];
  const Strokes = ({ stroke, w, op = 1, lj = "round" }) => (
    <g fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin={lj} opacity={op}>
      {letters.map((d,i)=><path key={i} d={d}/>)}
      <ellipse cx="392" cy="142" rx="48" ry="70"/>
    </g>
  );
  return (
    <svg viewBox="0 0 600 320" width="100%" style={{display:"block", overflow:"visible"}}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cw[0]}/><stop offset="38%" stopColor={cw[1]}/>
          <stop offset="68%" stopColor={cw[2]}/><stop offset="100%" stopColor={cw[3]}/>
        </linearGradient>
        <filter id={`${fillId}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7"/>
        </filter>
      </defs>

      {/* glow halo */}
      <g transform="translate(26,0) skewX(-7)" filter={`url(#${fillId}-blur)`} opacity={glowOp}>
        <Strokes stroke={glow} w={40}/>
      </g>
      {/* letters: black keyline + gold fill */}
      <g transform="translate(26,0) skewX(-7)">
        <Strokes stroke="#0A0A0A" w={50}/>
        <Strokes stroke={`url(#${fillId})`} w={34}/>
        {/* inner highlights */}
        <g fill="none" stroke={hi} strokeWidth="5" strokeLinecap="round" opacity="0.85">
          <path d="M67,92 L67,150"/><path d="M242,92 L242,150"/>
          <path d="M462,92 L462,150"/><path d="M360,96 C346,110 346,150 352,168"/>
          <path d="M156,150 L168,116"/>
        </g>
      </g>

      {/* drips (vertical, outside skew) */}
      {gripDrip(70, 206, 40, fillId)}
      {gripDrip(150, 206, 26, fillId)}
      {gripDrip(214, 206, 52, fillId)}
      {gripDrip(262, 208, 30, fillId)}
      {gripDrip(392, 206, 64, fillId)}
      {gripDrip(508, 206, 36, fillId)}

      {/* crown — three spikes = three lights of Tabor, center is a cross */}
      <g transform="translate(0,-2)">
        <path d="M252,62 L274,24 L300,50 L322,14 L344,50 L370,24 L392,62 Z"
              fill={`url(#${fillId})`} stroke="#0A0A0A" strokeWidth="6" strokeLinejoin="round"/>
        <circle cx="274" cy="20" r="6" fill={`url(#${fillId})`} stroke="#0A0A0A" strokeWidth="4"/>
        <circle cx="370" cy="20" r="6" fill={`url(#${fillId})`} stroke="#0A0A0A" strokeWidth="4"/>
        {/* central cross atop middle spike */}
        <g stroke="#0A0A0A" strokeWidth="9" strokeLinecap="round"><path d="M322,2 L322,22 M312,9 L332,9"/></g>
        <g stroke={`url(#${fillId})`} strokeWidth="4.5" strokeLinecap="round"><path d="M322,2 L322,22 M312,9 L332,9"/></g>
      </g>
    </svg>
  );
}

// ════════════ 2 · HANDSTYLE TAG ════════════
// Flowing single-weight marker tag, drawn from stroked sub-paths + whip/arrow/crown.
function Handstyle({ ink = "#E8E2D5", accent = "#C9A961" }) {
  return (
    <svg viewBox="0 0 620 300" width="100%" style={{display:"block", overflow:"visible"}}>
      <defs>
        <filter id="hs-sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="4" stdDeviation="0" floodColor="#000" floodOpacity="0.55"/>
        </filter>
      </defs>
      <g filter="url(#hs-sh)" fill="none" stroke={ink} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
        {/* T — flag top whip + stem with tail */}
        <path d="M70,70 C120,48 175,52 225,66"/>
        <path d="M150,58 C146,110 150,165 168,196 C176,210 188,210 200,200"/>
        {/* a */}
        <path d="M250,128 C214,118 210,182 246,182 C262,182 270,166 270,140 C270,166 274,186 296,190"/>
        {/* b */}
        <path d="M312,60 C306,120 306,168 314,192 M312,150 C322,126 360,126 364,154 C368,182 332,196 314,184"/>
        {/* o */}
        <path d="M392,140 C372,138 368,186 396,186 C420,186 424,150 404,142 C396,139 392,140 392,140Z"/>
        {/* r + ending flick */}
        <path d="M442,150 C440,170 442,184 448,192 M442,156 C452,134 470,128 486,138 C496,144 500,134 506,126"/>
        {/* long underline whip with arrowhead */}
        <path d="M120,236 C260,266 420,262 540,222"/>
        <path d="M540,222 L512,222 M540,222 L528,244"/>
      </g>
      {/* crown */}
      <g transform="translate(150,2)" filter="url(#hs-sh)">
        <path d="M0,40 L16,10 L34,32 L52,6 L70,32 L88,10 L104,40"
              fill="none" stroke={accent} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      {/* star + dots garnish */}
      <g fill={accent}>
        <path d="M556,150 l6,16 17,1 -13,11 5,16 -15,-9 -15,9 5,-16 -13,-11 17,-1Z"/>
        <circle cx="98" cy="120" r="5"/><circle cx="600" cy="200" r="5"/>
      </g>
      {/* a couple of drips off the tag */}
      {gripDrip(168, 198, 30, "hs-grad", 9)}
      {gripDrip(396, 186, 24, "hs-grad", 9)}
      <defs>
        <linearGradient id="hs-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ink}/><stop offset="100%" stopColor="#9A948700"/>
          <stop offset="100%" stopColor="#8A847A"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ════════════ 3 · BLACKLETTER CALLIGRAFFITI ════════════
// Drippy blackletter handstyle + crimson/gold calligraphy halo ring (the "unity" energy).
function Calligraffiti() {
  const ring = "ΤΑΒΩΡ ✝ SONS OF FIRE ✝ ΘΕΩΣΙΣ ✝ ";
  return (
    <div style={{position:"relative", display:"grid", placeItems:"center", padding:"8px 0"}}>
      {/* calligraphy halo ring */}
      <svg viewBox="0 0 460 460" width="380" height="380" style={{position:"absolute", opacity:0.85}}>
        <defs>
          <path id="ringpath" d="M230,230 m-168,0 a168,168 0 1,1 336,0 a168,168 0 1,1 -336,0"/>
        </defs>
        <circle cx="230" cy="230" r="200" fill="none" stroke="#7A1F1F" strokeWidth="1" opacity="0.5"/>
        <text fontFamily="'Pirata One', 'UnifrakturMaguntia', serif" fontSize="30" letterSpacing="6">
          <textPath href="#ringpath" startOffset="0%" fill="#7A1F1F">{ring + ring}</textPath>
        </text>
        <text fontFamily="'Pirata One', 'UnifrakturMaguntia', serif" fontSize="14" letterSpacing="10" opacity="0.7">
          <textPath href="#ringpath" startOffset="50%" fill="#C9A961">{ring}</textPath>
        </text>
      </svg>
      {/* main blackletter word */}
      <div style={{position:"relative", textAlign:"center"}}>
        <div style={{
          fontFamily:"'UnifrakturMaguntia', serif", fontSize:96, lineHeight:0.9,
          color:"#F3EEE2", letterSpacing:"0.01em",
          textShadow:"0 2px 0 rgba(0,0,0,0.6), 0 0 22px rgba(201,169,97,0.25)",
        }}>Tabor</div>
        {/* paint drips hanging from the word */}
        <svg viewBox="0 0 360 120" width="360" style={{position:"absolute", left:"50%", top:"62%", transform:"translateX(-50%)", overflow:"visible"}}>
          {[[60,0,70],[110,8,46],[150,4,90],[205,2,58],[250,10,40],[300,0,76]].map(([x,t,l],i)=>(
            <g key={i}>
              <line x1={x} y1={t} x2={x} y2={t+l} stroke="#F3EEE2" strokeWidth="7" strokeLinecap="round"/>
              <circle cx={x} cy={t+l} r="6" fill="#F3EEE2"/>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

Object.assign(window, { ThrowUp, Handstyle, Calligraffiti, Wall, Speckle });
