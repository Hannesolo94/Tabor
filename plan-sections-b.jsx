// plan-sections-b.jsx — TABOR app blueprint (part B: progression, System, flows, MVP, inventory)

// ── 07 PROGRESSION ──
function PProgression() {
  const stats = [["STR","Strength","Workouts, lifting, intensity"],["AGI","Agility","Steps, cardio, consistency"],["WIS","Wisdom","Scripture, quizzes, memory"],["MANA","Spirit","Check-ins, prayer, brotherhood"]];
  const ranks = ["Recruit","Initiate","Tempered","Forged","Crucible","Ascended","Supersonic Fit"];
  const classes = [["Sentinel","The guardian. Balanced, steady, holds the line."],["Scribe","The student. Leans Wisdom and the Word."],["Crusader","The fighter. Leans Strength and the iron."],["Pilgrim","The seeker. New to the climb, guided gently."]];
  return (
    <GLSection n="07" kicker="System" title="Progression">
      <Body>Four stats, seven ranks, four classes. Every action feeds a number, and numbers compound into identity. Progression is earned through consistency, never bought.</Body>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"20px"}}>
          <GLLabel color="var(--holy-gold)">Stats</GLLabel>
          <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:10}}>
            {stats.map(([k,n,src],i)=>(
              <div key={i} style={{display:"grid", gridTemplateColumns:"60px 1fr", gap:12, alignItems:"baseline"}}>
                <span style={{fontFamily:"var(--font-mono)", fontSize:13, color:"var(--holy-gold)", letterSpacing:"0.08em"}}>{k}</span>
                <span style={{fontFamily:"var(--font-body)", fontSize:12.5, color:"#B8B2A6"}}><strong style={{color:"var(--holy-ivory)"}}>{n}.</strong> {src}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"20px"}}>
          <GLLabel color="var(--holy-gold)">Classes</GLLabel>
          <div style={{marginTop:12, display:"flex", flexDirection:"column", gap:10}}>
            {classes.map(([n,d],i)=>(
              <div key={i}>
                <span style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:14, color:"var(--holy-ivory)", letterSpacing:"0.04em"}}>{n}.</span>
                <span style={{fontFamily:"var(--font-body)", fontSize:12.5, color:"#9A948A", marginLeft:8}}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"20px", marginTop:14}}>
        <GLLabel color="var(--holy-gold)">Rank ascent</GLLabel>
        <div style={{display:"flex", flexWrap:"wrap", alignItems:"center", gap:6, marginTop:12, fontFamily:"var(--font-mono)", fontSize:13, color:"#B8B2A6", letterSpacing:"0.04em"}}>
          {ranks.map((r,i)=>(<span key={i}>{r}{i<ranks.length-1 && <span style={{color:"var(--holy-gold)"}}> → </span>}</span>))}
        </div>
        <div style={{fontFamily:"var(--font-body)", fontSize:12, color:"#7A746A", marginTop:10}}>Each rank-up is a full-screen ceremony with the gold reveal. Levels and XP sit beneath ranks for granular daily feedback.</div>
      </div>
    </GLSection>
  );
}

// ── 08 THE SYSTEM ──
function PSystem() {
  const rules = [
    ["Issues, never asks", "It declares the day and names the quest. It does not beg for engagement."],
    ["Terse and ceremonial", "Short bracketed lines. No filler, no emoji, no hype."],
    ["Present at thresholds", "It speaks at sunrise, at completion, at rank-up, and when a streak is at risk."],
    ["Knows the man", "It references your class, rank, streak, and guild by name."],
  ];
  return (
    <GLSection n="08" kicker="Voice" title="The System (AI Guide)">
      <Body>The connective tissue. A presence that addresses the user like the System from the games they grew up on: commanding, sacred, brotherly. It turns a checklist into a calling.</Body>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {rules.map(([t,d],i)=>(
            <div key={i} style={{border:"1px solid rgba(201,169,97,0.2)", background:"#0E0E12", padding:"14px 18px"}}>
              <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:14, color:"var(--holy-ivory)"}}>{t}</div>
              <div style={{fontFamily:"var(--font-body)", fontSize:12.5, color:"#9A948A", marginTop:4, lineHeight:1.45}}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{border:"1px solid rgba(201,169,97,0.3)", background:"rgba(20,22,30,0.7)", padding:"22px", boxShadow:"inset 0 0 28px rgba(201,169,97,0.08)"}}>
          <div style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.22em"}}>[ THE SYSTEM ]</div>
          <div style={{fontFamily:"var(--font-mono)", fontSize:13.5, color:"#B8B2A6", lineHeight:1.9, marginTop:14}}>
            <div><span style={{color:"var(--holy-gold)"}}>▸</span> Dawn, Sentinel. Three trials stand between you and Forged.</div>
            <div><span style={{color:"var(--holy-gold)"}}>▸</span> The chapter awaits. Scout it.</div>
            <div><span style={{color:"var(--holy-gold)"}}>▸</span> Iron logged. The body is tempered.</div>
            <div><span style={{color:"var(--holy-crimson-glow)"}}>▸</span> Your streak stands at 47. Do not let it fall tonight.</div>
          </div>
        </div>
      </div>
    </GLSection>
  );
}

