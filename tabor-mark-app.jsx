// tabor-mark-app.jsx — refined sacred mark presentation
function Bay({ n, title, sub, note, children, ground = "black" }) {
  const bg = ground === "parchment"
    ? "radial-gradient(ellipse 80% 70% at 50% 42%, #EBE3CC, #C7BC9C 82%)"
    : "radial-gradient(ellipse 90% 70% at 50% 0%, #141318, #0A0A0A 70%)";
  return (
    <div style={{maxWidth:900, margin:"0 auto 26px", border:"1px solid rgba(201,169,97,0.2)", background:"#0A0A0A"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 18px", borderBottom:"1px solid rgba(201,169,97,0.16)"}}>
        <div style={{display:"flex", alignItems:"baseline", gap:12}}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--holy-gold)", letterSpacing:"0.2em"}}>{n}</span>
          <span style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:18, color:"var(--holy-ivory)", letterSpacing:"0.12em", textTransform:"uppercase"}}>{title}</span>
        </div>
        <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.16em", textTransform:"uppercase"}}>{sub}</span>
      </div>
      <div style={{background:bg, padding:"40px 30px", display:"grid", placeItems:"center"}}>{children}</div>
      <div style={{padding:"12px 18px", fontFamily:"var(--font-body)", fontSize:12.5, lineHeight:1.5, color:"var(--holy-ivory-muted)"}}>{note}</div>
    </div>
  );
}

