// tabor-calligraffiti-app.jsx — refined calligraffiti presentation
function CFrame({ n, title, sub, note, ground = "concrete", children }) {
  const bg = ground === "parchment"
    ? "radial-gradient(ellipse 80% 70% at 50% 40%, #EBE3CC, #C9BE9F 75%, #A89C7C)"
    : `radial-gradient(ellipse 90% 60% at 50% 0%, rgba(40,36,32,0.9), transparent 60%),
       radial-gradient(ellipse 70% 50% at 15% 90%, rgba(28,25,22,0.7), transparent 65%),
       #0A0A0A`;
  return (
    <div style={{maxWidth:880, margin:"0 auto 28px", border:"1px solid rgba(201,169,97,0.22)", background:"#0A0A0A"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 18px", borderBottom:"1px solid rgba(201,169,97,0.18)"}}>
        <div style={{display:"flex", alignItems:"baseline", gap:12}}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--holy-gold)", letterSpacing:"0.2em"}}>{n}</span>
          <span className="holy-display" style={{fontSize:19, color:"var(--holy-ivory)", letterSpacing:"0.04em"}}>{title}</span>
        </div>
        <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.16em", textTransform:"uppercase"}}>{sub}</span>
      </div>
      <div style={{background:bg, padding:"30px 24px", display:"grid", placeItems:"center"}}>{children}</div>
      <div style={{padding:"12px 18px", fontFamily:"var(--font-body)", fontSize:12.5, lineHeight:1.5, color:"var(--holy-ivory-muted)"}}>{note}</div>
    </div>
  );
}

function CalligraffitiApp() {
  return (
    <div style={{minHeight:"100vh", background:"#0A0A0A", padding:"40px 20px 80px"}}>
      <div style={{maxWidth:880, margin:"0 auto 30px"}}>
        <div className="holy-system" style={{color:"var(--holy-gold)"}}>[ TABOR · SACRED CALLIGRAFFITI ]</div>
        <h1 className="holy-display" style={{fontSize:44, margin:"8px 0 0", color:"var(--holy-ivory)"}}>THE HOLY ONE — REFINED.</h1>
        <p style={{fontFamily:"var(--font-body)", fontSize:14, lineHeight:1.55, color:"var(--holy-ivory-muted)", maxWidth:640, marginTop:10}}>
          Rebuilt in a single canvas: paint runs that grow off the letters, a coin-seal halo ring
          carrying the inscription with the mountain mark as its top seal, and real weight on the
          blackletter. Same wordmark in three grounds so you can judge it as a system.
        </p>
      </div>

      <CFrame n="01" title="HERO · ON CONCRETE" sub="primary lockup"
        note="The primary. Ivory blackletter with painted depth, eight teardrop runs of varying length, gold-and-crimson coin-seal ring (✦ ΤΑΒΩΡ · SONS OF FIRE · ΘΕΩΣΙΣ · MOUNT OF LIGHT ✦), mountain seal at twelve o'clock. A Byzantine inscription tagged by a writer.">
        <div style={{width:"100%", maxWidth:620}}><CalligraffitiMark/></div>
      </CFrame>

      <div style={{maxWidth:880, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, border:"1px solid rgba(201,169,97,0.22)", borderBottom:"none"}}>
        <div style={{borderRight:"1px solid rgba(201,169,97,0.18)"}}>
          <CFrameInline title="02 · PARCHMENT" sub="illuminated / KCD2"
            note="Inverted onto parchment — the manuscript treatment. Dark ink, crimson rubrication ring.">
            <CalligraffitiMark
              ink="#241B10" inkShadow="rgba(120,90,40,0.30)"
              ringText="#7A1F1F" ringHair="#8B5A2B"
              glow="rgba(150,110,40,0.18)" showGlow={false}/>
          </CFrameInline>
        </div>
        <div>
          <CFrameInline title="03 · CRIMSON" sub="martyr colorway"
            note="Martyr-crimson ink with a gold ring — for crisis states, drops, and high-ceremony moments.">
            <CalligraffitiMark
              ink="#C8463F" inkShadow="rgba(0,0,0,0.6)"
              ringText="#C9A961" ringHair="#C9A961"
              glow="rgba(192,58,58,0.22)"/>
          </CFrameInline>
        </div>
      </div>

      <div style={{maxWidth:880, margin:"0 auto 30px", border:"1px solid rgba(201,169,97,0.22)", borderTop:"none", padding:"14px 18px", display:"flex", justifyContent:"space-between", background:"#0A0A0A"}}>
        <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.18em"}}>TABOR · CALLIGRAFFITI SYSTEM</span>
        <span className="holy-roman" style={{fontSize:9, color:"var(--holy-gold)", letterSpacing:"0.4em"}}>◇ SONS OF FIRE ◇</span>
      </div>

      <div style={{maxWidth:880, margin:"0 auto", textAlign:"center"}}>
        <span className="holy-roman" style={{fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.4em"}}>◇  CLOSER?  TELL ME WHAT TO TUNE  ◇</span>
      </div>
    </div>
  );
}

function CFrameInline({ title, sub, note, children }) {
  return (
    <div style={{background:"#0A0A0A"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderBottom:"1px solid rgba(201,169,97,0.14)"}}>
        <span className="holy-display" style={{fontSize:15, color:"var(--holy-ivory)", letterSpacing:"0.04em"}}>{title}</span>
        <span style={{fontFamily:"var(--font-mono)", fontSize:8, color:"var(--holy-ivory-muted)", letterSpacing:"0.16em", textTransform:"uppercase"}}>{sub}</span>
      </div>
      <div style={{padding:"22px 16px", display:"grid", placeItems:"center",
        background:title.includes("PARCHMENT")
          ? "radial-gradient(ellipse 80% 70% at 50% 40%, #EBE3CC, #C5BA9B 80%)"
          : "#0A0A0A"}}>
        {children}
      </div>
      <div style={{padding:"10px 16px", fontFamily:"var(--font-body)", fontSize:11.5, lineHeight:1.45, color:"var(--holy-ivory-muted)"}}>{note}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<CalligraffitiApp/>);
