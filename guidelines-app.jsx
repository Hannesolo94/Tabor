// guidelines-app.jsx — assembles The Book of Tabor
const NAV = [
  ["01", "Foundation", "sec-01"], ["02", "The Mark", "sec-02"], ["03", "Construction", "sec-03"],
  ["04", "Misuse", "sec-04"], ["05", "Color", "sec-05"], ["06", "Type", "sec-06"],
  ["07", "Voice", "sec-07"], ["08", "Motifs", "sec-08"], ["09", "UI", "sec-09"],
];

function TopNav() {
  const go = (id) => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: "smooth" }); };
  return (
    <div style={{position:"sticky", top:0, zIndex:50, background:"rgba(10,10,10,0.86)", backdropFilter:"blur(10px)", borderBottom:"1px solid rgba(201,169,97,0.2)"}}>
      <div style={{maxWidth:1000, margin:"0 auto", padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16}}>
        <span style={{fontFamily:"'Pirata One', serif", fontSize:22, color:"var(--holy-gold)"}}>Tabor</span>
        <div style={{display:"flex", gap:14, flexWrap:"wrap"}}>
          {NAV.map(([n, label, id])=>(
            <button key={id} onClick={()=>go(id)} style={{background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.12em", color:"#9A948A", textTransform:"uppercase", padding:"4px 2px"}}
              onMouseOver={e=>e.currentTarget.style.color="var(--holy-gold)"} onMouseOut={e=>e.currentTarget.style.color="#9A948A"}>{label}</button>
          ))}
        </div>
        <a href="TABOR Brand Kit.html" style={{fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.14em", color:"var(--holy-gold)", border:"1px solid rgba(201,169,97,0.5)", padding:"7px 12px", textDecoration:"none", textTransform:"uppercase", whiteSpace:"nowrap"}}>Assets ↗</a>
      </div>
    </div>
  );
}

function Wrap({ id, children }) { return <div id={id}>{children}</div>; }

function GuidelinesApp() {
  return (
    <div style={{background:"#0A0A0A"}}>
      <TopNav/>
      <GLCover/>
      <Wrap id="sec-01"><GLEssence/></Wrap>
      <Wrap id="sec-02"><GLLogo/></Wrap>
      <Wrap id="sec-03"><GLClearSpace/></Wrap>
      <Wrap id="sec-04"><GLMisuse/></Wrap>
      <Wrap id="sec-05"><GLColor/></Wrap>
      <Wrap id="sec-06"><GLType/></Wrap>
      <Wrap id="sec-07"><GLVoice/></Wrap>
      <Wrap id="sec-08"><GLMotifs/></Wrap>
      <Wrap id="sec-09"><GLComponents/></Wrap>
      <footer style={{maxWidth:1000, margin:"0 auto", padding:"50px 28px 70px", borderTop:"1px solid rgba(201,169,97,0.14)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16}}>
        <div>
          <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:16, color:"var(--holy-ivory)", letterSpacing:"0.1em"}}>THE BOOK OF TABOR</div>
          <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"#7A746A", letterSpacing:"0.16em", marginTop:4}}>BRAND GUIDELINES · V1 · {new Date().getFullYear()}</div>
        </div>
        <span style={{fontFamily:"'Pirata One', serif", fontSize:26, color:"var(--holy-gold)"}}>Sons of Fire</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<GuidelinesApp/>);
