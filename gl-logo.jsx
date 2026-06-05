// gl-logo.jsx — Brand guidelines: shared shell + identity sections
// Reuses tabor-mark.jsx components (TaborEmblem, WordTabor, TaborIconSeal, MarkDefs).

function GLSection({ n, kicker, title, children, first }) {
  return (
    <section style={{maxWidth:1000, margin:"0 auto", padding:"60px 28px", borderTop: first ? "none" : "1px solid rgba(201,169,97,0.14)"}}>
      <div style={{display:"flex", alignItems:"baseline", gap:14, marginBottom:8}}>
        <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--holy-gold)", letterSpacing:"0.22em"}}>{n}</span>
        <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-ivory-muted)", letterSpacing:"0.2em", textTransform:"uppercase"}}>{kicker}</span>
      </div>
      <h2 style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:34, margin:0, color:"var(--holy-ivory)", letterSpacing:"0.04em"}}>{title}</h2>
      <div style={{marginTop:30}}>{children}</div>
    </section>
  );
}

function GLLabel({ children, color = "var(--holy-ivory-muted)" }) {
  return <div style={{fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color, marginTop:10}}>{children}</div>;
}

function GLCard({ children, ground = "black", pad = 30 }) {
  const bg = ground === "parchment"
    ? "radial-gradient(ellipse 80% 80% at 50% 40%, #EBE3CC, #C7BC9C 85%)"
    : "radial-gradient(ellipse 100% 90% at 50% 0%, #141318, #0A0A0A 72%)";
  return <div style={{background:bg, border:"1px solid rgba(201,169,97,0.18)", padding:pad, display:"grid", placeItems:"center"}}>{children}</div>;
}

function Body({ children, max = 680 }) {
  return <p style={{fontFamily:"var(--font-body)", fontSize:14.5, lineHeight:1.65, color:"#B8B2A6", maxWidth:max, margin:"0 0 16px"}}>{children}</p>;
}

// ── COVER ──
function GLCover() {
  return (
    <section style={{minHeight:"92vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"60px 24px", position:"relative", borderBottom:"1px solid rgba(201,169,97,0.14)"}}>
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 38%, rgba(201,169,97,0.10), transparent 70%)", pointerEvents:"none"}}/>
      <div style={{width:"100%", maxWidth:440, position:"relative"}}><TaborEmblem id="cover"/></div>
      <div style={{marginTop:30, position:"relative"}}>
        <div className="holy-system" style={{color:"var(--holy-gold)", letterSpacing:"0.3em"}}>[ BRAND GUIDELINES · V1 ]</div>
        <h1 style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:30, margin:"12px 0 0", color:"var(--holy-ivory)", letterSpacing:"0.14em"}}>THE BOOK OF TABOR</h1>
        <GLLabel>Identity · Color · Type · Voice · System</GLLabel>
      </div>
    </section>
  );
}

// ── ESSENCE + PILLARS ──
function GLEssence() {
  const pillars = [
    ["Scripture Raid", "Bible reading + quizzes. The chapter is the dungeon; the Word is the weapon."],
    ["Fitness Guild", "Workouts + tracking. Iron body, iron will. Strength logged, not boasted."],
    ["Brotherhood", "Guilds + accountability. No man climbs the mountain alone."],
  ];
  return (
    <GLSection n="01" kicker="Foundation" title="The Name & The Fire">
      <Body><strong style={{color:"var(--holy-ivory)"}}>Tabor</strong> is the mountain of the Transfiguration, where ordinary men saw glory and were changed. That is the promise: ascent, transformation, light earned through discipline. The brand is sacred, severe, and brotherly. Gothic, not cute. Forged, not bought.</Body>
      <div style={{display:"flex", alignItems:"baseline", gap:16, margin:"24px 0 30px", flexWrap:"wrap"}}>
        <span style={{fontFamily:"'Pirata One', serif", fontSize:40, color:"var(--holy-gold)"}}>Sons of Fire</span>
        <GLLabel>Primary tagline · always title-case or all-caps, never altered</GLLabel>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14}}>
        {pillars.map(([t,d],i)=>(
          <div key={i} style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"22px 18px"}}>
            <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.2em"}}>{`PILLAR ${["I","II","III"][i]}`}</div>
            <h3 style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:18, color:"var(--holy-ivory)", margin:"10px 0 8px", letterSpacing:"0.04em"}}>{t}</h3>
            <p style={{fontFamily:"var(--font-body)", fontSize:12.5, lineHeight:1.55, color:"#9A948A", margin:0}}>{d}</p>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// ── LOGO SYSTEM ──
