// tabor-app.jsx — TABOR direction development canvas
const { useState: useStateT } = React;

function Card({ label, sub, children, dark = true, pad = 28 }) {
  return (
    <div style={{
      width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background: dark ? "#0A0A0A" : "#E8E2D5",
      color: dark ? "var(--holy-ivory)" : "#2A1F10",
      position:"relative", overflow:"hidden",
    }}>
      <div className={dark ? "holy-grit" : ""} style={{flex:1, display:"grid", placeItems:"center", padding:pad, position:"relative"}}>
        {children}
      </div>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"10px 14px",
        borderTop: dark ? "1px solid rgba(232,226,213,0.08)" : "1px solid rgba(42,31,16,0.18)",
        fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase",
        color: dark ? "var(--holy-ivory-muted)" : "rgba(42,31,16,0.6)",
      }}>
        <span>{label}</span>
        <span style={{color:"var(--holy-gold)"}}>{sub}</span>
      </div>
    </div>
  );
}

function TaborApp() {
  return (
    <DesignCanvas>
      <DCPostIt top={40} left={60} width={280} rotate={-2}>
        <strong>TABOR · Direction Study</strong><br/>
        You flagged the mountain mark — here it is developed.
        <br/><br/>
        Mark refined into 4 sub-variants, then lockups, app icon (3 treatments),
        in-app context, and a rank-up reveal (tap it).
        <br/><br/>
        Tell me which mark variant + lockup to lock, and I'll cut final SVG assets.
      </DCPostIt>

      {/* ── MARK VARIANTS ── */}
      <DCSection id="marks" title="01 · Refined Mark" subtitle="One silhouette grammar — mountain of the Transfiguration, three lights — in four treatments">
        <DCArtboard id="m-primary" label="A · Primary (gold mountain)" width={340} height={420}>
          <Card label="A · Primary" sub="SACRED · HERO"><TaborPrimary size={210}/></Card>
        </DCArtboard>
        <DCArtboard id="m-disc" label="B · Disc (reversed)" width={340} height={420}>
          <Card label="B · Disc" sub="ICON · REVERSED"><TaborDisc size={210}/></Card>
        </DCArtboard>
        <DCArtboard id="m-line" label="C · Linework (system)" width={340} height={420}>
          <Card label="C · Linework" sub="TACTICAL · SYSTEM"><TaborLine size={210}/></Card>
        </DCArtboard>
        <DCArtboard id="m-sigil" label="D · Sigil (arch frame)" width={340} height={420}>
          <Card label="D · Sigil" sub="DIEGETIC · ON PARCHMENT" dark={false}><TaborSigil size={210}/></Card>
        </DCArtboard>
      </DCSection>

      {/* ── LOCKUPS ── */}
      <DCSection id="lockups" title="02 · Lockups" subtitle="Mark + wordmark + tagline relationships">
        <DCArtboard id="lk-v" label="Vertical (primary)" width={400} height={480}>
          <Card label="Vertical lockup" sub="PRIMARY"><LockupVertical/></Card>
        </DCArtboard>
        <DCArtboard id="lk-h" label="Horizontal (app bar)" width={460} height={300}>
          <Card label="Horizontal lockup" sub="APP BAR / HEADER"><LockupHorizontal/></Card>
        </DCArtboard>
        <DCArtboard id="lk-s" label="Streetwear (apparel)" width={400} height={400}>
          <Card label="Streetwear lockup" sub="APPAREL · SIBLING BRAND"><LockupStreet/></Card>
        </DCArtboard>
      </DCSection>

      {/* ── APP ICON ── */}
      <DCSection id="appicon" title="03 · App Icon" subtitle="Three treatments · tested at 60 / 44 / 28 px">
        <DCArtboard id="ai-night" label="A · Night (mountain + lights)" width={340} height={500}>
          <div style={{background:"#15151A", height:"100%", display:"flex", flexDirection:"column"}}>
            <div style={{aspectRatio:"1/1", overflow:"hidden"}}><TaborIcon treatment="night"/></div>
            <div style={{padding:"16px 18px"}}>
              <div className="holy-system" style={{color:"var(--holy-gold)", marginBottom:8}}>[ ICON.A · NIGHT ]</div>
              <div style={{fontSize:12, color:"var(--holy-ivory-muted)", lineHeight:1.45, fontFamily:"var(--font-body)"}}>
                Full mark on matte field. Most distinctive — three lights survive small.
              </div>
              <IconScaleStrip treatment="night"/>
            </div>
          </div>
        </DCArtboard>
        <DCArtboard id="ai-leaf" label="B · Gold disc (reversed)" width={340} height={500}>
          <div style={{background:"#15151A", height:"100%", display:"flex", flexDirection:"column"}}>
            <div style={{aspectRatio:"1/1", overflow:"hidden"}}><TaborIcon treatment="leaf"/></div>
            <div style={{padding:"16px 18px"}}>
              <div className="holy-system" style={{color:"var(--holy-gold)", marginBottom:8}}>[ ICON.B · GOLD DISC ]</div>
              <div style={{fontSize:12, color:"var(--holy-ivory-muted)", lineHeight:1.45, fontFamily:"var(--font-body)"}}>
                Solid leaf disc, knocked-out mountain. Boldest on a busy home screen.
              </div>
              <IconScaleStrip treatment="leaf"/>
            </div>
          </div>
        </DCArtboard>
        <DCArtboard id="ai-parch" label="C · Parchment (diegetic)" width={340} height={500}>
          <div style={{background:"#15151A", height:"100%", display:"flex", flexDirection:"column"}}>
            <div style={{aspectRatio:"1/1", overflow:"hidden"}}><TaborIcon treatment="parchment"/></div>
            <div style={{padding:"16px 18px"}}>
              <div className="holy-system" style={{color:"var(--holy-gold)", marginBottom:8}}>[ ICON.C · PARCHMENT ]</div>
              <div style={{fontSize:12, color:"var(--holy-ivory-muted)", lineHeight:1.45, fontFamily:"var(--font-body)"}}>
                Arch-framed sigil on parchment. Reads as illuminated manuscript — KCD2 energy.
              </div>
              <IconScaleStrip treatment="parchment"/>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      {/* ── IN CONTEXT ── */}
      <DCSection id="context" title="04 · In Context" subtitle="The mark living in the product">
        <DCArtboard id="ctx-splash" label="Splash / Awakening" width={390} height={844}>
          <TaborSplash/>
        </DCArtboard>
        <DCArtboard id="ctx-status" label="Status — branded header" width={390} height={844}>
          <TaborStatusHeader/>
        </DCArtboard>
        <DCArtboard id="ctx-reveal" label="Rank-up reveal — tap to replay" width={390} height={520}>
          <TaborReveal/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<TaborApp/>);
