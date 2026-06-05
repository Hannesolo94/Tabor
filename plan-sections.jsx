// plan-sections.jsx — TABOR app blueprint (part A: overview, IA, nav, onboarding, loop, pillars)
// Reuses GLSection, Body, GLLabel from gl-logo.jsx + tabor-mark.jsx.

function Arrow({ dir = "right" }) {
  const ch = dir === "down" ? "↓" : "→";
  return <span style={{color:"var(--holy-gold)", fontFamily:"var(--font-mono)", fontSize:16, opacity:0.7, padding:"0 4px", alignSelf:"center"}}>{ch}</span>;
}

function Box({ title, sub, tone = "gold", flex }) {
  const bd = tone === "crimson" ? "rgba(122,31,31,0.5)" : "rgba(201,169,97,0.4)";
  return (
    <div style={{flex: flex||"1", minWidth:120, border:`1px solid ${bd}`, background:"#0E0E12", padding:"14px 16px"}}>
      <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:14, color:"var(--holy-ivory)", letterSpacing:"0.03em"}}>{title}</div>
      {sub && <div style={{fontFamily:"var(--font-body)", fontSize:11.5, color:"#9A948A", marginTop:5, lineHeight:1.45}}>{sub}</div>}
    </div>
  );
}

// ── 00 COVER ──
function PCover() {
  return (
    <section style={{minHeight:"82vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"70px 24px", position:"relative", borderBottom:"1px solid rgba(201,169,97,0.14)"}}>
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,169,97,0.09), transparent 70%)"}}/>
      <div style={{width:"100%", maxWidth:230, position:"relative"}}><TaborIconSeal id="plan-cover" size={200}/></div>
      <div className="holy-system" style={{color:"var(--holy-gold)", letterSpacing:"0.3em", marginTop:24, position:"relative"}}>[ PRODUCT BLUEPRINT · V1 ]</div>
      <h1 style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:"clamp(28px,4vw,44px)", margin:"12px 0 0", color:"var(--holy-ivory)", letterSpacing:"0.08em", position:"relative"}}>THE CAMPAIGN MAP</h1>
      <p style={{fontFamily:"var(--font-body)", fontSize:14, color:"#9A948A", maxWidth:560, marginTop:14, lineHeight:1.6, position:"relative"}}>
        Strategy, architecture, navigation, and flows for the TABOR app. The plan we lock before we build the prototype.
      </p>
    </section>
  );
}

