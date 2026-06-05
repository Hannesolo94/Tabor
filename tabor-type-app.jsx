// tabor-type-app.jsx — Spray-paint wordmark study canvas

function TypeCard({ label, sub, children }) {
  return (
    <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column", background:"#0A0A0A", overflow:"hidden"}}>
      <div style={{flex:1, overflow:"hidden"}}>{children}</div>
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"10px 14px", borderTop:"1px solid rgba(232,226,213,0.1)",
        fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase",
        color:"var(--holy-ivory-muted)", background:"#0A0A0A",
      }}>
        <span>{label}</span>
        <span style={{color:"var(--holy-gold)"}}>{sub}</span>
      </div>
    </div>
  );
}

function TypeApp() {
  return (
    <DesignCanvas>
      <DCPostIt top={40} left={60} width={290} rotate={-2}>
        <strong>TABOR · Spray-Paint Wordmark Study</strong><br/>
        A bunch of street treatments for the wordmark — all on the locked mountain mark.
        <br/><br/>
        Grit is procedural (real spray-bleed, overspray mist, drips) — not a stock distress filter.
        <br/><br/>
        ★ = my pick: <strong>Hybrid Hand-Tag</strong> keeps the premium structure but gets hand-tagged.
        Tell me which to lock.
      </DCPostIt>

      <DCSection id="spray" title="A · Spray Paint" subtitle="Stencil spray, edge-bleed, wet drips">
        <DCArtboard id="t-stencil" label="A1 · Stencil Spray" width={420} height={360}>
          <TypeCard label="A1 · Stencil Spray" sub="RUBIK SPRAY PAINT"><W_StencilSpray/></TypeCard>
        </DCArtboard>
        <DCArtboard id="t-bleed" label="A2 · Spray Bleed + Drips" width={420} height={360}>
          <TypeCard label="A2 · Spray Bleed" sub="ARCHIVO + PROCEDURAL"><W_SprayBleed/></TypeCard>
        </DCArtboard>
        <DCArtboard id="t-wet" label="A3 · Wet Drip" width={420} height={360}>
          <TypeCard label="A3 · Wet Drip" sub="RUBIK WET PAINT"><W_WetDrip/></TypeCard>
        </DCArtboard>
      </DCSection>

      <DCSection id="stencil-tag" title="B · Stencil & Tag" subtitle="Military stencil, hand-marker tag">
        <DCArtboard id="t-mil" label="B1 · Military Stencil" width={420} height={360}>
          <TypeCard label="B1 · Mil-Stencil" sub="BLACK OPS ONE · TACTICAL"><W_MilStencil/></TypeCard>
        </DCArtboard>
        <DCArtboard id="t-marker" label="B2 · Marker Tag" width={420} height={360}>
          <TypeCard label="B2 · Marker Tag" sub="PERMANENT MARKER"><W_MarkerTag/></TypeCard>
        </DCArtboard>
        <DCArtboard id="t-urban" label="B3 · Urban Block" width={420} height={360}>
          <TypeCard label="B3 · Urban Block" sub="BUNGEE"><W_Urban/></TypeCard>
        </DCArtboard>
      </DCSection>

      <DCSection id="rough" title="C · Rough & Hybrid" subtitle="Raw poster, eroded screenprint, the premium hand-tag">
        <DCArtboard id="t-guer" label="C1 · Guerrilla" width={420} height={360}>
          <TypeCard label="C1 · Guerrilla" sub="PROTEST GUERRILLA"><W_Guerrilla/></TypeCard>
        </DCArtboard>
        <DCArtboard id="t-erode" label="C2 · Eroded Heavy" width={420} height={360}>
          <TypeCard label="C2 · Eroded Heavy" sub="ANTON · SCREENPRINT"><W_Eroded/></TypeCard>
        </DCArtboard>
        <DCArtboard id="t-hybrid" label="★ C3 · Hybrid Hand-Tag" width={420} height={420}>
          <TypeCard label="★ C3 · Hybrid Hand-Tag" sub="DISPLAY + SPRAYED TAG"><W_Hybrid/></TypeCard>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<TypeApp/>);
