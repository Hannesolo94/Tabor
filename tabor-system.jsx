// tabor-system.jsx — Lockups, app icon, in-app context, ceremonial reveal
const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// LOCKUPS
// ─────────────────────────────────────────────────────────────

function LockupVertical() {
  return (
    <div style={{textAlign:"center", color:"var(--holy-ivory)"}}>
      <TaborPrimary size={150}/>
      <h1 className="holy-display" style={{margin:"4px 0 0", fontSize:64, letterSpacing:"0.04em"}}>
        TABOR
      </h1>
      <div className="holy-roman" style={{fontSize:9, color:"var(--holy-gold)", marginTop:8, letterSpacing:"0.46em"}}>
        SONS  OF  FIRE
      </div>
    </div>
  );
}

function LockupHorizontal() {
  return (
    <div style={{display:"flex", alignItems:"center", gap:22, color:"var(--holy-ivory)"}}>
      <TaborDisc size={104}/>
      <div style={{textAlign:"left"}}>
        <h1 className="holy-display" style={{margin:0, fontSize:54, letterSpacing:"0.02em", lineHeight:0.9}}>
          TABOR
        </h1>
        <div style={{height:1, background:"var(--holy-gold)", margin:"6px 0", opacity:0.7}}/>
        <div style={{
          fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.28em",
          color:"var(--holy-ivory-muted)", textTransform:"uppercase",
        }}>BROTHERHOOD · EST. MMXXVI</div>
      </div>
    </div>
  );
}