// ── 09 KEY FLOWS ──
function PFlows() {
  const flows = [
    ["Daily quest", ["Open app", "System summon", "Daily Quests", "Tap a quest", "Complete action", "Reward + stat gain", "Return to panel"]],
    ["Rank-up", ["Final XP earned", "Threshold crossed", "Screen darkens", "Seal ignites", "Rank revealed", "New rank on Status"]],
    ["Guild check-in", ["Open Guild", "See brothers' day", "Post one honest line", "Brothers react", "+MANA, streak held"]],
    ["Streak at risk", ["Evening, quest unmet", "System warns (crimson)", "One-tap shortcut to easiest quest", "Save the streak"]],
  ];
  return (
    <GLSection n="09" kicker="Flow" title="Key Flows">
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        {flows.map(([name, steps],i)=>(
          <div key={i}>
            <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:15, color:"var(--holy-gold)", letterSpacing:"0.04em", marginBottom:8}}>{name}</div>
            <div style={{display:"flex", flexWrap:"wrap", alignItems:"center", gap:6}}>
              {steps.map((s,j)=>(
                <React.Fragment key={j}>
                  <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"#B8B2A6", border:"1px solid rgba(201,169,97,0.3)", background:"#0E0E12", padding:"7px 11px", letterSpacing:"0.03em"}}>{s}</span>
                  {j<steps.length-1 && <span style={{color:"var(--holy-gold)", opacity:0.6}}>→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// ── 10 MVP SCOPE ──
function PScope() {
  const phases = [
    ["Phase 1", "The Climb (MVP)", ["Awakening onboarding", "Daily Quest core loop", "Scripture reader + drill", "Basic fitness logging", "Status Window + stats", "Solo streaks", "The System voice"]],
    ["Phase 2", "The Brotherhood", ["Guilds (forge / join)", "Check-in feed + chat", "Accountability nudges", "Achievements / relics", "Leaderboards", "Rank-up ceremonies"]],
    ["Phase 3", "The Seasons", ["Seasonal campaigns + events", "Boss chapters + iron challenges", "Health / step integrations", "Guided workout player", "Guild-vs-guild standings"]],
  ];
  return (
    <GLSection n="10" kicker="Scope" title="MVP & Phasing">
      <Body>Ship the daily loop first. The loop is the product. Social depth and seasons follow once men are climbing daily.</Body>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14}}>
        {phases.map(([p, name, items],i)=>(
          <div key={i} style={{border:`1px solid ${i===0?"rgba(201,169,97,0.45)":"rgba(201,169,97,0.18)"}`, background:"#0E0E12"}}>
            <div style={{padding:"14px 16px", borderBottom:"1px solid rgba(201,169,97,0.16)", background: i===0?"rgba(201,169,97,0.06)":"transparent"}}>
              <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-gold)", letterSpacing:"0.2em"}}>{p.toUpperCase()}</div>
              <div style={{fontFamily:"'Cinzel', serif", fontWeight:700, fontSize:17, color:"var(--holy-ivory)", marginTop:4}}>{name}</div>
            </div>
            <div style={{padding:"12px 16px"}}>
              {items.map((it,j)=>(
                <div key={j} style={{display:"flex", gap:8, padding:"5px 0", fontFamily:"var(--font-body)", fontSize:12, color:"#B8B2A6", lineHeight:1.4}}>
                  <span style={{color: i===0?"var(--holy-gold)":"#6E6A60"}}>▸</span><span>{it}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GLSection>
  );
}

// ── 11 SCREEN INVENTORY ──
function PInventory() {
  const groups = [
    ["Onboarding", ["Splash", "Manifesto", "The Calling", "Trials / class", "The Oath", "Forge guild", "Rank reveal", "First quest"]],
    ["Quests", ["Daily Quests", "Quest detail", "Quest complete", "Streak view", "System chat"]],
    ["Scripture", ["Reading plan", "Chapter reader", "Quiz / drill", "Verse memory", "Raid results"]],
    ["Body", ["Workout home", "Workout player", "Log activity", "History + PRs"]],
    ["Guild", ["Your guild", "Check-in feed", "Members", "Guild chat", "Find / forge"]],
    ["Status", ["Status Window", "Rank ladder", "Class detail", "Relics", "Settings"]],
    ["Ceremonies", ["Awakening", "Rank-up", "Daily seal", "Streak milestone"]],
  ];
  const total = groups.reduce((a,[,s])=>a+s.length,0);
  return (
    <GLSection n="11" kicker="Build" title="Screen Inventory">
      <Body>Roughly {total} screens across the system. Phase 1 ships the bold-marked core; the rest layer in later phases.</Body>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12}}>
        {groups.map(([g, screens],i)=>(
          <div key={i} style={{border:"1px solid rgba(201,169,97,0.18)", background:"#0E0E12", padding:"14px 16px"}}>
            <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-gold)", letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:8}}>{g}</div>
            {screens.map((s,j)=>(
              <div key={j} style={{fontFamily:"var(--font-body)", fontSize:12, color:"#B8B2A6", padding:"3px 0"}}>{s}</div>
            ))}
          </div>
        ))}
      </div>
    </GLSection>
  );
}

Object.assign(window, { PProgression, PSystem, PFlows, PScope, PInventory });
