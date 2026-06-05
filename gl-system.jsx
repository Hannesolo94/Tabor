// gl-system.jsx — Brand guidelines: color, type, voice, motifs, components

// ── COLOR ──
function GLColor() {
  const tokens = [
    ["Matte Black", "#0A0A0A", "Base / backgrounds", "#E8E2D5"],
    ["Surface Lifted", "#15151A", "Cards / panels", "#E8E2D5"],
    ["Byzantine Gold", "#C9A961", "Primary · sacred · rank-up", "#0A0A0A"],
    ["Aged Bronze", "#8B5A2B", "Secondary accent", "#E8E2D5"],
    ["Silver", "#C0C0C0", "Structural lines", "#0A0A0A"],
    ["Parchment Ivory", "#E8E2D5", "Primary text", "#0A0A0A"],
    ["Aged Ivory", "#8A8378", "Muted text", "#0A0A0A"],
    ["Martyr Crimson", "#7A1F1F", "Crisis / alerts only", "#E8E2D5"],
  ];
  return (
    <GLSection n="05" kicker="Color" title="The Palette">
      <Body>Matte black ground, gold for the sacred and the earned, crimson reserved strictly for crisis. Gold is treated like leaf, a soft metallic sheen, never a flat fill. Silver is structure only; never a focal color.</Body>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10}}>
        {tokens.map(([name, hex, role, fg],i)=>(
          <div key={i} style={{border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{background:hex, color:fg, padding:"22px 14px 16px", minHeight:84, display:"flex", flexDirection:"column", justifyContent:"flex-end"}}>
              <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:13, letterSpacing:"0.04em"}}>{name}</div>
              <div style={{fontFamily:"var(--font-mono)", fontSize:10, opacity:0.8, marginTop:2}}>{hex}</div>
            </div>
            <div style={{padding:"8px 12px", background:"#0E0E12", fontFamily:"var(--font-mono)", fontSize:9, color:"#9A948A", letterSpacing:"0.1em", textTransform:"uppercase"}}>{role}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex", gap:18, marginTop:18, flexWrap:"wrap"}}>
        {[["Gold = the sacred + the earned", "var(--holy-gold)"], ["Crimson = crisis ONLY", "var(--holy-crimson-glow)"], ["No flat gradients, always textured leaf", "#9A948A"]].map(([t,c],i)=>(
          <div key={i} style={{display:"flex", alignItems:"center", gap:8}}>
            <span style={{width:10, height:10, background:c, display:"inline-block"}}/>
            <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"#B8B2A6", letterSpacing:"0.1em"}}>{t}</span>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// ── TYPOGRAPHY ──
function GLType() {
  const roles = [
    ["Wordmark", "Pirata One", "'Pirata One', serif", 400, 56, "Tabor", "Logo only. Never body."],
    ["Display / Headings", "Cinzel", "'Cinzel', serif", 700, 40, "SONS OF FIRE", "Section titles, ceremony, UI headers."],
    ["Body", "Inter", "var(--font-body)", 400, 18, "No man climbs the mountain alone.", "Paragraphs, descriptions, UI copy."],
    ["System / Stats", "JetBrains Mono", "var(--font-mono)", 500, 18, "STR 4,820 / WIS 4,160", "HUD, stats, the System voice."],
    ["Scripture", "Cormorant Garamond", "var(--font-scripture)", 500, 24, "Iron sharpens iron.", "Verses, liturgical quotes."],
  ];
  return (
    <GLSection n="06" kicker="Typography" title="Five Voices">
      <Body><strong style={{color:"var(--holy-ivory)"}}>Pirata One</strong> is the wordmark alone. <strong style={{color:"var(--holy-ivory)"}}>Cinzel</strong> is the general face for headings and UI. Inter carries body, JetBrains Mono is the System, Cormorant sets scripture.</Body>
      <div style={{display:"flex", flexDirection:"column", gap:0, border:"1px solid rgba(201,169,97,0.18)"}}>
        {roles.map(([role, face, fam, wt, size, sample, use],i)=>(
          <div key={i} style={{display:"grid", gridTemplateColumns:"160px 1fr", gap:20, padding:"22px 24px", borderTop: i? "1px solid rgba(201,169,97,0.1)" : "none", alignItems:"center"}}>
            <div>
              <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:13, color:"var(--holy-gold)", letterSpacing:"0.06em"}}>{role}</div>
              <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"#9A948A", letterSpacing:"0.12em", marginTop:4}}>{face.toUpperCase()}</div>
              <div style={{fontFamily:"var(--font-body)", fontSize:10.5, color:"#7A746A", marginTop:6, lineHeight:1.4}}>{use}</div>
            </div>
            <div style={{fontFamily:fam, fontWeight:wt, fontSize:size, color:"var(--holy-ivory)", lineHeight:1.1, fontStyle: role==="Scripture" ? "italic" : "normal"}}>{sample}</div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// ── VOICE & TONE ──
function GLVoice() {
  const sysTags = ["[STATUS]", "[QUEST COMPLETE]", "[RANK ATTAINED]", "[Daily Quest Issued]"];
  const classes = ["Sentinel", "Scribe", "Crusader", "Pilgrim"];
  const ranks = ["Recruit", "Initiate", "Tempered", "Forged", "Crucible", "Ascended", "Supersonic Fit"];
  return (
    <GLSection n="07" kicker="Voice" title="The System Speaks">
      <Body>The AI Guide addresses the user like a System: terse, ceremonial, commanding but never cruel. Bracketed declarations. Imperatives. No emoji, no slang, no soft corporate cheer. It calls men upward.</Body>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"20px"}}>
          <GLLabel color="var(--holy-gold)">System voice patterns</GLLabel>
          <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:12}}>
            {sysTags.map((t,i)=>(<span key={i} style={{fontFamily:"var(--font-mono)", fontSize:12, color:"var(--holy-gold)", border:"1px solid rgba(201,169,97,0.4)", background:"rgba(201,169,97,0.08)", padding:"6px 10px", letterSpacing:"0.06em"}}>{t}</span>))}
          </div>
          <div style={{marginTop:16, fontFamily:"var(--font-mono)", fontSize:12.5, color:"#B8B2A6", lineHeight:1.7}}>
            <div><span style={{color:"var(--holy-gold)"}}>▸</span> The chapter awaits. Scout it.</div>
            <div><span style={{color:"var(--holy-gold)"}}>▸</span> Iron logged. The body is tempered.</div>
            <div><span style={{color:"var(--holy-gold)"}}>▸</span> You did not climb alone today.</div>
          </div>
        </div>
        <div style={{display:"grid", gridTemplateRows:"1fr 1fr", gap:14}}>
          <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"18px 20px"}}>
            <GLLabel color="var(--holy-gold)">Classes</GLLabel>
            <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:10}}>
              {classes.map((c,i)=>(<span key={i} style={{fontFamily:"'Cinzel', serif", fontWeight:600, fontSize:14, color:"var(--holy-ivory)", letterSpacing:"0.06em"}}>{c}{i<classes.length-1 && <span style={{color:"#5A544A", marginLeft:8}}>·</span>}</span>))}
            </div>
          </div>
          <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"18px 20px"}}>
            <GLLabel color="var(--holy-gold)">Ranks · ascent</GLLabel>
            <div style={{fontFamily:"var(--font-mono)", fontSize:12, color:"#B8B2A6", marginTop:10, lineHeight:1.9, letterSpacing:"0.04em"}}>
              {ranks.map((r,i)=>(<span key={i}>{r}{i<ranks.length-1 && <span style={{color:"var(--holy-gold)"}}> → </span>}</span>))}
            </div>
          </div>
        </div>
      </div>
    </GLSection>
  );
}

