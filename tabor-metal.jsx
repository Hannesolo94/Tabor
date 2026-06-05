// tabor-metal.jsx — TABOR grimdark / metal / 40K-gothic direction
// Gunmetal + Byzantine gold + crimson wax. Chrome blackletter, iron seal with
// the mountain, rivets, purity-seal. No turbulence (cached/CSS only); minimal blur.

// ── Shared metal defs (one <defs> injected per SVG via <MetalDefs/>) ──
function MetalDefs({ id }) {
  return (
    <defs>
      {/* chrome for letters: light top → dark horizon → light bottom */}
      <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#EEF2F6"/>
        <stop offset="34%" stopColor="#AEB7C2"/>
        <stop offset="50%" stopColor="#565D67"/>
        <stop offset="51%" stopColor="#3C424B"/>
        <stop offset="68%" stopColor="#C7CED7"/>
        <stop offset="100%" stopColor="#838A95"/>
      </linearGradient>
      {/* brushed steel band (vertical) */}
      <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#9AA3AF"/>
        <stop offset="22%" stopColor="#5A616B"/>
        <stop offset="50%" stopColor="#33373E"/>
        <stop offset="78%" stopColor="#4A515B"/>
        <stop offset="100%" stopColor="#777E89"/>
      </linearGradient>
      {/* gold trim */}
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stopColor="#F6E6B0"/>
        <stop offset="42%" stopColor="#D4B36C"/>
        <stop offset="60%" stopColor="#B7923F"/>
        <stop offset="100%" stopColor="#7E5A1E"/>
      </linearGradient>
      <radialGradient id={`${id}-seal`} cx="42%" cy="36%" r="66%">
        <stop offset="0%" stopColor="#F6E6B0"/><stop offset="58%" stopColor="#C9A961"/>
        <stop offset="100%" stopColor="#7E5A1E"/>
      </radialGradient>
      <radialGradient id={`${id}-wax`} cx="40%" cy="36%" r="68%">
        <stop offset="0%" stopColor="#B23A38"/><stop offset="60%" stopColor="#7A1F1F"/>
        <stop offset="100%" stopColor="#3A0F0F"/>
      </radialGradient>
    </defs>
  );
}

function rivet(x, y, r = 5, key) {
  return (
    <g key={key}>
      <circle cx={x} cy={y} r={r} fill="#23262B"/>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#111316" strokeWidth="1"/>
      <circle cx={x-r*0.3} cy={y-r*0.3} r={r*0.42} fill="#9AA3AF" opacity="0.8"/>
    </g>
  );
}

