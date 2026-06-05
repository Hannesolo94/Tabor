// messaging-app.jsx — TABOR verbal identity / brand messaging
// Reuses GLSection, Body, GLLabel, GLCard from gl-logo.jsx + tabor-mark.jsx.

function MTopNav() {
  return (
    <div style={{position:"sticky", top:0, zIndex:50, background:"rgba(10,10,10,0.86)", backdropFilter:"blur(10px)", borderBottom:"1px solid rgba(201,169,97,0.2)"}}>
      <div style={{maxWidth:1000, margin:"0 auto", padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16}}>
        <span style={{fontFamily:"'Pirata One', serif", fontSize:22, color:"var(--holy-gold)"}}>Tabor</span>
        <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-ivory-muted)", letterSpacing:"0.2em", textTransform:"uppercase"}}>Verbal Identity · V1</span>
        <a href="TABOR Brand Guidelines.html" style={{fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.14em", color:"var(--holy-gold)", border:"1px solid rgba(201,169,97,0.5)", padding:"7px 12px", textDecoration:"none", textTransform:"uppercase", whiteSpace:"nowrap"}}>Guidelines ↗</a>
      </div>
    </div>
  );
}

// Manifesto cover
function MCover() {
  const lines = [
    "You were not made for the couch.",
    "You were made for the mountain.",
    "Most men drift. They scroll, they soften,",
    "they wait for a season that never comes.",
    "Tabor is the refusal.",
    "Open the Word like a blade. Log the iron.",
    "Answer for your brothers.",
    "Go up as you are. Come down forged.",
  ];
  return (
    <section style={{minHeight:"94vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"80px 28px", position:"relative", borderBottom:"1px solid rgba(201,169,97,0.14)", maxWidth:1000, margin:"0 auto"}}>
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 30% 40%, rgba(201,169,97,0.08), transparent 70%)", pointerEvents:"none"}}/>
      <div className="holy-system" style={{color:"var(--holy-gold)", letterSpacing:"0.3em", position:"relative"}}>[ THE MANIFESTO ]</div>
      <h1 style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:"clamp(28px,4vw,46px)", lineHeight:1.25, color:"var(--holy-ivory)", margin:"22px 0 0", letterSpacing:"0.02em", position:"relative"}}>
        {lines.map((l,i)=>(
          <div key={i} style={{color: (i>=4&&i<=6)||i===7 ? "var(--holy-ivory)" : "#B8B2A6", fontWeight: i===4||i===7?700:600}}>{l}</div>
        ))}
      </h1>
      <div style={{marginTop:34, position:"relative"}}>
        <span style={{fontFamily:"'Pirata One', serif", fontSize:46, color:"var(--holy-gold)"}}>We are the Sons of Fire.</span>
      </div>
    </section>
  );
}

// North Star
function MNorth() {
  const items = [
    ["Essence", "ASCENT", "One word. Everything we make should move a man upward."],
    ["Mission", "To make daily discipline feel like a quest worth answering.", "Spiritual, physical, relational, all turned into a campaign, not a chore."],
    ["Vision", "A generation of men who train their souls like athletes and stand for each other like a guild.", "Faith made strenuous. Brotherhood made real."],
  ];
  return (
    <GLSection n="01" kicker="Strategy" title="North Star" first>
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        {items.map(([k, big, sub],i)=>(
          <div key={i} style={{display:"grid", gridTemplateColumns:"150px 1fr", gap:24, padding:"22px 0", borderTop: i?"1px solid rgba(201,169,97,0.12)":"none"}}>
            <div style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--holy-gold)", letterSpacing:"0.2em", textTransform:"uppercase", paddingTop:6}}>{k}</div>
            <div>
              <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize: i===0?30:21, color:"var(--holy-ivory)", lineHeight:1.3, letterSpacing: i===0?"0.1em":"0.01em"}}>{big}</div>
              <div style={{fontFamily:"var(--font-body)", fontSize:13.5, color:"#9A948A", marginTop:8, lineHeight:1.55}}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// Positioning
function MPositioning() {
  return (
    <GLSection n="02" kicker="Strategy" title="Positioning">
      <div style={{border:"1px solid rgba(201,169,97,0.25)", background:"#0E0E12", padding:"30px 28px"}}>
        <div style={{fontFamily:"'Cormorant Garamond', serif", fontSize:23, lineHeight:1.6, color:"var(--holy-ivory)"}}>
          For <strong style={{color:"var(--holy-gold)", fontWeight:600}}>Christian men, 18 to 40, who game and refuse to drift</strong>, Tabor is the brotherhood app that turns faith, fitness, and accountability into a daily campaign, guided by a System that speaks the language of the games they love. Where devotional apps soothe and fitness apps isolate, <strong style={{color:"var(--holy-gold)", fontWeight:600}}>Tabor summons.</strong>
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14}}>
        <div style={{border:"1px solid rgba(201,169,97,0.18)", padding:"18px 20px"}}>
          <GLLabel color="var(--holy-gold)">Who it's for</GLLabel>
          <Body max={420}>Men who play, lift, and believe, and are tired of doing all three alone and inconsistently. They want structure, challenge, and a code.</Body>
        </div>
        <div style={{border:"1px solid rgba(122,31,31,0.4)", padding:"18px 20px"}}>
          <GLLabel color="#C03A3A">Who it's not for</GLLabel>
          <Body max={420}>Anyone wanting passive comfort, vague wellness, or a feed to scroll. Tabor asks something of you. That's the point.</Body>
        </div>
      </div>
    </GLSection>
  );
}