// ── MOTIFS ──
function GLMotifs() {
  const Tile = ({ label, children }) => (
    <div style={{border:"1px solid rgba(201,169,97,0.18)", background:"#0E0E12"}}>
      <div style={{padding:"24px", display:"grid", placeItems:"center", height:120}}>{children}</div>
      <div style={{padding:"9px 12px", borderTop:"1px solid rgba(201,169,97,0.12)"}}><GLLabel color="var(--holy-gold)">{label}</GLLabel></div>
    </div>
  );
  const gold = "#C9A961";
  return (
    <GLSection n="08" kicker="Iconography" title="Motifs">
      <Body>A small system of marks drawn from the seal. Use sparingly as section breaks, list bullets, and ceremonial accents.</Body>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12}}>
        <Tile label="Mountain"><svg width="80" height="56" viewBox="0 0 80 56"><path d="M6,50 L30,16 L42,30 L54,12 L74,50 Z" fill="none" stroke={gold} strokeWidth="2"/></svg></Tile>
        <Tile label="Three Lights"><svg width="80" height="40" viewBox="0 0 80 40"><circle cx="24" cy="24" r="3" fill={gold}/><circle cx="40" cy="14" r="4" fill={gold}/><circle cx="56" cy="24" r="3" fill={gold}/></svg></Tile>
        <Tile label="Gothic Cross"><svg width="40" height="60" viewBox="0 0 40 60"><g stroke={gold} strokeWidth="3" strokeLinecap="round"><path d="M20,6 L20,54 M8,22 L32,22 M12,14 L28,14"/></g></svg></Tile>
        <Tile label="Coin Ring"><svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke={gold} strokeWidth="1.6"/><circle cx="32" cy="32" r="22" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.5"/></svg></Tile>
      </div>
    </GLSection>
  );
}