function LockupStreet() {
  return (
    <div style={{width:"100%", maxWidth:300, color:"var(--holy-ivory)"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:8}}>
        <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.2em"}}>EL. 588m</span>
        <TaborLine size={42}/>
      </div>
      <h1 className="holy-display" style={{fontSize:78, margin:0, lineHeight:0.82, letterSpacing:"-0.01em"}}>
        TA<span style={{color:"var(--holy-gold)"}}>/</span>BOR
      </h1>
      <div style={{display:"flex", alignItems:"center", gap:8, marginTop:8}}>
        <div style={{flex:1, height:1, background:"var(--holy-gold)"}}/>
        <span style={{fontFamily:"var(--font-mono)", fontSize:8, color:"var(--holy-gold)", letterSpacing:"0.2em"}}>32°41′N</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// APP ICON — three treatments, scale-tested
// ─────────────────────────────────────────────────────────────

function TaborIcon({ treatment }) {
  if (treatment === "leaf") {
    return (
      <div style={{width:"100%", height:"100%", background:"#0A0A0A", display:"grid", placeItems:"center"}}>
        <TaborDisc size="86%"/>
      </div>
    );
  }
  if (treatment === "night") {
    // mountain on deep matte field with gold, app-store friendly
    return (
      <div style={{width:"100%", height:"100%", background:"radial-gradient(ellipse 90% 70% at 50% 28%, #1B1810, #0A0A0A 70%)", display:"grid", placeItems:"center", position:"relative"}}>
        <TaborPrimary size="84%"/>
      </div>
    );
  }
  // parchment / diegetic
  return (
    <div className="holy-parchment" style={{width:"100%", height:"100%", display:"grid", placeItems:"center"}}>
      <TaborSigil size="86%"/>
    </div>
  );
}

function IconScaleStrip({ treatment }) {
  return (
    <div style={{display:"flex", alignItems:"center", gap:14, marginTop:14}}>
      {[60,44,28].map(s => (
        <div key={s} style={{width:s, height:s, borderRadius:s*0.22, overflow:"hidden", flex:`0 0 ${s}px`}}>
          <TaborIcon treatment={treatment}/>
        </div>
      ))}
      <span style={{marginLeft:"auto", fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.18em"}}>
        60 · 44 · 28
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IN-APP CONTEXT — Splash + Status header rebranded TABOR
// ─────────────────────────────────────────────────────────────

function TaborSplash() {
  return (
    <div style={{
      width:"100%", height:"100%", background:"#0A0A0A", position:"relative",
      overflow:"hidden", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", color:"var(--holy-ivory)",
    }}>
      {/* ambient mountain glow */}
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 38%, rgba(201,169,97,0.16), transparent 65%)"}}/>
      {/* faint reticle ring */}
      <svg style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-58%)", opacity:0.25}} width="320" height="320" viewBox="0 0 320 320">
        <circle cx="160" cy="160" r="150" fill="none" stroke="#C9A961" strokeWidth="0.5" strokeDasharray="2 6"/>
        <circle cx="160" cy="160" r="128" fill="none" stroke="#C9A961" strokeWidth="0.3"/>
      </svg>
      <div style={{position:"relative", textAlign:"center"}}>
        <TaborPrimary size={180}/>
        <h1 className="holy-display" style={{margin:"2px 0 0", fontSize:72, letterSpacing:"0.05em"}}>TABOR</h1>
        <div className="holy-roman" style={{fontSize:10, color:"var(--holy-gold)", marginTop:10, letterSpacing:"0.5em"}}>
          SONS  OF  FIRE
        </div>
      </div>
      <div style={{position:"absolute", bottom:48, left:0, right:0, textAlign:"center"}}>
        <div className="holy-system" style={{fontSize:10, color:"var(--holy-ivory-muted)", letterSpacing:"0.3em"}}>
          [ AWAKENING THE SYSTEM ]
        </div>
        <div style={{margin:"12px auto 0", width:140, height:3, background:"rgba(201,169,97,0.12)", border:"1px solid rgba(201,169,97,0.3)", position:"relative"}}>
          <div style={{position:"absolute", inset:0, width:"64%", background:"linear-gradient(90deg,#8B6B22,#E6CB85)"}}/>
        </div>
      </div>
    </div>
  );
}

function TaborStatusHeader() {
  return (
    <div style={{
      width:"100%", height:"100%", background:"#0A0A0A", color:"var(--holy-ivory)",
      display:"flex", flexDirection:"column", fontFamily:"var(--font-body)", overflow:"hidden",
    }}>
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,169,97,0.14), transparent 60%)", pointerEvents:"none"}}/>
      <div style={{height:44}}/>
      {/* App bar with TABOR mark */}
      <div style={{display:"flex", alignItems:"center", gap:10, padding:"4px 20px 14px", position:"relative"}}>
        <TaborDisc size={34}/>
        <span className="holy-display" style={{fontSize:22, letterSpacing:"0.08em"}}>TABOR</span>
        <span style={{marginLeft:"auto", fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.18em"}}>
          [ STATUS ]
        </span>
      </div>
      <div style={{height:1, background:"linear-gradient(90deg, transparent, rgba(201,169,97,0.5), transparent)", margin:"0 20px"}}/>
      {/* identity */}
      <div style={{display:"flex", alignItems:"center", gap:16, padding:"22px 20px", position:"relative"}}>
        <div style={{position:"relative", width:84, height:84, flex:"0 0 84px"}}>
          <TaborSigil size={84}/>
        </div>
        <div>
          <div style={{display:"flex", alignItems:"baseline", gap:10}}>
            <h2 className="holy-display" style={{margin:0, fontSize:34, letterSpacing:"0.02em"}}>HANNES</h2>
            <span style={{fontFamily:"var(--font-mono)", fontSize:12, color:"var(--holy-gold)"}}>LV.14</span>
          </div>
          <div style={{display:"flex", gap:6, marginTop:6}}>
            <span style={{fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.15em", background:"rgba(201,169,97,0.16)", color:"var(--holy-gold)", border:"1px solid rgba(201,169,97,0.4)", padding:"3px 7px"}}>SENTINEL</span>
            <span style={{fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.15em", color:"var(--holy-ivory-muted)", padding:"3px 4px"}}>RANK ▸ TEMPERED</span>
          </div>
        </div>
      </div>
      {/* rank progress */}
      <div style={{margin:"4px 20px 0", background:"rgba(20,20,26,0.7)", border:"1px solid rgba(201,169,97,0.35)", padding:"14px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8}}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.22em"}}>NEXT RANK</span>
          <span className="holy-display" style={{fontSize:18, color:"var(--holy-gold)", letterSpacing:"0.12em"}}>FORGED</span>
        </div>
        <div style={{position:"relative", height:8, background:"rgba(201,169,97,0.08)", border:"1px solid rgba(201,169,97,0.35)"}}>
          <div style={{position:"absolute", inset:0, width:"32.1%", background:"linear-gradient(90deg,#8B6B22,#C9A961,#E6CB85)"}}/>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", marginTop:6}}>
          <span style={{fontFamily:"var(--font-mono)", fontSize:10}}>4,820 <span style={{color:"var(--holy-ivory-muted)"}}>/ 15,000</span></span>
          <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)"}}>+320 today</span>
        </div>
      </div>
      <div style={{marginTop:"auto", textAlign:"center", padding:"16px"}}>
        <span className="holy-roman" style={{fontSize:9, color:"var(--holy-gold)", letterSpacing:"0.42em"}}>◇  ΤΑΒΩΡ  ◇</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CEREMONIAL REVEAL — click to replay
// ─────────────────────────────────────────────────────────────

function TaborReveal() {
  const [k, setK] = useState(0);
  return (
    <div onClick={()=>setK(k+1)} style={{
      width:"100%", height:"100%", background:"#0A0A0A", position:"relative",
      overflow:"hidden", cursor:"pointer", display:"grid", placeItems:"center",
    }}>
      <style>{`
        @keyframes tb-ring { from { transform: scale(0.3); opacity:0 } 40% { opacity:0.6 } to { transform: scale(1); opacity:0.3 } }
        @keyframes tb-mark { from { transform: scale(0.6) translateY(14px); opacity:0; filter:blur(8px) } to { transform: scale(1) translateY(0); opacity:1; filter:blur(0) } }
        @keyframes tb-line { from { opacity:0; letter-spacing:0.6em } to { opacity:1; letter-spacing:0.5em } }
        @keyframes tb-word { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
        @keyframes tb-flash { 0%{opacity:0} 10%{opacity:0.5} 100%{opacity:0} }
        @keyframes tb-sys { from {opacity:0} to {opacity:1} }
      `}</style>
      {/* flash */}
      <div key={`f${k}`} style={{position:"absolute", inset:0, background:"radial-gradient(circle at 50% 42%, rgba(244,226,172,0.5), transparent 55%)", animation:"tb-flash 1.6s ease-out both", pointerEvents:"none"}}/>
      {/* reticle ring */}
      <svg key={`r${k}`} style={{position:"absolute", top:"42%", left:"50%", transform:"translate(-50%,-50%)", animation:"tb-ring 1.4s cubic-bezier(.2,.8,.2,1) 0.1s both"}} width="300" height="300" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#C9A961" strokeWidth="0.6" strokeDasharray="2 6"/>
        <circle cx="150" cy="150" r="118" fill="none" stroke="#C9A961" strokeWidth="0.4"/>
      </svg>
      <div style={{position:"relative", textAlign:"center"}}>
        <div key={`sys${k}`} className="holy-system" style={{color:"var(--holy-gold)", marginBottom:18, animation:"tb-sys 0.6s ease 0.1s both"}}>
          [ RANK ATTAINED ]
        </div>
        <div key={`m${k}`} style={{animation:"tb-mark 1.1s cubic-bezier(.2,.9,.2,1) 0.45s both"}}>
          <TaborPrimary size={160}/>
        </div>
        <h1 key={`w${k}`} className="holy-display" style={{margin:"4px 0 0", fontSize:60, letterSpacing:"0.05em", animation:"tb-word 0.7s ease 1.0s both"}}>
          TABOR
        </h1>
        <div key={`l${k}`} className="holy-roman" style={{fontSize:9, color:"var(--holy-gold)", marginTop:10, animation:"tb-line 0.9s ease 1.25s both"}}>
          SONS  OF  FIRE
        </div>
      </div>
      <div style={{position:"absolute", bottom:16, right:18, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.18em"}}>
        ▸ TAP TO REPLAY
      </div>
    </div>
  );
}

Object.assign(window, {
  LockupVertical, LockupHorizontal, LockupStreet,
  TaborIcon, IconScaleStrip, TaborSplash, TaborStatusHeader, TaborReveal,
});