// The Creed (values)
function MCreed() {
  const creed = [
    ["I", "Ascent over comfort.", "The mountain is the whole point. We choose the harder, higher road."],
    ["II", "Discipline is worship.", "Showing up to the Word, the iron, the guild is a sacred act, not a chore."],
    ["III", "No man climbs alone.", "Brotherhood is structural, not optional. We carry and are carried."],
    ["IV", "Hold the line.", "Especially when it's hard. The streak, the check-in, the promise kept."],
    ["V", "Free for life.", "No brother priced out of his own becoming. Ever."],
  ];
  return (
    <GLSection n="03" kicker="Belief" title="The Creed">
      <Body>Five tenets. They govern every product decision and every line of copy.</Body>
      <div style={{display:"flex", flexDirection:"column"}}>
        {creed.map(([n, t, d],i)=>(
          <div key={i} style={{display:"grid", gridTemplateColumns:"56px 1fr", gap:20, padding:"20px 0", borderTop:"1px solid rgba(201,169,97,0.12)", alignItems:"baseline"}}>
            <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:24, color:"var(--holy-gold)"}}>{n}</div>
            <div>
              <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:20, color:"var(--holy-ivory)", letterSpacing:"0.02em"}}>{t}</div>
              <div style={{fontFamily:"var(--font-body)", fontSize:13.5, color:"#9A948A", marginTop:6, lineHeight:1.55}}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// Messaging Pillars
function MPillars() {
  const p = [
    ["Scripture Raid", "The Word is a weapon.", "We don't 'do devotionals.' We raid the chapter, drill it, and carry it into the day."],
    ["Fitness Guild", "The body is a temple. So train it.", "Strength is stewardship. Logged, not boasted. Iron sharpens the man."],
    ["Brotherhood", "No one climbs alone.", "A guild that knows your name, your streak, and your weak days, and shows up anyway."],
  ];
  return (
    <GLSection n="04" kicker="Message" title="Three Pillars, Three Lines">
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14}}>
        {p.map(([pill, line, body],i)=>(
          <div key={i} style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"24px 20px"}}>
            <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.18em"}}>{pill.toUpperCase()}</div>
            <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:19, color:"var(--holy-ivory)", margin:"12px 0 10px", lineHeight:1.3}}>{line}</div>
            <div style={{fontFamily:"var(--font-body)", fontSize:13, color:"#9A948A", lineHeight:1.55}}>{body}</div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// Tone of voice
