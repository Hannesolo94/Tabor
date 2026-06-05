// plan-app.jsx — assembles the TABOR Campaign Map (app blueprint)
const PNAV = [
  ["01","Core Loop","p-01"],["02","Architecture","p-02"],["03","Navigation","p-03"],
  ["04","Onboarding","p-04"],["05","Daily","p-05"],["06","Pillars","p-06"],
  ["07","Progression","p-07"],["08","System","p-08"],["09","Flows","p-09"],
  ["10","Scope","p-10"],["11","Screens","p-11"],
];

function PTopNav() {
  const go = (id) => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 60, behavior:"smooth" }); };
  return (
    <div style={{position:"sticky", top:0, zIndex:50, background:"rgba(10,10,10,0.88)", backdropFilter:"blur(10px)", borderBottom:"1px solid rgba(201,169,97,0.2)"}}>
      <div style={{maxWidth:1040, margin:"0 auto", padding:"11px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12}}>
        <span style={{fontFamily:"'Pirata One', serif", fontSize:20, color:"var(--holy-gold)", whiteSpace:"nowrap"}}>Tabor</span>
        <div style={{display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center"}}>
          {PNAV.map(([n,label,id])=>(
            <button key={id} onClick={()=>go(id)} style={{background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font-mono)", fontSize:9.5, letterSpacing:"0.1em", color:"#9A948A", textTransform:"uppercase", padding:"3px 1px"}}
              onMouseOver={e=>e.currentTarget.style.color="var(--holy-gold)"} onMouseOut={e=>e.currentTarget.style.color="#9A948A"}>{label}</button>
          ))}
        </div>
        <a href="TABOR Brand Guidelines.html" style={{fontFamily:"var(--font-mono)", fontSize:9.5, letterSpacing:"0.12em", color:"var(--holy-gold)", border:"1px solid rgba(201,169,97,0.5)", padding:"6px 10px", textDecoration:"none", textTransform:"uppercase", whiteSpace:"nowrap"}}>Brand ↗</a>
      </div>
    </div>
  );
}

function W({ id, children }) { return <div id={id}>{children}</div>; }

function PlanApp() {
  return (
    <div style={{background:"#0A0A0A"}}>
      <PTopNav/>
      <PCover/>
      <W id="p-01"><POverview/></W>
      <W id="p-02"><PIA/></W>
      <W id="p-03"><PNavModel/></W>
      <W id="p-04"><POnboarding/></W>
      <W id="p-05"><PDaily/></W>
      <W id="p-06"><PPillars/></W>
      <W id="p-07"><PProgression/></W>
      <W id="p-08"><PSystem/></W>
      <W id="p-09"><PFlows/></W>
      <W id="p-10"><PScope/></W>
      <W id="p-11"><PInventory/></W>
      <footer style={{maxWidth:1040, margin:"0 auto", padding:"50px 28px 70px", borderTop:"1px solid rgba(201,169,97,0.14)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16}}>
        <div>
          <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:15, color:"var(--holy-ivory)", letterSpacing:"0.1em"}}>THE CAMPAIGN MAP</div>
          <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"#7A746A", letterSpacing:"0.16em", marginTop:4}}>TABOR · PRODUCT BLUEPRINT · V1</div>
        </div>
        <span style={{fontFamily:"'Pirata One', serif", fontSize:24, color:"var(--holy-gold)"}}>Sons of Fire</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PlanApp/>);
