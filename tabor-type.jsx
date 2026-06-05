// tabor-type.jsx — TABOR wordmark · spray-paint / street type study
// PERF: no live CSS filter:url() on DOM text (those recompute feTurbulence every
// paint and lock the thread when many mount at once). Grit comes from: the spray
// fonts themselves, ONE shared cached concrete texture, a cached overspray
// speckle raster, gradient paint fills, soft text-shadow bleed, and CSS drips.

// ── Shared cached textures (single URL each → browser rasterizes once) ──
const CONCRETE = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
     <filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/>
       <feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0'/></filter>
     <rect width='100%' height='100%' filter='url(#c)'/></svg>`);

const SPECKLE = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
     <filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='1' seed='6'/>
       <feColorMatrix values='0 0 0 0 0.788  0 0 0 0 0.662  0 0 0 0 0.380  0 0 0 16 -9'/></filter>
     <rect width='100%' height='100%' filter='url(#s)'/></svg>`);

// Wall ground: matte black with cached concrete grain
function Wall({ children, tone = "black" }) {
  const bg = tone === "black" ? "#0A0A0A" : tone === "ivory" ? "#E8E2D5" : "#15151A";
  return (
    <div style={{
      width:"100%", height:"100%", background:bg, position:"relative", overflow:"hidden",
      display:"grid", placeItems:"center",
    }}>
      <div style={{position:"absolute", inset:0, opacity:0.35, mixBlendMode:"overlay",
        backgroundImage:`url("${CONCRETE}")`, backgroundSize:"300px 300px", pointerEvents:"none"}}/>
      {children}
    </div>
  );
}

// Overspray mist (single cached raster, no live filter)
function Overspray({ opacity = 0.5, spread = 30 }) {
  return (
    <div aria-hidden="true" style={{
      position:"absolute", inset:`-${spread}px`,
      backgroundImage:`url("${SPECKLE}")`, backgroundSize:"220px 220px",
      opacity,
      WebkitMaskImage:"radial-gradient(ellipse 60% 55% at 50% 50%, #000 28%, transparent 78%)",
      maskImage:"radial-gradient(ellipse 60% 55% at 50% 50%, #000 28%, transparent 78%)",
      pointerEvents:"none", mixBlendMode:"screen",
    }}/>
  );
}

// Gold / ivory paint fills (gradient = cheap)
const goldFoil = {
  background:"linear-gradient(176deg, #F4E2AC 0%, #D8B86E 35%, #C9A961 60%, #9C7728 100%)",
  WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent",
  textShadow:"0 0 0 transparent",
};
const ivorySpray = {
  background:"linear-gradient(176deg, #FBF7EC 0%, #E8E2D5 60%, #B8AE96 100%)",
  WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent",
};
// Soft spray-edge bleed via shadow (cheap substitute for displacement)
const bleed = { filter:"drop-shadow(0 0 1.2px rgba(201,169,97,0.55))" };
const bleedIvory = { filter:"drop-shadow(0 0 1.2px rgba(232,226,213,0.5))" };

function Drip({ left, height = 38, color = "#C9A961" }) {
  return (
    <span aria-hidden="true" style={{
      position:"absolute", left, top:"86%", width:5, height,
      background:`linear-gradient(180deg, ${color}, ${color} 60%, transparent)`,
      borderRadius:"0 0 50% 50%",
    }}>
      <span style={{position:"absolute", bottom:-3, left:-1.5, width:8, height:8, borderRadius:"50%", background:color}}/>
    </span>
  );
}

function TypeLockup({ children, mark = "primary", markSize = 70, tone = "black", tagline = "SONS OF FIRE", taglineColor = "var(--holy-gold)" }) {
  const Mark = mark === "disc" ? TaborDisc : mark === "line" ? TaborLine : TaborPrimary;
  return (
    <Wall tone={tone}>
      <div style={{position:"relative", textAlign:"center", padding:"10px 20px"}}>
        {mark !== "none" && (
          <div style={{marginBottom:6, display:"flex", justifyContent:"center"}}>
            <Mark size={markSize}/>
          </div>
        )}
        {children}
        {tagline && (
          <div style={{fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.4em",
            color:taglineColor, marginTop:14, textTransform:"uppercase"}}>{tagline}</div>
        )}
      </div>
    </Wall>
  );
}

// ═══════════ OPTIONS ═══════════

function W_StencilSpray() {
  return (
    <TypeLockup>
      <div style={{position:"relative", display:"inline-block"}}>
        <Overspray opacity={0.55} spread={34}/>
        <h1 style={{...goldFoil, ...bleed, fontFamily:"'Rubik Spray Paint', sans-serif", fontSize:78, margin:0, letterSpacing:"0.02em"}}>
          TABOR
        </h1>
      </div>
    </TypeLockup>
  );
}