function MarkApp() {
  return (
    <div style={{minHeight:"100vh", background:"#0A0A0A", padding:"40px 20px 80px"}}>
      <div style={{maxWidth:900, margin:"0 auto 30px"}}>
        <div className="holy-system" style={{color:"var(--holy-gold)"}}>[ TABOR · THE MARK ]</div>
        <h1 style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:40, margin:"8px 0 0", color:"var(--holy-ivory)", letterSpacing:"0.06em"}}>
          REFINED · SACRED · RESTRAINED
        </h1>
        <p style={{fontFamily:"var(--font-body)", fontSize:14, lineHeight:1.6, color:"var(--holy-ivory-muted)", maxWidth:660, marginTop:10}}>
          Reset to the direction that worked: blackletter <em>Tabor</em> and a clean coin-seal emblem —
          the mountain of the Transfiguration, a thin inscription ring, gold with a quiet metallic
          sheen on matte black. The metal is a whisper (a single steel hairline), not armour. No rivets,
          no chrome, no cosplay.
        </p>
      </div>

      <Bay n="01" title="The Emblem" sub="primary mark"
        note="The full mark: blackletter Tabor inside a restrained coin-seal — two gold hairlines and one faint steel line, an upright inscription (Sons of Fire · Theosis · Mount of Light), the mountain medallion at twelve o'clock, simple diamonds at the sides. Premium and severe without shouting.">
        <div style={{width:"100%", maxWidth:560}}><TaborEmblem id="em1"/></div>
      </Bay>

      <Bay n="02" title="The Wordmark" sub="compact lockup"
        note="The wordmark alone for tight spaces — app headers, in-product titles, apparel. Metallic-gold blackletter with a crisp keyline, motto rule beneath.">
        <div style={{width:"100%", maxWidth:480}}><TaborWordmark id="wm1"/></div>
      </Bay>

      <Bay n="02·" title="Case Study" sub="mixed vs all-caps">
        <div style={{display:"flex", flexDirection:"column", gap:26, width:"100%", maxWidth:560, alignItems:"center"}}>
          <div style={{textAlign:"center", width:"100%"}}>
            <svg viewBox="0 0 600 190" width="100%" style={{display:"block", overflow:"visible", maxHeight:150}}>
              <MarkDefs id="cs1"/>
              <WordTabor id="cs1" word="Tabor" y={130} size={120}/>
            </svg>
            <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-gold)", letterSpacing:"0.2em", marginTop:8}}>MIXED CASE · CURRENT</div>
          </div>
          <div style={{height:1, width:"60%", background:"rgba(201,169,97,0.25)"}}/>
          <div style={{textAlign:"center", width:"100%"}}>
            <svg viewBox="0 0 600 190" width="100%" style={{display:"block", overflow:"visible", maxHeight:150}}>
              <MarkDefs id="cs2"/>
              <WordTabor id="cs2" word="TABOR" y={132} size={96} stretchX={1}/>
            </svg>
            <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.2em", marginTop:8}}>ALL CAPS</div>
          </div>
        </div>
      </Bay>

      <div style={{maxWidth:900, margin:"0 auto 26px", display:"grid", gridTemplateColumns:"1fr 1fr"}}>
        <div style={{border:"1px solid rgba(201,169,97,0.2)", borderRight:"none", background:"#0A0A0A"}}>
          <div style={{padding:"12px 18px", borderBottom:"1px solid rgba(201,169,97,0.16)", display:"flex", justifyContent:"space-between"}}>
            <span style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:15, color:"var(--holy-ivory)", letterSpacing:"0.12em"}}>03 · THE SEAL</span>
            <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.16em"}}>APP ICON</span>
          </div>
          <div style={{background:"radial-gradient(ellipse 90% 70% at 50% 0%, #141318, #0A0A0A 70%)", padding:"32px", display:"flex", gap:24, alignItems:"center", justifyContent:"center"}}>
            <TaborIconSeal id="ic1" size={150}/>
            <div style={{display:"flex", flexDirection:"column", gap:12, alignItems:"center"}}>
              <TaborIconSeal id="ic2" size={64}/>
              <TaborIconSeal id="ic3" size={40}/>
              <span style={{fontFamily:"var(--font-mono)", fontSize:8, color:"var(--holy-ivory-muted)", letterSpacing:"0.16em"}}>150 · 64 · 40</span>
            </div>
          </div>
          <div style={{padding:"12px 18px", fontFamily:"var(--font-body)", fontSize:11.5, lineHeight:1.45, color:"var(--holy-ivory-muted)"}}>
            Mountain seal alone — the app icon and the order's sigil. Reads clean down to 40px.
          </div>
        </div>
        <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0A0A0A"}}>
          <div style={{padding:"12px 18px", borderBottom:"1px solid rgba(201,169,97,0.16)", display:"flex", justifyContent:"space-between"}}>
            <span style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:15, color:"var(--holy-ivory)", letterSpacing:"0.12em"}}>04 · PARCHMENT</span>
            <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.16em"}}>INVERSION</span>
          </div>
          <div style={{background:"radial-gradient(ellipse 80% 70% at 50% 42%, #EBE3CC, #C7BC9C 82%)", padding:"24px", display:"grid", placeItems:"center"}}>
            <div style={{width:"100%", maxWidth:300}}>
              <svg viewBox="0 0 600 230" width="100%" style={{display:"block", overflow:"visible"}}>
                <defs>
                  <linearGradient id="pk-ink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3A2A12"/><stop offset="100%" stopColor="#1E1509"/>
                  </linearGradient>
                </defs>
                <text x="300" y="160" textAnchor="middle" fontFamily="'Pirata One', serif" fontSize="140" fill="url(#pk-ink)">Tabor</text>
              </svg>
            </div>
          </div>
          <div style={{padding:"12px 18px", fontFamily:"var(--font-body)", fontSize:11.5, lineHeight:1.45, color:"var(--holy-ivory-muted)"}}>
            Dark-ink inversion for light grounds — packaging, print, parchment UI.
          </div>
        </div>
      </div>

      <div style={{maxWidth:900, margin:"0 auto", textAlign:"center", paddingTop:6}}>
        <span style={{fontFamily:"'Cinzel', serif", fontWeight:600, fontSize:11, letterSpacing:"0.42em", color:"var(--holy-gold)", textTransform:"uppercase"}}>◇ Closer to right? ◇</span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MarkApp/>);
