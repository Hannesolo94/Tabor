// brandkit-app.jsx — TABOR Brand Kit page
function Asset({ title, sub, svgId, baseName, render, svg = true, pngSizes = [1024, 512], ground = "black" }) {
  const bg = ground === "parchment"
    ? "radial-gradient(ellipse 80% 70% at 50% 42%, #EBE3CC, #C7BC9C 82%)"
    : "radial-gradient(ellipse 90% 70% at 50% 0%, #141318, #0A0A0A 70%)";
  return (
    <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0A0A0A", display:"flex", flexDirection:"column"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderBottom:"1px solid rgba(201,169,97,0.16)"}}>
        <span style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:14, color:"var(--holy-ivory)", letterSpacing:"0.1em"}}>{title}</span>
        <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.14em", textTransform:"uppercase"}}>{sub}</span>
      </div>
      <div style={{background:bg, padding:"30px", display:"grid", placeItems:"center", flex:1}}>{render}</div>
      <div style={{display:"flex", gap:8, flexWrap:"wrap", padding:"12px 16px", borderTop:"1px solid rgba(201,169,97,0.12)"}}>
        {svg && <Btn primary onClick={()=>downloadSVG(svgId, `${baseName}.svg`)}>SVG</Btn>}
        {pngSizes.map(s => <Btn key={s} onClick={()=>downloadPNG(svgId, s, `${baseName}-${s}.png`)}>PNG {s}</Btn>)}
      </div>
    </div>
  );
}

function BrandKitApp() {
  return (
    <div style={{minHeight:"100vh", background:"#0A0A0A", padding:"40px 20px 80px"}}>
      <div style={{maxWidth:980, margin:"0 auto 30px"}}>
        <div className="holy-system" style={{color:"var(--holy-gold)"}}>[ TABOR · BRAND KIT ]</div>
        <h1 style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:40, margin:"8px 0 0", color:"var(--holy-ivory)", letterSpacing:"0.05em"}}>
          ASSETS · LOCKED
        </h1>
        <p style={{fontFamily:"var(--font-body)", fontSize:14, lineHeight:1.6, color:"var(--holy-ivory-muted)", maxWidth:680, marginTop:10}}>
          Everything in one place. Click to download logos (SVG = master, scalable, editable),
          icons (PNG at any size), and the fonts. SVG files embed a font import so the blackletter
          renders when opened in a browser; for print/editing, install the fonts below first.
        </p>
      </div>

      {/* LOGOS */}
      <div style={{maxWidth:980, margin:"0 auto 18px"}}>
        <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.24em", marginBottom:10}}>01 · LOGOS</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
          <Asset title="Primary Emblem" sub="full mark" baseName="tabor-emblem" svgId="ax-emblem"
            pngSizes={[2048, 1024]} render={<div style={{width:"100%", maxWidth:420}}><TaborEmblem id="ax-emblem"/></div>}/>
          <Asset title="Wordmark" sub="mixed case" baseName="tabor-wordmark" svgId="ax-wm"
            pngSizes={[2048, 1024]} render={<div style={{width:"100%", maxWidth:420}}>
              <svg id="ax-wm" viewBox="0 0 600 220" width="100%" style={{display:"block", overflow:"visible"}}>
                <MarkDefs id="ax-wm"/><WordTabor id="ax-wm" word="Tabor" y={150} size={128}/>
              </svg></div>}/>
          <Asset title="Wordmark · Caps" sub="display alternate" baseName="tabor-wordmark-caps" svgId="ax-wc"
            pngSizes={[2048, 1024]} render={<div style={{width:"100%", maxWidth:420}}>
              <svg id="ax-wc" viewBox="0 0 600 200" width="100%" style={{display:"block", overflow:"visible"}}>
                <MarkDefs id="ax-wc"/><WordTabor id="ax-wc" word="TABOR" y={150} size={104}/>
              </svg></div>}/>
          <Asset title="Wordmark · Dark" sub="for light grounds" baseName="tabor-wordmark-dark" svgId="ax-wd"
            ground="parchment" pngSizes={[2048, 1024]} render={<div style={{width:"100%", maxWidth:420}}>
              <svg id="ax-wd" viewBox="0 0 600 220" width="100%" style={{display:"block", overflow:"visible"}}>
                <defs><linearGradient id="ax-wd-au" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3A2A12"/><stop offset="100%" stopColor="#1E1509"/></linearGradient></defs>
                <WordTabor id="ax-wd" word="Tabor" y={150} size={128} ink="#1E1509" shadow="rgba(120,90,40,0.25)"/>
              </svg></div>}/>
        </div>
      </div>

      {/* ICONS */}
      <div style={{maxWidth:980, margin:"0 auto 18px"}}>
        <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.24em", marginBottom:10}}>02 · APP ICON · SEAL</div>
        <Asset title="Mountain Seal" sub="app icon · vector → any size" baseName="tabor-icon" svgId="ax-seal"
          pngSizes={[1024, 512, 180, 120, 60]} render={<TaborIconSeal id="ax-seal" size={200}/>}/>
      </div>

      {/* FONTS */}
      <div style={{maxWidth:980, margin:"0 auto"}}>
        <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.24em", marginBottom:10}}>03 · FONTS</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
          <FontCard name="Pirata One" role="Wordmark · blackletter" sample="Tabor" family="'Pirata One', serif" href="https://fonts.google.com/specimen/Pirata+One"/>
          <FontCard name="Cinzel" role="General · headings · UI" sample="SONS OF FIRE" family="'Cinzel', serif" weight={700} href="https://fonts.google.com/specimen/Cinzel"/>
        </div>
        <p style={{fontFamily:"var(--font-body)", fontSize:12, lineHeight:1.55, color:"var(--holy-ivory-muted)", marginTop:14}}>
          Both fonts are open-source under the SIL Open Font License (free for commercial use). Click a card to open Google Fonts,
          then “Get font → Download all”. Body / system text uses Inter and JetBrains Mono (also free, Google Fonts).
        </p>
      </div>

      <div style={{maxWidth:980, margin:"28px auto 0", textAlign:"center"}}>
        <span style={{fontFamily:"'Cinzel', serif", fontWeight:600, fontSize:11, letterSpacing:"0.42em", color:"var(--holy-gold)", textTransform:"uppercase"}}>◇ Sons of Fire ◇</span>
      </div>
    </div>
  );
}

function FontCard({ name, role, sample, family, weight = 400, href }) {
  return (
    <a href={href} target="_blank" rel="noopener" style={{textDecoration:"none", border:"1px solid rgba(201,169,97,0.2)", background:"#0A0A0A", display:"block"}}>
      <div style={{padding:"22px 18px", background:"radial-gradient(ellipse 90% 80% at 50% 0%, #141318, #0A0A0A 70%)"}}>
        <div style={{fontFamily:family, fontWeight:weight, fontSize:48, color:"var(--holy-gold)", lineHeight:1}}>{sample}</div>
      </div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderTop:"1px solid rgba(201,169,97,0.16)"}}>
        <div>
          <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:14, color:"var(--holy-ivory)", letterSpacing:"0.08em"}}>{name}</div>
          <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.14em", textTransform:"uppercase", marginTop:2}}>{role}</div>
        </div>
        <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.14em"}}>DOWNLOAD ↗</span>
      </div>
    </a>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BrandKitApp/>);
