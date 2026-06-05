// tabor-graffiti-app.jsx — graffiti wordmark presentation
const { useState: useStateGA } = React;

function Piece({ n, title, sub, note, brick = false, children }) {
  return (
    <div style={{maxWidth:840, margin:"0 auto 30px", border:"1px solid rgba(201,169,97,0.22)", background:"#0A0A0A"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 18px", borderBottom:"1px solid rgba(201,169,97,0.18)"}}>
        <div style={{display:"flex", alignItems:"baseline", gap:12}}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--holy-gold)", letterSpacing:"0.2em"}}>{n}</span>
          <span className="holy-display" style={{fontSize:20, color:"var(--holy-ivory)", letterSpacing:"0.04em"}}>{title}</span>
        </div>
        <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.18em", textTransform:"uppercase"}}>{sub}</span>
      </div>
      <Wall brick={brick} pad="52px 40px">
        <div style={{position:"relative"}}>
          {children}
          <Speckle opacity={0.5}/>
        </div>
      </Wall>
      <div style={{padding:"12px 18px", fontFamily:"var(--font-body)", fontSize:12.5, lineHeight:1.5, color:"var(--holy-ivory-muted)"}}>{note}</div>
    </div>
  );
}

function GraffitiApp() {
  return (
    <div style={{minHeight:"100vh", background:"#0A0A0A", padding:"40px 20px 80px"}}>
      {/* header */}
      <div style={{maxWidth:840, margin:"0 auto 32px"}}>
        <div className="holy-system" style={{color:"var(--holy-gold)"}}>[ TABOR · STREET WORDMARK ]</div>
        <h1 className="holy-display" style={{fontSize:46, margin:"8px 0 0", color:"var(--holy-ivory)", letterSpacing:"-0.005em"}}>
          HAND-DRAWN GRAFFITI.
        </h1>
        <p style={{fontFamily:"var(--font-body)", fontSize:14, lineHeight:1.55, color:"var(--holy-ivory-muted)", maxWidth:620, marginTop:10}}>
          Custom letterforms — not a font with a filter. Black keylines, gold fills, running drips,
          glow halos, crown + cross, spray speckle. Three real styles, in the TABOR palette.
          Tell me which to develop into the locked wordmark.
        </p>
      </div>

      <Piece n="01" title="GOLD THROW-UP" sub="bubble · drips · crown+cross"
        note="The loud one. Bold bubble letterforms with heavy black keyline and Byzantine-gold fill, gold glow halo, six running drips, spray overspray. The crown reads as the three lights of Tabor with a cross at its center — kingdom + sacred built into street.">
        <ThrowUp/>
      </Piece>

      <Piece n="02" title="HANDSTYLE TAG" sub="marker · whip · arrow · crown"
        note="The fast one. A flowing single-weight marker tag with a flag-top T, connected letters, a long underline whip ending in an arrow, a gold crown, star and drips. Diegetic — looks tagged on the wall in seconds. Great as a secondary / community mark.">
        <Handstyle/>
      </Piece>

      <Piece n="03" title="BLACKLETTER CALLIGRAFFITI" sub="sacred handstyle · halo ring" brick
        note="The holy one — closest to your 'unity' reference. Drippy blackletter handstyle wrapped in a crimson-and-gold calligraphy halo ring (ΤΑΒΩΡ · SONS OF FIRE · ΘΕΩΣΙΣ). This is the Sacred-Tactical-Streetwear fusion at full strength: a Byzantine inscription tagged by a writer.">
        <Calligraffiti/>
      </Piece>

      <Piece n="04" title="THROW-UP · CRIMSON" sub="colorway · martyr crimson"
        note="Same throw-up, martyr-crimson colorway with an ivory glow — shows the letterform system holds across the palette (gold for rank/sacred moments, crimson for crisis / drops).">
        <ThrowUp fillId="tu-crim" glow="#C03A3A" glowOp={0.45} hi="#F3D9D9"/>
      </Piece>

      <div style={{maxWidth:840, margin:"0 auto", textAlign:"center", paddingTop:8}}>
        <span className="holy-roman" style={{fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.42em"}}>◇  WHICH ONE IS TABOR  ◇</span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<GraffitiApp/>);