// Iron armour plate ground with gold keyline + corner rivets
function MetalPlate({ children, pad = "54px 44px", radius = 4 }) {
  const steel = `
    radial-gradient(ellipse 100% 80% at 50% 0%, #3A3F47 0%, #23262B 55%, #15171B 100%)`;
  const brushed = `repeating-linear-gradient(180deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 3px)`;
  return (
    <div style={{position:"relative", background:`${brushed}, ${steel}`, padding:pad, borderRadius:radius, overflow:"hidden"}}>
      {/* gold inner keyline */}
      <div style={{position:"absolute", inset:14, border:"1px solid rgba(201,169,97,0.5)", boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.5)", pointerEvents:"none"}}/>
      <div style={{position:"absolute", inset:18, border:"1px solid rgba(201,169,97,0.18)", pointerEvents:"none"}}/>
      {/* corner rivets */}
      <svg style={{position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none"}}>
        {[["6%","8%"],["94%","8%"],["6%","92%"],["94%","92%"]].map(([x,y],i)=>(
          <g key={i} transform={`translate(${x==="6%"?26:0},0)`}/>
        ))}
      </svg>
      <PlateRivets/>
      <div style={{position:"relative"}}>{children}</div>
    </div>
  );
}
function PlateRivets() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none"}}>
      <g>
        {[[4,5],[96,5],[4,95],[96,95]].map(([x,y],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r="1.1" fill="#1A1C20"/>
            <circle cx={x-0.3} cy={y-0.4} r="0.5" fill="#9AA3AF" opacity="0.8"/>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Metal blackletter wordmark ──
function MetalWordmark({ text = "TABOR", id = "wm", fontSize = 150, family = "'Grenze Gotisch', serif", weight = 700 }) {
  return (
    <svg viewBox="0 0 760 230" width="100%" style={{display:"block", overflow:"visible"}}>
      <MetalDefs id={id}/>
      {/* drop shadow */}
      <text x="382" y="172" textAnchor="middle" fontFamily={family} fontWeight={weight} fontSize={fontSize} fill="#000" opacity="0.55">{text}</text>
      {/* gold edge */}
      <text x="380" y="169" textAnchor="middle" fontFamily={family} fontWeight={weight} fontSize={fontSize}
            fill={`url(#${id}-gold)`} stroke={`url(#${id}-gold)`} strokeWidth="7" paintOrder="stroke" strokeLinejoin="round">{text}</text>
      {/* chrome face + thin dark keyline */}
      <text x="380" y="169" textAnchor="middle" fontFamily={family} fontWeight={weight} fontSize={fontSize}
            fill={`url(#${id}-chrome)`} stroke="#15171B" strokeWidth="0.8" paintOrder="stroke">{text}</text>
    </svg>
  );
}

// ── Iron seal medallion (with mountain) ──
function IronSeal({ id = "seal", size = 240 }) {
  return (
    <svg viewBox="0 0 240 240" width={size} height={size} style={{display:"block"}}>
      <MetalDefs id={id}/>
      {/* outer steel ring */}
      <circle cx="120" cy="120" r="112" fill="none" stroke={`url(#${id}-steel)`} strokeWidth="16"/>
      <circle cx="120" cy="120" r="120" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.6"/>
      <circle cx="120" cy="120" r="103" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.6"/>
      {/* rivets around ring */}
      {Array.from({length:12}).map((_,i)=>{
        const a = (i*Math.PI*2)/12 - Math.PI/2;
        return rivet(120+Math.cos(a)*112, 120+Math.sin(a)*112, 3.4, i);
      })}
      {/* inner field */}
      <circle cx="120" cy="120" r="95" fill="#0E0F12"/>
      <circle cx="120" cy="120" r="95" fill="none" stroke="#1C1F24" strokeWidth="2"/>
      {/* gothic cross above mountain */}
      <g stroke={`url(#${id}-gold)`} strokeWidth="3.4" strokeLinecap="round">
        <path d="M120,42 L120,72 M108,54 L132,54 M112,48 L128,48"/>
      </g>
      {/* three lights */}
      <circle cx="104" cy="92" r="2.6" fill="#F6E6B0"/>
      <circle cx="120" cy="84" r="3.2" fill="#F6E6B0"/>
      <circle cx="136" cy="92" r="2.6" fill="#F6E6B0"/>
      {/* mountain — steel with gold-lit faces */}
      <path d="M70,176 L104,116 L120,140 L140,108 L172,176 Z" fill={`url(#${id}-steel)`} stroke="#111316" strokeWidth="1.4"/>
      <path d="M104,116 L114,132 L107,140 L98,128 Z" fill={`url(#${id}-gold)`} opacity="0.92"/>
      <path d="M140,108 L154,130 L146,138 L134,122 Z" fill={`url(#${id}-gold)`} opacity="0.92"/>
      {/* base line */}
      <line x1="70" y1="176" x2="172" y2="176" stroke={`url(#${id}-gold)`} strokeWidth="2"/>
    </svg>
  );
}

// ── Purity seal: wax blob + parchment ribbon + motto ──
function PuritySeal({ id = "ps" }) {
  return (
    <svg viewBox="0 0 200 220" width="160" style={{display:"block"}}>
      <MetalDefs id={id}/>
      {/* parchment strips */}
      <g>
        <path d="M86,40 L114,40 L120,180 L108,196 L100,184 L92,196 L80,180 Z" fill="#E6DCC2"/>
        <path d="M86,40 L114,40 L120,180 L108,196 L100,184 L92,196 L80,180 Z" fill="none" stroke="#B8A87E" strokeWidth="1"/>
        <path d="M70,52 L96,46 L100,150 L88,162 L82,150 L74,160 L66,146 Z" fill="#D8CCAC" transform="rotate(-6 85 100)"/>
      </g>
      {/* blackletter motto on strip */}
      <text x="100" y="96" textAnchor="middle" fontFamily="'Grenze Gotisch', serif" fontWeight="600"
            fontSize="15" fill="#3A2A14" letterSpacing="1" transform="rotate(-2 100 96)">SONS</text>
      <text x="100" y="118" textAnchor="middle" fontFamily="'Grenze Gotisch', serif" fontWeight="600"
            fontSize="15" fill="#3A2A14" letterSpacing="1" transform="rotate(-2 100 118)">OF FIRE</text>
      {/* wax seal */}
      <circle cx="100" cy="36" r="26" fill={`url(#${id}-wax)`}/>
      <circle cx="100" cy="36" r="20" fill="none" stroke="#3A0F0F" strokeWidth="1" opacity="0.6"/>
      <g stroke="#3A0F0F" strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
        <path d="M100,26 L100,46 M90,36 L110,36 M94,30 L106,30"/>
      </g>
    </svg>
  );
}

Object.assign(window, { MetalDefs, MetalPlate, MetalWordmark, IronSeal, PuritySeal, rivet });
