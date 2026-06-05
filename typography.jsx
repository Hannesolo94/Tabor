// typography.jsx — 5 type roles with example text in context
// Each role gets its own card showing the role label + sample.

function TypeRow({ role, family, weight, size, sample, color = "var(--holy-ivory)", monoMeta }) {
  return (
    <div style={{
      padding:"22px 26px",
      background:"linear-gradient(180deg, rgba(20,20,26,0.5), rgba(20,20,26,0.1))",
      border:"1px solid rgba(201,169,97,0.18)",
      display:"flex", flexDirection:"column", gap:14, position:"relative",
    }}>
      {/* meta row */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <div className="holy-system" style={{color:"var(--holy-gold)"}}>{`[ ${role} ]`}</div>
        <div style={{
          fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.16em",
          color:"var(--holy-ivory-muted)", textTransform:"uppercase",
        }}>{monoMeta}</div>
      </div>
      {/* sample */}
      <div style={{fontFamily:family, fontWeight:weight, fontSize:size, color, lineHeight: typeof size === "number" && size > 50 ? 0.95 : 1.25}}>
        {sample}
      </div>
    </div>
  );
}

function TypographyHierarchy() {
  return (
    <div style={{
      width:"100%", padding:"36px 40px 40px",
      background:"#0A0A0A", color:"var(--holy-ivory)",
      display:"flex", flexDirection:"column", gap:14,
      position:"relative", overflow:"hidden",
    }}>
      {/* faint gold haze */}
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,169,97,0.08), transparent 70%)", pointerEvents:"none"}}/>

      {/* header */}
      <div style={{textAlign:"left", marginBottom:8, position:"relative"}}>
        <div className="holy-system" style={{color:"var(--holy-gold)"}}>[ TYPE.SYSTEM ]</div>
        <h1 className="holy-display" style={{margin:"6px 0 0", fontSize:48, letterSpacing:"-0.005em"}}>
          THE FIVE VOICES.
        </h1>
        <div style={{
          fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-ivory-muted)",
          letterSpacing:"0.22em", marginTop:6,
        }}>DISPLAY  ·  BODY  ·  SCRIPTURE  ·  SYSTEM  ·  SACRED</div>
        <div style={{height:1, background:"linear-gradient(90deg, var(--holy-gold), transparent)", marginTop:10}}/>
      </div>

      <TypeRow
        role="DISPLAY · CEREMONIAL"
        family="var(--font-display)"
        weight={900}
        size={92}
        monoMeta="BIG SHOULDERS DISPLAY · 900 · ALL CAPS"
        sample={<span>SONS OF FIRE<span style={{color:"var(--holy-gold)"}}>.</span></span>}
      />

      <TypeRow
        role="BODY · MODERN"
        family="var(--font-body)"
        weight={400}
        size={16}
        color="var(--holy-ivory)"
        monoMeta="INTER · 400/500 · 16PX"
        sample={
          <span style={{maxWidth:680, display:"block", lineHeight:1.55}}>
            HOLY is a free-for-life brotherhood for Christian men who game. A daily system of
            scripture, fitness and accountability. Three quests a day. One guild at your back.
            <span style={{color:"var(--holy-ivory-muted)"}}> No tiers. No paywalls. No softness.</span>
          </span>
        }
      />

      <TypeRow
        role="SCRIPTURE · LITURGICAL"
        family="var(--font-scripture)"
        weight={500}
        size={32}
        monoMeta="CORMORANT GARAMOND · 500 ITALIC · DROP CAP"
        sample={
          <div style={{display:"flex", alignItems:"flex-start", gap:18}}>
            <span style={{
              fontFamily:"var(--font-scripture)", fontSize:84, lineHeight:0.85,
              color:"var(--holy-gold)", fontWeight:600,
              filter:"drop-shadow(0 1px 0 rgba(0,0,0,0.4))",
            }}>“</span>
            <div>
              <em style={{fontStyle:"italic", color:"var(--holy-ivory)"}}>
                Iron sharpens iron, and one man sharpens another.
              </em>
              <div style={{
                fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.2em",
                color:"var(--holy-ivory-muted)", marginTop:8, textTransform:"uppercase",
              }}>—  PROVERBS 27 : 17</div>
            </div>
          </div>
        }
      />

      <TypeRow
        role="SYSTEM · DIEGETIC HUD"
        family="var(--font-mono)"
        weight={500}
        size={22}
        color="var(--holy-gold)"
        monoMeta="JETBRAINS MONO · 500/600 · BRACKETED"
        sample={
          <div style={{display:"flex", gap:24, flexWrap:"wrap", alignItems:"baseline"}}>
            <span style={{letterSpacing:"0.06em"}}>STR <span style={{color:"var(--holy-ivory)"}}>4,820</span></span>
            <span style={{color:"var(--holy-ivory-muted)"}}>/</span>
            <span style={{letterSpacing:"0.06em"}}>AGI <span style={{color:"var(--holy-ivory)"}}>3,110</span></span>
            <span style={{color:"var(--holy-ivory-muted)"}}>/</span>
            <span style={{letterSpacing:"0.06em"}}>WIS <span style={{color:"var(--holy-ivory)"}}>4,160</span></span>
            <span style={{
              marginLeft:"auto", fontSize:10, color:"var(--holy-ivory-muted)",
              letterSpacing:"0.22em",
            }}>[ QUEST COMPLETE ]</span>
          </div>
        }
      />

      <TypeRow
        role="SACRED · INSCRIPTION"
        family="var(--font-roman)"
        weight={600}
        size={42}
        color="var(--holy-gold)"
        monoMeta="CINZEL · 600 · LATIN/GREEK · SPARING"
        sample={
          <div style={{display:"flex", alignItems:"center", gap:24, flexWrap:"wrap"}}>
            <span style={{letterSpacing:"0.32em"}}>THEOSIS</span>
            <span style={{color:"var(--holy-ivory-muted)", fontSize:18}}>·</span>
            <span style={{letterSpacing:"0.32em"}}>TABOR</span>
            <span style={{color:"var(--holy-ivory-muted)", fontSize:18}}>·</span>
            <span style={{fontFamily:"var(--font-blackletter)", fontSize:48, color:"var(--holy-ivory)", letterSpacing:"0.06em"}}>
              Sanctus
            </span>
          </div>
        }
      />

      <div style={{textAlign:"center", marginTop:6}}>
        <div className="holy-system" style={{color:"var(--holy-ivory-muted)", letterSpacing:"0.32em"}}>
          ◇   FIVE  VOICES.  ONE  ORDER.   ◇
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TypographyHierarchy, TypeRow });