// ── 01 OVERVIEW + CORE LOOP ──
function POverview() {
  const loop = [
    ["Summon", "The System greets you and issues the day."],
    ["3 Daily Quests", "Scripture, Body, Brotherhood."],
    ["Complete", "Read, train, check in."],
    ["Earn", "XP, stat gains, streak held."],
    ["Ascend", "Progress toward the next rank."],
    ["Witnessed", "Your guild sees you showed up."],
  ];
  return (
    <GLSection n="01" kicker="Strategy" title="The Core Loop" first>
      <Body>One app, one daily ritual. Every session moves a man up the mountain a little. The loop is short enough to finish on a weekday and rich enough to chase for years. Seasons and rank-ups layer long arcs over the daily rhythm.</Body>
      <div style={{display:"flex", flexWrap:"wrap", gap:0, alignItems:"stretch", marginTop:8}}>
        {loop.map(([t,s],i)=>(
          <React.Fragment key={i}>
            <Box title={t} sub={s} flex="1 1 150px"/>
            {i<loop.length-1 && <Arrow/>}
          </React.Fragment>
        ))}
      </div>
      <div style={{display:"flex", alignItems:"center", gap:8, marginTop:14, fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-ivory-muted)", letterSpacing:"0.12em"}}>
        <span style={{color:"var(--holy-gold)"}}>↻</span> Repeats daily. Streaks, seasons, and rank ceremonies reward the long climb.
      </div>
    </GLSection>
  );
}

// ── 02 INFORMATION ARCHITECTURE ──
function PIA() {
  const tabs = [
    ["Quests", "Home", ["Daily Quests", "Quest detail", "Quest complete + reward", "Streak view", "The System (chat)"]],
    ["Scripture", "Raid", ["Reading plan", "Chapter reader", "Quiz / drill", "Verse memory", "Raid results"]],
    ["Body", "Guild of Iron", ["Workout home", "Workout player", "Log activity", "History + PRs", "Stat gains"]],
    ["Guild", "Brotherhood", ["Your guild", "Check-in feed", "Members", "Guild chat", "Find / forge guild"]],
    ["Status", "Profile", ["Status Window", "Rank ladder", "Class detail", "Relics / achievements", "Settings"]],
  ];
  return (
    <GLSection n="02" kicker="Architecture" title="Information Architecture">
      <Body>Five destinations, one per pillar plus Quests (the home) and Status (the self). Everything a man needs is two taps deep. The System is reachable from anywhere.</Body>
      <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10}}>
        {tabs.map(([tab, role, screens],i)=>(
          <div key={i} style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12"}}>
            <div style={{padding:"12px 12px", borderBottom:"1px solid rgba(201,169,97,0.16)"}}>
              <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:14, color:"var(--holy-gold)", letterSpacing:"0.04em"}}>{tab}</div>
              <div style={{fontFamily:"var(--font-mono)", fontSize:8, color:"var(--holy-ivory-muted)", letterSpacing:"0.14em", textTransform:"uppercase", marginTop:3}}>{role}</div>
            </div>
            <div style={{padding:"10px 12px"}}>
              {screens.map((s,j)=>(
                <div key={j} style={{fontFamily:"var(--font-body)", fontSize:11.5, color:"#B8B2A6", padding:"5px 0", borderBottom: j<screens.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>{s}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// ── 03 NAVIGATION MODEL ──
function PNavModel() {
  const tabs = [["Quests","◇"],["Scripture","✝"],["Body","▲"],["Guild","⌂"],["Status","◈"]];
  return (
    <GLSection n="03" kicker="Navigation" title="Navigation Model">
      <Body>A persistent five-tab bar at the foot of the screen, Quests centered as home. The System (AI Guide) rides above the bar as a recurring summon, not a buried menu. Ceremonies (rank-up, awakening) take over the full screen and bypass the bar.</Body>
      <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"radial-gradient(ellipse 100% 90% at 50% 0%, #141318, #0A0A0A 72%)", padding:"40px 24px 0", maxWidth:380, margin:"0 auto"}}>
        <div style={{textAlign:"center", color:"#5A544A", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.2em", paddingBottom:60}}>[ SCREEN CONTENT ]</div>
        <div style={{display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(201,169,97,0.3)", padding:"12px 6px"}}>
          {tabs.map(([t,ic],i)=>(
            <div key={i} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1}}>
              <span style={{fontSize:16, color: i===0?"var(--holy-gold)":"#6E6A60"}}>{ic}</span>
              <span style={{fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.08em", color: i===0?"var(--holy-gold)":"#6E6A60", textTransform:"uppercase"}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <GLLabel>Quests = home · the System floats above the bar · ceremonies are full-screen</GLLabel>
    </GLSection>
  );
}

// ── 04 ONBOARDING ──
function POnboarding() {
  const steps = [
    ["Splash", "The seal ignites. Pure ceremony, two seconds."],
    ["The Manifesto", "One screen. You were made for the mountain."],
    ["The Calling", "Why are you here? Pick what you are fighting for."],
    ["Trials", "A short assessment assigns your class: Sentinel, Scribe, Crusader, or Pilgrim."],
    ["The Oath", "Set commitments: scripture plan, fitness baseline, daily window."],
    ["Forge a Guild", "Join an open guild or forge your own and invite brothers."],
    ["Rank Reveal", "The System names you Recruit. Full-screen ceremony."],
    ["First Quest", "Day 1 issued. The campaign begins."],
  ];
  return (
    <GLSection n="04" kicker="Flow" title="Onboarding: The Awakening">
      <Body>The first run is a rite, not a form. It earns commitment by treating the user like an initiate. Target: under three minutes to the first quest, with the option to go deeper later.</Body>
      <div style={{display:"flex", flexDirection:"column", gap:0}}>
        {steps.map(([t,d],i)=>(
          <div key={i} style={{display:"grid", gridTemplateColumns:"44px 1fr", gap:16, padding:"14px 0", borderTop:"1px solid rgba(201,169,97,0.12)", alignItems:"baseline"}}>
            <div style={{fontFamily:"var(--font-mono)", fontSize:13, color:"var(--holy-gold)", letterSpacing:"0.1em"}}>{String(i+1).padStart(2,"0")}</div>
            <div>
              <span style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:16, color:"var(--holy-ivory)", letterSpacing:"0.03em"}}>{t}</span>
              <span style={{fontFamily:"var(--font-body)", fontSize:13, color:"#9A948A", marginLeft:12}}>{d}</span>
            </div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// ── 05 DAILY LOOP DETAIL ──
function PDaily() {
  const quests = [
    ["Scout the Chapter", "Scripture Raid", "Read the day's passage, then a 3-question drill.", "+WIS"],
    ["Iron Body", "Fitness Guild", "7,500 steps or a 20-minute workout. Logged.", "+STR / +AGI"],
    ["Hold the Line", "Brotherhood", "Check in with your guild. One honest line.", "+MANA"],
  ];
  return (
    <GLSection n="05" kicker="Flow" title="The Daily Quest Panel">
      <Body>Home screen, every day. Three quests, one per pillar, framed by the System. A streak counter and a reset countdown create gentle pressure. Completing all three triggers a small daily seal.</Body>
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        {quests.map(([t, pillar, d, stat],i)=>(
          <div key={i} style={{display:"flex", gap:16, alignItems:"center", border:"1px solid rgba(201,169,97,0.22)", background:"#0E0E12", padding:"16px 18px"}}>
            <span style={{width:20, height:20, border:"1.5px solid rgba(201,169,97,0.6)", flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontFamily:"var(--font-mono)", fontSize:8, color:"var(--holy-gold)", letterSpacing:"0.18em"}}>{pillar.toUpperCase()}</div>
              <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:16, color:"var(--holy-ivory)", margin:"2px 0"}}>{t}</div>
              <div style={{fontFamily:"var(--font-body)", fontSize:12.5, color:"#9A948A"}}>{d}</div>
            </div>
            <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.08em", whiteSpace:"nowrap"}}>{stat}</span>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// ── 06 PILLARS AS FEATURES ──
function PPillars() {
  const p = [
    ["Scripture Raid", ["Daily reading plans (tracks by season)", "Chapter reader with verse highlight + save", "Quizzes and recall drills for XP", "Verse memory streaks", "Boss chapters: longer raids, bigger rewards"]],
    ["Fitness Guild", ["Workout library by level and goal", "Guided workout player with timer", "Manual + step logging", "Personal records and stat curves", "Weekly iron challenges"]],
    ["Brotherhood", ["Small guilds (8 to 12 men)", "Daily check-ins and honest lines", "Accountability nudges when a brother slips", "Guild chat and prayer requests", "Guild standing and shared goals"]],
  ];
  return (
    <GLSection n="06" kicker="Features" title="The Three Pillars">
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14}}>
        {p.map(([t, feats],i)=>(
          <div key={i} style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"22px 18px"}}>
            <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.18em"}}>{`PILLAR ${["I","II","III"][i]}`}</div>
            <h3 style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:18, color:"var(--holy-ivory)", margin:"8px 0 14px"}}>{t}</h3>
            {feats.map((f,j)=>(
              <div key={j} style={{display:"flex", gap:8, padding:"6px 0", fontFamily:"var(--font-body)", fontSize:12.5, color:"#B8B2A6", lineHeight:1.4}}>
                <span style={{color:"var(--holy-gold)"}}>▸</span><span>{f}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </GLSection>
  );
}

Object.assign(window, { Arrow, Box, PCover, POverview, PIA, PNavModel, POnboarding, PDaily, PPillars });