function GLLogo() {
  return (
    <GLSection n="02" kicker="Identity" title="The Mark">
      <Body>Four expressions of one mark. The <strong style={{color:"var(--holy-ivory)"}}>emblem</strong> is the hero for splash screens, covers, and ceremony. The <strong style={{color:"var(--holy-ivory)"}}>wordmark</strong> serves tight spaces. The <strong style={{color:"var(--holy-ivory)"}}>seal</strong> is the app icon and sigil. Never redraw, recolor, or re-typeset them — use the supplied files.</Body>
      <div style={{display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:14, marginTop:8}}>
        <GLCard><div style={{width:"100%", maxWidth:380}}><TaborEmblem id="gl-em"/></div></GLCard>
        <div style={{display:"grid", gridTemplateRows:"1fr 1fr", gap:14}}>
          <GLCard pad={22}><div style={{width:"100%", maxWidth:300}}>
            <svg viewBox="0 0 600 180" width="100%" style={{display:"block", overflow:"visible"}}><MarkDefs id="gl-wm"/><WordTabor id="gl-wm" word="Tabor" y={128} size={118}/></svg>
          </div></GLCard>
          <GLCard pad={22}><TaborIconSeal id="gl-seal" size={130}/></GLCard>
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0, marginTop:0}}>
        <div style={{padding:"12px 4px"}}><GLLabel color="var(--holy-gold)">Emblem · primary</GLLabel></div>
        <div style={{padding:"12px 4px"}}><GLLabel color="var(--holy-gold)">Wordmark · compact</GLLabel></div>
        <div style={{padding:"12px 4px"}}><GLLabel color="var(--holy-gold)">Seal · icon / sigil</GLLabel></div>
      </div>
    </GLSection>
  );
}

// ── CLEAR SPACE + MIN SIZE ──
function GLClearSpace() {
  return (
    <GLSection n="03" kicker="Construction" title="Clear Space & Minimum Size">
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div>
          <GLCard pad={24}>
            <div style={{position:"relative", width:260, height:260}}>
              <div style={{position:"absolute", inset:18, border:"1px dashed rgba(201,169,97,0.4)"}}/>
              <div style={{position:"absolute", inset:0}}><TaborIconSeal id="cs-seal" size={260}/></div>
              <div style={{position:"absolute", top:-2, left:"50%", transform:"translateX(-50%)", fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-gold)"}}>↕ X</div>
            </div>
          </GLCard>
          <Body max={420}>Keep clear space of at least <strong style={{color:"var(--holy-ivory)"}}>X</strong> on all sides, where X = the height of the medallion. Nothing (type, edges, other marks) enters this zone.</Body>
        </div>
        <div>
          <GLCard pad={24}>
            <div style={{display:"flex", alignItems:"flex-end", gap:26}}>
              <div style={{textAlign:"center"}}><TaborIconSeal id="mn1" size={120}/><GLLabel>App · 120px+</GLLabel></div>
              <div style={{textAlign:"center"}}><TaborIconSeal id="mn2" size={60}/><GLLabel>Min icon · 60px</GLLabel></div>
              <div style={{textAlign:"center"}}><TaborIconSeal id="mn3" size={32}/><GLLabel>Favicon · 32px</GLLabel></div>
            </div>
          </GLCard>
          <Body max={420}>The seal holds down to <strong style={{color:"var(--holy-ivory)"}}>32px</strong>. Below the minimum, drop the inscription and use the seal alone. The full emblem should never appear below 160px.</Body>
        </div>
      </div>
    </GLSection>
  );
}

// ── MISUSE ──
function GLMisuse() {
  const dont = [
    ["Don't stretch or squash", "scaleX(1.6)"],
    ["Don't recolor", "hue"],
    ["Don't rotate", "rot"],
    ["Don't add shadows/gl#fx", "fx"],
    ["Don't swap the font", "font"],
    ["Don't crowd the mark", "crowd"],
  ];
  const Mini = ({ kind }) => {
    const base = <svg viewBox="0 0 200 90" width="100%" style={{display:"block", overflow:"visible"}}><MarkDefs id={`ms-${kind}`}/>
      <g transform={kind==="rot" ? "rotate(-12 100 45)" : kind==="scaleX(1.6)" ? "translate(100 0) scale(1.7 1) translate(-100 0)" : ""}>
        <text x="100" y="60" textAnchor="middle" fontFamily={kind==="font" ? "Inter, sans-serif" : "'Pirata One', serif"} fontWeight={kind==="font"?800:400} fontSize="44"
          fill={kind==="hue" ? "#6fa8dc" : `url(#ms-${kind}-au)`} style={kind==="fx" ? {filter:"drop-shadow(0 0 8px #C9A961)"} : {}}>Tabor</text>
      </g></svg>;
    return base;
  };
  return (
    <GLSection n="04" kicker="Protection" title="Misuse">
      <Body>The mark earns its authority through consistency. These are non-negotiable.</Body>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12}}>
        {dont.map(([label, kind],i)=>(
          <div key={i} style={{border:"1px solid rgba(122,31,31,0.5)", background:"#0E0E12", position:"relative"}}>
            <div style={{padding:"20px 16px", display:"grid", placeItems:"center", borderBottom:"1px solid rgba(122,31,31,0.3)"}}>
              <Mini kind={kind}/>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:8, padding:"10px 14px"}}>
              <span style={{color:"var(--holy-crimson-glow)", fontSize:14, fontWeight:700}}>✕</span>
              <span style={{fontFamily:"var(--font-body)", fontSize:12, color:"#B8B2A6"}}>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

Object.assign(window, { GLSection, GLLabel, GLCard, Body, GLCover, GLEssence, GLLogo, GLClearSpace, GLMisuse });