function W_SprayBleed() {
  return (
    <TypeLockup>
      <div style={{position:"relative", display:"inline-block"}}>
        <Overspray opacity={0.7} spread={40}/>
        <h1 style={{...goldFoil, ...bleed, fontFamily:"'Archivo Black', sans-serif", fontSize:66, margin:0, letterSpacing:"-0.01em"}}>
          TABOR
        </h1>
        <Drip left="22%" height={30}/>
        <Drip left="58%" height={46}/>
        <Drip left="80%" height={22}/>
      </div>
    </TypeLockup>
  );
}

function W_WetDrip() {
  return (
    <TypeLockup>
      <div style={{position:"relative", display:"inline-block"}}>
        <Overspray opacity={0.4} spread={28}/>
        <h1 style={{...goldFoil, fontFamily:"'Rubik Wet Paint', sans-serif", fontSize:72, margin:0, letterSpacing:"0.01em"}}>
          TABOR
        </h1>
      </div>
    </TypeLockup>
  );
}

function W_MarkerTag() {
  return (
    <TypeLockup mark="line" markSize={56}>
      <div style={{position:"relative", display:"inline-block", transform:"rotate(-4deg)"}}>
        <Overspray opacity={0.3} spread={22}/>
        <h1 style={{...ivorySpray, ...bleedIvory, fontFamily:"'Permanent Marker', cursive", fontSize:74, margin:0, letterSpacing:"0.01em"}}>
          TABOR
        </h1>
        <svg width="100%" height="20" viewBox="0 0 240 20" style={{position:"absolute", left:0, top:"96%"}}>
          <path d="M6 12 q120 16 230 -4" fill="none" stroke="#C9A961" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
    </TypeLockup>
  );
}

function W_MilStencil() {
  return (
    <TypeLockup mark="disc" markSize={64}>
      <div style={{position:"relative", display:"inline-block"}}>
        <Overspray opacity={0.5} spread={30}/>
        <h1 style={{...goldFoil, ...bleed, fontFamily:"'Black Ops One', system-ui", fontSize:64, margin:0, letterSpacing:"0.04em"}}>
          TABOR
        </h1>
      </div>
    </TypeLockup>
  );
}

function W_Guerrilla() {
  return (
    <TypeLockup tone="black">
      <div style={{position:"relative", display:"inline-block"}}>
        <Overspray opacity={0.45} spread={32}/>
        <h1 style={{...ivorySpray, fontFamily:"'Protest Guerrilla', system-ui", fontSize:84, margin:0, lineHeight:0.9}}>
          TABOR
        </h1>
        <div style={{height:8, background:"linear-gradient(90deg,#9C7728,#E6CB85,#9C7728)", marginTop:8}}/>
      </div>
    </TypeLockup>
  );
}

function W_Urban() {
  return (
    <TypeLockup mark="none">
      <div style={{position:"relative", display:"inline-block"}}>
        <Overspray opacity={0.4} spread={26}/>
        <h1 style={{...goldFoil, fontFamily:"'Bungee', system-ui", fontSize:54, margin:0, lineHeight:0.95, letterSpacing:"0.02em"}}>
          TABOR
        </h1>
      </div>
    </TypeLockup>
  );
}

function W_Hybrid() {
  return (
    <TypeLockup mark="primary" markSize={76} tagline={null}>
      <div style={{position:"relative", display:"inline-block"}}>
        <svg width="40" height="40" viewBox="0 0 40 40" style={{position:"absolute", left:"30%", top:-22, zIndex:3}}>
          <g stroke="#C9A961" strokeWidth="3.5" strokeLinecap="round">
            <line x1="20" y1="6" x2="20" y2="24"/>
            <line x1="11" y1="15" x2="29" y2="15"/>
          </g>
        </svg>
        <Overspray opacity={0.35} spread={24}/>
        <h1 className="holy-display" style={{fontSize:72, margin:0, color:"var(--holy-ivory)", letterSpacing:"0.03em"}}>
          TABOR
        </h1>
        <div style={{position:"relative", marginTop:10, display:"inline-block"}}>
          <span style={{...goldFoil, fontFamily:"'Permanent Marker', cursive", fontSize:22, letterSpacing:"0.04em", transform:"rotate(-2deg)", display:"inline-block"}}>
            sons of fire
          </span>
        </div>
      </div>
    </TypeLockup>
  );
}

function W_Eroded() {
  return (
    <TypeLockup mark="none">
      <div style={{position:"relative", display:"inline-block"}}>
        <Overspray opacity={0.5} spread={30}/>
        <h1 style={{...goldFoil, ...bleed, fontFamily:"'Anton', system-ui", fontSize:92, margin:0, letterSpacing:"0.02em"}}>
          TABOR
        </h1>
      </div>
    </TypeLockup>
  );
}

Object.assign(window, {
  W_StencilSpray, W_SprayBleed, W_WetDrip, W_MarkerTag, W_MilStencil,
  W_Guerrilla, W_Urban, W_Hybrid, W_Eroded, TypeLockup, Wall, Overspray,
});