function MTone() {
  const are = ["Commanding", "Sacred", "Brotherly", "Spare"];
  const arent = ["Hype-bro", "Soft / cutesy", "Corporate-cheerful", "Ironic / cynical"];
  const pairs = [
    ["“The chapter awaits. Scout it.”", "“Hey! Ready for today's reading? 😊”"],
    ["“Iron logged. The body is tempered.”", "“Crushed it! You're killing it, champ!”"],
    ["“You did not climb alone today.”", "“Don't forget to check in with friends!”"],
    ["“Hold the line. The streak stands at 47.”", "“Oops, keep that streak alive!”"],
  ];
  return (
    <GLSection n="05" kicker="Voice" title="How Tabor Speaks">
      <Body>The System voice is a drill sergeant who loves you and an older brother who won't let you quit. It declares, it summons, it never grovels or hypes. No emoji. No slang. No corporate warmth.</Body>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16}}>
        <div style={{border:"1px solid rgba(201,169,97,0.25)", padding:"18px 20px"}}>
          <GLLabel color="var(--holy-gold)">We are</GLLabel>
          <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:12}}>
            {are.map((w,i)=>(<span key={i} style={{fontFamily:"'Cinzel', serif", fontWeight:600, fontSize:15, color:"var(--holy-ivory)", border:"1px solid rgba(201,169,97,0.4)", padding:"6px 12px"}}>{w}</span>))}
          </div>
        </div>
        <div style={{border:"1px solid rgba(122,31,31,0.4)", padding:"18px 20px"}}>
          <GLLabel color="#C03A3A">We are not</GLLabel>
          <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:12}}>
            {arent.map((w,i)=>(<span key={i} style={{fontFamily:"'Cinzel', serif", fontWeight:600, fontSize:15, color:"#9A948A", border:"1px solid rgba(122,31,31,0.35)", padding:"6px 12px"}}>{w}</span>))}
          </div>
        </div>
      </div>
      <div style={{border:"1px solid rgba(201,169,97,0.18)"}}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr"}}>
          <div style={{padding:"10px 18px", borderRight:"1px solid rgba(201,169,97,0.14)", borderBottom:"1px solid rgba(201,169,97,0.14)"}}><GLLabel color="var(--holy-gold)">Say</GLLabel></div>
          <div style={{padding:"10px 18px", borderBottom:"1px solid rgba(201,169,97,0.14)"}}><GLLabel color="#C03A3A">Don't say</GLLabel></div>
        </div>
        {pairs.map(([s,d],i)=>(
          <div key={i} style={{display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom: i<pairs.length-1?"1px solid rgba(201,169,97,0.1)":"none"}}>
            <div style={{padding:"14px 18px", borderRight:"1px solid rgba(201,169,97,0.1)", fontFamily:"var(--font-mono)", fontSize:13, color:"var(--holy-ivory)"}}>{s}</div>
            <div style={{padding:"14px 18px", fontFamily:"var(--font-body)", fontSize:13, color:"#8A847A", fontStyle:"italic"}}>{d}</div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// Lexicon
function MLexicon() {
  const use = ["Quest", "Raid", "Forge", "Temper", "Ascent", "Guild", "The System", "Hold the line", "Son of Fire", "Summon", "The Word", "Climb"];
  const avoid = ["Journey", "Wellness", "Self-care", "Slay", "Hustle", "Vibes", "Content", "Engage", "Synergy", "😊 / emoji"];
  return (
    <GLSection n="06" kicker="Language" title="Lexicon">
      <Body>Words carry the world. Use the first set freely; never reach for the second.</Body>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div style={{border:"1px solid rgba(201,169,97,0.25)", padding:"20px"}}>
          <GLLabel color="var(--holy-gold)">Our words</GLLabel>
          <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:12}}>
            {use.map((w,i)=>(<span key={i} style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--holy-gold)", background:"rgba(201,169,97,0.08)", border:"1px solid rgba(201,169,97,0.35)", padding:"5px 10px", letterSpacing:"0.05em"}}>{w}</span>))}
          </div>
        </div>
        <div style={{border:"1px solid rgba(122,31,31,0.4)", padding:"20px"}}>
          <GLLabel color="#C03A3A">Banned words</GLLabel>
          <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:12}}>
            {avoid.map((w,i)=>(<span key={i} style={{fontFamily:"var(--font-mono)", fontSize:11, color:"#8A847A", border:"1px solid rgba(122,31,31,0.3)", padding:"5px 10px", letterSpacing:"0.05em", textDecoration:"line-through"}}>{w}</span>))}
          </div>
        </div>
      </div>
    </GLSection>
  );
}

// Taglines + boilerplate
function MTaglines() {
  const lines = [
    ["Sons of Fire.", "Primary · the rallying cry"],
    ["Go up as you are. Come down forged.", "The promise / hero line"],
    ["The chapter is the dungeon.", "Scripture Raid"],
    ["No man climbs alone.", "Brotherhood"],
    ["Discipline is worship.", "Ethos / fitness"],
  ];
  return (
    <GLSection n="07" kicker="Lines" title="Taglines & Boilerplate">
      <div style={{display:"flex", flexDirection:"column", gap:0, marginBottom:24}}>
        {lines.map(([l,role],i)=>(
          <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:16, padding:"16px 0", borderTop: i?"1px solid rgba(201,169,97,0.12)":"none", flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Pirata One', serif", fontSize: i===0?34:26, color: i===0?"var(--holy-gold)":"var(--holy-ivory)"}}>{l}</span>
            <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.18em", textTransform:"uppercase"}}>{role}</span>
          </div>
        ))}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div style={{border:"1px solid rgba(201,169,97,0.18)", padding:"18px 20px"}}>
          <GLLabel color="var(--holy-gold)">One-liner</GLLabel>
          <Body max={420}>Tabor is a free brotherhood app that turns Scripture, fitness, and accountability into a daily quest for Christian men who game.</Body>
        </div>
        <div style={{border:"1px solid rgba(201,169,97,0.18)", padding:"18px 20px"}}>
          <GLLabel color="var(--holy-gold)">Short boilerplate</GLLabel>
          <Body max={420}>Tabor summons Christian men to ascend. Three daily quests: read the Word, train the body, stand with your guild, all guided by a System that speaks the language of the games they love. Free for life. Sons of Fire.</Body>
        </div>
      </div>
    </GLSection>
  );
}

function MessagingApp() {
  return (
    <div style={{background:"#0A0A0A"}}>
      <MTopNav/>
      <MCover/>
      <MNorth/>
      <MPositioning/>
      <MCreed/>
      <MPillars/>
      <MTone/>
      <MLexicon/>
      <MTaglines/>
      <footer style={{maxWidth:1000, margin:"0 auto", padding:"50px 28px 70px", borderTop:"1px solid rgba(201,169,97,0.14)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16}}>
        <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"#7A746A", letterSpacing:"0.16em"}}>TABOR · VERBAL IDENTITY · V1</div>
        <span style={{fontFamily:"'Pirata One', serif", fontSize:26, color:"var(--holy-gold)"}}>Sons of Fire</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MessagingApp/>);
