// tabor-metal-app.jsx — TABOR grimdark/metal direction presentation
function Bay({ n, title, sub, note, children, plate = true }) {
  return (
    <div style={{maxWidth:900, margin:"0 auto 28px", border:"1px solid rgba(201,169,97,0.22)", background:"#0A0A0A"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 18px", borderBottom:"1px solid rgba(201,169,97,0.18)"}}>
        <div style={{display:"flex", alignItems:"baseline", gap:12}}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--holy-gold)", letterSpacing:"0.2em"}}>{n}</span>
          <span style={{fontFamily:"'Grenze Gotisch', serif", fontWeight:700, fontSize:24, color:"var(--holy-ivory)", letterSpacing:"0.02em"}}>{title}</span>
        </div>
        <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.16em", textTransform:"uppercase"}}>{sub}</span>
      </div>
      {plate
        ? <MetalPlate>{children}</MetalPlate>
        : <div style={{padding:"40px 30px", display:"grid", placeItems:"center", background:"#0A0A0A"}}>{children}</div>}
      <div style={{padding:"12px 18px", fontFamily:"var(--font-body)", fontSize:12.5, lineHeight:1.5, color:"var(--holy-ivory-muted)"}}>{note}</div>
    </div>
  );
}

function Tagline({ children, color = "var(--holy-gold)" }) {
  return <div style={{fontFamily:"'Cinzel', serif", fontWeight:600, letterSpacing:"0.42em", fontSize:13, color, textTransform:"uppercase"}}>{children}</div>;
}

function MetalApp() {
  return (
    <div style={{minHeight:"100vh", background:"#0A0A0A", padding:"40px 20px 80px"}}>
      <div style={{maxWidth:900, margin:"0 auto 32px"}}>
        <div className="holy-system" style={{color:"var(--holy-gold)"}}>[ TABOR · MASTER BRAND ]</div>
        <h1 style={{fontFamily:"'Grenze Gotisch', serif", fontWeight:800, fontSize:54, margin:"6px 0 0", color:"var(--holy-ivory)", letterSpacing:"0.01em"}}>
          GRIMDARK · METAL · GOTHIC.
        </h1>
        <p style={{fontFamily:"var(--font-body)", fontSize:14, lineHeight:1.6, color:"var(--holy-ivory-muted)", maxWidth:660, marginTop:10}}>
          Direction reset: TABOR is the master brand. Blackletter carried into a 40K-gothic /
          heavy-metal world — gunmetal and Byzantine gold, iron seals, rivets, wax purity-seals.
          Streetwear stays in the family as one expression (the metal logotype reads loud on apparel),
          but the core is sacred, armoured, and severe. Palette unchanged: black · steel-silver · gold · crimson.
        </p>
      </div>

      <Bay n="01" title="WORDMARK" sub="chrome blackletter · primary"
        note="The primary logotype: gothic blackletter in brushed chrome with a Byzantine-gold edge, struck on an iron armour plate with a gold keyline and corner rivets. Heavy, legible, metal.">
        <div style={{width:"100%", maxWidth:680, textAlign:"center"}}>
          <MetalWordmark text="TABOR" id="w1"/>
          <div style={{marginTop:6}}><Tagline>Sons of Fire</Tagline></div>
        </div>
      </Bay>

      <Bay n="02" title="THE SEAL" sub="iron medallion · app icon"
        note="The mark as a forged iron seal — steel ring, twelve rivets, gold trim, the mountain of the Transfiguration with gold-lit faces and a gothic cross. Works as the app icon and the order's sigil.">
        <div style={{display:"flex", gap:40, alignItems:"center", justifyContent:"center", flexWrap:"wrap"}}>
          <IronSeal id="s1" size={220}/>
          <div style={{display:"flex", flexDirection:"column", gap:16, alignItems:"center"}}>
            <IronSeal id="s2" size={96}/>
            <IronSeal id="s3" size={56}/>
            <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.18em"}}>220 · 96 · 56</span>
          </div>
        </div>
      </Bay>

      <Bay n="03" title="FULL LOCKUP" sub="seal + wordmark"
        note="The complete brand mark — iron seal crowning the chrome wordmark, motto beneath. This is the version for splash screens, apparel back-prints, and the title plate.">
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:14, maxWidth:560, width:"100%"}}>
          <IronSeal id="lk" size={150}/>
          <div style={{width:"100%", maxWidth:440}}><MetalWordmark text="TABOR" id="w2"/></div>
          <div style={{display:"flex", alignItems:"center", gap:12, width:"80%"}}>
            <div style={{flex:1, height:1, background:"linear-gradient(90deg, transparent, var(--holy-gold))"}}/>
            <Tagline>Sons of Fire</Tagline>
            <div style={{flex:1, height:1, background:"linear-gradient(90deg, var(--holy-gold), transparent)"}}/>
          </div>
        </div>
      </Bay>

      <Bay n="04" title="ACCENTS" sub="purity seal · alt cuts" plate={false}
        note="Supporting kit: a wax purity-seal with parchment ribbon (diegetic UI / achievements), plus the sacred alt cut in ornate blackletter for ceremonial moments and an all-caps brutalist cut for apparel.">
        <div style={{display:"flex", gap:40, alignItems:"center", justifyContent:"center", flexWrap:"wrap", width:"100%"}}>
          <PuritySeal id="ps1"/>
          <div style={{display:"flex", flexDirection:"column", gap:26, alignItems:"center"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'UnifrakturMaguntia', serif", fontSize:64, color:"#F3EEE2", lineHeight:0.9, textShadow:"0 0 18px rgba(201,169,97,0.25)"}}>Tabor</div>
              <span style={{fontFamily:"var(--font-mono)", fontSize:8, color:"var(--holy-ivory-muted)", letterSpacing:"0.2em"}}>SACRED · CEREMONIAL CUT</span>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Grenze Gotisch', serif", fontWeight:900, fontSize:50, color:"#C0C0C0", lineHeight:0.9, letterSpacing:"0.04em"}}>TABOR</div>
              <span style={{fontFamily:"var(--font-mono)", fontSize:8, color:"var(--holy-ivory-muted)", letterSpacing:"0.2em"}}>BRUTALIST · APPAREL CUT</span>
            </div>
          </div>
        </div>
      </Bay>

      <div style={{maxWidth:900, margin:"0 auto", textAlign:"center", paddingTop:8}}>
        <Tagline>◇ Is this the world ◇</Tagline>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MetalApp/>);