// ── COMPONENTS ──
function GLComponents() {
  return (
    <GLSection n="09" kicker="Application" title="UI Primitives">
      <Body>How the system shows up in product: gold on black, thin borders, monospace system text, ceremonial restraint.</Body>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        {/* buttons */}
        <div style={{border:"1px solid rgba(201,169,97,0.18)", background:"#0E0E12", padding:"24px"}}>
          <GLLabel color="var(--holy-gold)">Buttons</GLLabel>
          <div style={{display:"flex", gap:12, marginTop:14, flexWrap:"wrap"}}>
            <button style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:13, letterSpacing:"0.1em", color:"#0A0A0A", background:"linear-gradient(180deg,#E8D08C,#C9A961)", border:"none", padding:"12px 22px", textTransform:"uppercase", cursor:"pointer"}}>Accept Quest</button>
            <button style={{fontFamily:"'Cinzel', serif", fontWeight:600, fontSize:13, letterSpacing:"0.1em", color:"var(--holy-gold)", background:"transparent", border:"1px solid rgba(201,169,97,0.5)", padding:"12px 22px", textTransform:"uppercase", cursor:"pointer"}}>Dismiss</button>
          </div>
        </div>
        {/* badges */}
        <div style={{border:"1px solid rgba(201,169,97,0.18)", background:"#0E0E12", padding:"24px"}}>
          <GLLabel color="var(--holy-gold)">Rank badge / chips</GLLabel>
          <div style={{display:"flex", gap:10, marginTop:14, flexWrap:"wrap", alignItems:"center"}}>
            <span style={{fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.15em", background:"rgba(201,169,97,0.16)", color:"var(--holy-gold)", border:"1px solid rgba(201,169,97,0.4)", padding:"5px 10px"}}>SENTINEL</span>
            <span style={{fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.15em", color:"#9A948A", border:"1px solid rgba(255,255,255,0.12)", padding:"5px 10px"}}>RANK ▸ TEMPERED</span>
            <span style={{fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.15em", background:"rgba(122,31,31,0.25)", color:"#C03A3A", border:"1px solid rgba(192,58,58,0.4)", padding:"5px 10px"}}>STREAK AT RISK</span>
          </div>
        </div>
        {/* panel */}
        <div style={{border:"1px solid rgba(201,169,97,0.18)", background:"#0E0E12", padding:"24px"}}>
          <GLLabel color="var(--holy-gold)">Tactical panel</GLLabel>
          <div style={{marginTop:14, background:"rgba(20,22,30,0.7)", border:"1px solid rgba(201,169,97,0.4)", padding:"16px", boxShadow:"inset 0 0 24px rgba(201,169,97,0.08)"}}>
            <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.22em"}}>[ STATUS ]</div>
            <div style={{fontFamily:"'Pirata One', serif", fontSize:30, color:"var(--holy-ivory)", marginTop:6}}>Hannes</div>
            <div style={{fontFamily:"var(--font-mono)", fontSize:11, color:"#9A948A", marginTop:2}}>LV.14 · SENTINEL</div>
          </div>
        </div>
        {/* progress */}
        <div style={{border:"1px solid rgba(201,169,97,0.18)", background:"#0E0E12", padding:"24px"}}>
          <GLLabel color="var(--holy-gold)">Progress · rank-up</GLLabel>
          <div style={{marginTop:16}}>
            <div style={{display:"flex", justifyContent:"space-between", fontFamily:"var(--font-mono)", fontSize:10, color:"#9A948A", marginBottom:6}}><span>TO FORGED</span><span>4,820 / 15,000</span></div>
            <div style={{height:8, background:"rgba(201,169,97,0.1)", border:"1px solid rgba(201,169,97,0.35)", position:"relative"}}>
              <div style={{position:"absolute", inset:0, width:"32%", background:"linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)"}}/>
            </div>
          </div>
        </div>
      </div>
    </GLSection>
  );
}

Object.assign(window, { GLColor, GLType, GLVoice, GLMotifs, GLComponents });
