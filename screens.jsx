// screens.jsx — Sample app screens: Status Window + Daily Quest Panel
// Both rendered at 390×844 (iPhone portrait). Layers: matte black base,
// gold tactical frame, parchment inset card.

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────

function StatusBar({ time = "9:41", tone = "ivory" }) {
  const color = tone === "ivory" ? "var(--holy-ivory)" : "#0A0A0A";
  return (
    <div style={{
      height:44, display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"0 22px", color, fontFamily:"var(--font-body)", fontWeight:600, fontSize:14,
    }}>
      <span>{time}</span>
      <div style={{display:"flex", gap:6, alignItems:"center"}}>
        <svg width="18" height="11" viewBox="0 0 18 11"><g fill={color}>
          <rect x="0"  y="5"  width="3" height="6"/>
          <rect x="5"  y="3"  width="3" height="8"/>
          <rect x="10" y="1"  width="3" height="10"/>
          <rect x="15" y="0"  width="3" height="11"/>
        </g></svg>
        <svg width="16" height="11" viewBox="0 0 16 11"><path
          d="M8 11C4 7 1 5 0 4 c2-3 6-4 8-4 s6 1 8 4 c-1 1 -4 3 -8 7z" fill={color}/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0" y="0" width="22" height="11" rx="2" fill="none" stroke={color} strokeWidth="1"/><rect x="2" y="2" width="16" height="7" rx="1" fill={color}/><rect x="22" y="3" width="2" height="5" fill={color}/></svg>
      </div>
    </div>
  );
}

// Tactical bracket frame: floats around the entire screen content
function ScreenFrame({ children }) {
  return (
    <div style={{position:"relative", flex:1, padding:"10px"}}>
      <svg style={{position:"absolute", inset:10, pointerEvents:"none", width:"calc(100% - 20px)", height:"calc(100% - 20px)"}}
           viewBox="0 0 100 100" preserveAspectRatio="none">
        <g stroke="rgba(201,169,97,0.55)" strokeWidth="0.4" fill="none" vectorEffect="non-scaling-stroke">
          <path d="M0 8 L0 0 L8 0"/>
          <path d="M100 8 L100 0 L92 0"/>
          <path d="M0 92 L0 100 L8 100"/>
          <path d="M100 92 L100 100 L92 100"/>
          <line x1="46" y1="0" x2="54" y2="0" strokeWidth="0.8"/>
          <line x1="46" y1="100" x2="54" y2="100" strokeWidth="0.8"/>
          <line x1="0" y1="48" x2="0" y2="52" strokeWidth="0.8"/>
          <line x1="100" y1="48" x2="100" y2="52" strokeWidth="0.8"/>
        </g>
      </svg>
      <div style={{position:"relative", width:"100%", height:"100%"}}>{children}</div>
    </div>
  );
}

// Parchment-on-black insert card: parchment with deckled edge mask
function ParchmentCard({ children, style = {} }) {
  return (
    <div className="holy-parchment" style={{
      borderRadius:0,
      boxShadow:"0 0 0 1px rgba(201,169,97,0.35), 0 0 24px rgba(0,0,0,0.6)",
      position:"relative", ...style,
    }}>
      {/* wax seal corner */}
      <svg width="36" height="36" viewBox="0 0 36 36" style={{position:"absolute", top:-12, right:14, zIndex:3}}>
        <defs>
          <radialGradient id="wax" cx="40%" cy="40%" r="60%">
            <stop offset="0%"  stopColor="#A33333"/>
            <stop offset="70%" stopColor="#7A1F1F"/>
            <stop offset="100%" stopColor="#3A0F0F"/>
          </radialGradient>
        </defs>
        <circle cx="18" cy="18" r="14" fill="url(#wax)"/>
        <g stroke="#3A0F0F" strokeWidth="0.5" fill="none" opacity="0.6">
          <circle cx="18" cy="18" r="10"/>
          <line x1="18" y1="10" x2="18" y2="26"/>
          <line x1="13" y1="14" x2="23" y2="22"/>
          <line x1="23" y1="14" x2="13" y2="22"/>
        </g>
      </svg>
      <div style={{position:"relative", zIndex:1}}>{children}</div>
    </div>
  );
}

// Gold stat bar — segmented like a sacred ladder
function StatBar({ label, value, max, color = "#C9A961" }) {
  const pct = Math.min(100, (value/max)*100);
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4}}>
        <span style={{
          fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.18em",
          color:"#5A4A2A", textTransform:"uppercase", fontWeight:600,
        }}>{label}</span>
        <span style={{
          fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:"0.05em",
          color:"#2A1F10", fontWeight:600,
        }}>{value.toLocaleString()}</span>
      </div>
      <div style={{position:"relative", height:10, background:"rgba(42,31,16,0.18)", border:"1px solid rgba(42,31,16,0.35)"}}>
        <div style={{
          position:"absolute", inset:0, width:`${pct}%`,
          background:`linear-gradient(90deg, ${color} 0%, #E6CB85 50%, ${color} 100%)`,
        }}/>
        {/* segments */}
        <div style={{position:"absolute", inset:0, display:"flex"}}>
          {Array.from({length:10}).map((_,i)=> (
            <div key={i} style={{flex:1, borderRight: i<9 ? "1px solid rgba(42,31,16,0.4)" : "none"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 1: STATUS WINDOW
// ─────────────────────────────────────────────────────────────

function StatusWindow() {
  return (
    <div style={{
      width:"100%", height:"100%", background:"#0A0A0A",
      color:"var(--holy-ivory)", display:"flex", flexDirection:"column",
      fontFamily:"var(--font-body)", position:"relative", overflow:"hidden",
    }}>
      {/* faint gold glow vignette */}
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 50% at 50% 30%, rgba(201,169,97,0.12), transparent 70%)", pointerEvents:"none"}}/>
      <StatusBar tone="ivory"/>
      <ScreenFrame>
        <div style={{padding:"8px 16px 16px", height:"100%", display:"flex", flexDirection:"column", gap:14}}>
          {/* Header */}
          <div style={{textAlign:"center", paddingTop:6}}>
            <div className="holy-system" style={{fontSize:11, color:"var(--holy-gold)", letterSpacing:"0.32em"}}>
              [ STATUS ]
            </div>
            <div style={{
              fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)",
              letterSpacing:"0.2em", marginTop:4,
            }}>SYSTEM ◇ AWAKENED</div>
          </div>

          {/* Identity row — gold halo portrait + name */}
          <div style={{display:"flex", alignItems:"center", gap:14, padding:"6px 4px"}}>
            <div style={{position:"relative", width:78, height:78, flex:"0 0 78px"}}>
              <Halo size={78} intensity={1}/>
              <div style={{position:"absolute", inset:8, background:"#1E1E24", border:"1px solid rgba(201,169,97,0.5)", display:"grid", placeItems:"center"}}>
                <div className="holy-roman" style={{fontSize:24, color:"var(--holy-gold)"}}>H</div>
              </div>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:"flex", alignItems:"baseline", gap:8}}>
                <h2 className="holy-display" style={{margin:0, fontSize:32, letterSpacing:"0.02em"}}>HANNES</h2>
                <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--holy-gold)"}}>LV.14</span>
              </div>
              <div style={{display:"flex", gap:6, alignItems:"center", marginTop:4, flexWrap:"wrap"}}>
                <span style={{
                  fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.15em",
                  background:"rgba(201,169,97,0.16)", color:"var(--holy-gold)",
                  border:"1px solid rgba(201,169,97,0.4)", padding:"2px 6px",
                }}>SENTINEL</span>
                <span style={{
                  fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.15em",
                  color:"var(--holy-ivory-muted)", padding:"2px 4px",
                }}>RANK ▸ TEMPERED</span>
              </div>
            </div>
          </div>

          {/* Parchment stat card */}
          <ParchmentCard style={{padding:"22px 18px 18px", flex:"0 0 auto"}}>
            <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:14}}>
              <div className="holy-roman" style={{fontSize:11, color:"#5A4A2A", letterSpacing:"0.32em"}}>
                ATTRIBUTES
              </div>
              <div style={{flex:1, height:1, background:"#5A4A2A", opacity:0.3}}/>
              <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"#5A4A2A", letterSpacing:"0.18em"}}>04 / 04</span>
            </div>
            <StatBar label="STR · STRENGTH" value={4820} max={6000}/>
            <StatBar label="AGI · AGILITY"  value={3110} max={6000}/>
            <StatBar label="WIS · WISDOM"   value={4160} max={6000}/>
            <StatBar label="MANA · SPIRIT"  value={3540} max={6000}/>
            {/* scripture */}
            <div style={{
              marginTop:14, padding:"10px 4px 0",
              borderTop:"1px dashed rgba(42,31,16,0.3)",
              fontFamily:"var(--font-scripture)", fontStyle:"italic",
              fontSize:13, lineHeight:1.4, color:"#3A2A18", textAlign:"center",
            }}>
              “Iron sharpens iron.”
              <div style={{fontFamily:"var(--font-mono)", fontSize:8, marginTop:4, letterSpacing:"0.22em", color:"#5A4A2A", fontStyle:"normal"}}>
                PROV. 27:17
              </div>
            </div>
          </ParchmentCard>

          {/* Rank progress to FORGED */}
          <div style={{
            background:"rgba(20,20,26,0.7)",
            border:"1px solid rgba(201,169,97,0.35)",
            padding:"14px 14px 12px",
            position:"relative",
          }}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8}}>
              <span style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.22em"}}>
                NEXT RANK
              </span>
              <span className="holy-display" style={{fontSize:18, color:"var(--holy-gold)", letterSpacing:"0.12em"}}>FORGED</span>
            </div>
            {/* progress bar */}
            <div style={{position:"relative", height:8, background:"rgba(201,169,97,0.08)", border:"1px solid rgba(201,169,97,0.35)"}}>
              <div style={{
                position:"absolute", inset:0, width:"32.1%",
                background:"linear-gradient(90deg, #8B6B22 0%, #C9A961 50%, #E6CB85 100%)",
              }}/>
              <div style={{position:"absolute", inset:0, display:"flex"}}>
                {Array.from({length:5}).map((_,i)=> (
                  <div key={i} style={{flex:1, borderRight: i<4 ? "1px solid rgba(201,169,97,0.4)" : "none"}}/>
                ))}
              </div>
            </div>
            <div style={{display:"flex", justifyContent:"space-between", marginTop:6}}>
              <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-ivory)", letterSpacing:"0.06em"}}>
                4,820 <span style={{color:"var(--holy-ivory-muted)"}}>/ 15,000</span>
              </span>
              <span style={{fontFamily:"var(--font-mono)", fontSize:10, color:"var(--holy-gold)", letterSpacing:"0.06em"}}>
                +320 today
              </span>
            </div>
          </div>

          {/* footer system tag */}
          <div style={{marginTop:"auto", textAlign:"center"}}>
            <div className="holy-system" style={{fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.32em"}}>
              ◇  SONS  OF  FIRE  ◇
            </div>
          </div>
        </div>
      </ScreenFrame>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN 2: DAILY QUEST PANEL
// ─────────────────────────────────────────────────────────────

function QuestRow({ tag, title, sub, icon, done }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:14,
      padding:"14px 14px",
      background: done ? "rgba(201,169,97,0.08)" : "rgba(232,226,213,0.03)",
      border:"1px solid rgba(201,169,97,0.25)",
      position:"relative",
    }}>
      {/* checkbox marker */}
      <div style={{
        width:22, height:22, flex:"0 0 22px",
        border:`1.5px solid ${done ? "var(--holy-gold)" : "rgba(232,226,213,0.4)"}`,
        background: done ? "var(--holy-gold)" : "transparent",
        display:"grid", placeItems:"center",
      }}>
        {done && <svg width="12" height="9" viewBox="0 0 12 9"><polyline points="1,5 4,8 11,1" stroke="#0A0A0A" strokeWidth="2" fill="none"/></svg>}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:"flex", alignItems:"center", gap:6, marginBottom:2}}>
          <span style={{
            fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.2em",
            color: "var(--holy-gold)",
          }}>{tag}</span>
        </div>
        <h3 className="holy-display" style={{
          margin:0, fontSize:18, color:"var(--holy-ivory)",
          textDecoration: done ? "line-through" : "none",
          textDecorationColor: "rgba(201,169,97,0.6)",
          letterSpacing:"0.02em",
        }}>{title}</h3>
        <div style={{fontFamily:"var(--font-body)", fontSize:11, color:"var(--holy-ivory-muted)", marginTop:2}}>
          {sub}
        </div>
      </div>
      <div style={{
        width:36, height:36, flex:"0 0 36px",
        display:"grid", placeItems:"center",
        color:"var(--holy-gold)",
      }}>{icon}</div>
    </div>
  );
}

function DailyQuestPanel() {
  return (
    <div style={{
      width:"100%", height:"100%", background:"#0A0A0A",
      color:"var(--holy-ivory)", display:"flex", flexDirection:"column",
      fontFamily:"var(--font-body)", position:"relative", overflow:"hidden",
    }}>
      {/* ambient gold glow */}
      <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 40% at 50% 0%, rgba(201,169,97,0.18), transparent 60%)", pointerEvents:"none"}}/>
      <StatusBar tone="ivory"/>
      <ScreenFrame>
        <div style={{padding:"6px 14px 14px", height:"100%", display:"flex", flexDirection:"column", gap:12}}>
          {/* Header — ceremonial reveal */}
          <div style={{textAlign:"center", padding:"4px 0 10px"}}>
            <div className="holy-system" style={{fontSize:11, color:"var(--holy-gold)", letterSpacing:"0.28em"}}>
              [ Daily Quest Issued ]
            </div>
            <h1 className="holy-display" style={{
              margin:"8px 0 0", fontSize:34, color:"var(--holy-ivory)",
              letterSpacing:"0.06em",
            }}>SONS OF FIRE.</h1>
            <div style={{
              fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)",
              letterSpacing:"0.22em", marginTop:6,
            }}>◇ TODAY · 3 QUESTS ◇</div>
          </div>

          {/* Streak + countdown bar */}
          <div style={{
            display:"flex", gap:8,
          }}>
            {/* Streak — Day 47 */}
            <div style={{
              flex:1, background:"linear-gradient(180deg, rgba(201,169,97,0.18), rgba(201,169,97,0.04))",
              border:"1px solid rgba(201,169,97,0.45)",
              padding:"10px 12px", position:"relative",
            }}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                {/* Flame */}
                <svg width="22" height="26" viewBox="0 0 22 26">
                  <path d="M11 1 C13 6 18 9 18 15 C18 20 15 24 11 24 C7 24 4 20 4 15 C4 12 7 11 7 8 C9 9 11 7 11 1Z"
                        fill="#C9A961" stroke="#7A5618" strokeWidth="0.6"/>
                  <path d="M11 8 C12 11 14 13 14 16 C14 19 12 21 11 21 C10 21 8 19 8 16 C8 14 10 13 10 11 C10.5 12 11 11 11 8Z"
                        fill="#F1DDA0"/>
                </svg>
                <div>
                  <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.2em"}}>
                    STREAK
                  </div>
                  <div className="holy-display" style={{fontSize:24, color:"var(--holy-ivory)", lineHeight:1}}>
                    DAY 47
                  </div>
                </div>
              </div>
            </div>
            {/* Countdown */}
            <div style={{
              flex:1, background:"rgba(20,20,26,0.6)",
              border:"1px solid rgba(232,226,213,0.18)",
              padding:"10px 12px",
            }}>
              <div style={{fontFamily:"var(--font-mono)", fontSize:9, color:"var(--holy-ivory-muted)", letterSpacing:"0.2em"}}>
                RESET IN
              </div>
              <div style={{fontFamily:"var(--font-mono)", fontSize:24, color:"var(--holy-gold)", fontWeight:600, letterSpacing:"0.04em", lineHeight:1.1, marginTop:2}}>
                07:24:11
              </div>
            </div>
          </div>

          {/* Quest list */}
          <div style={{display:"flex", flexDirection:"column", gap:8}}>
            <QuestRow
              tag="◇ SCRIPTURE RAID"
              title="SCOUT THE CHAPTER"
              sub="Read John 1:1–14"
              done={true}
              icon={
                <svg width="22" height="22" viewBox="0 0 22 22"><g fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M3 4 H10 V20 H3z"/><path d="M12 4 H19 V20 H12z"/>
                  <line x1="11" y1="2" x2="11" y2="22" strokeWidth="0.8"/>
                </g></svg>
              }
            />
            <QuestRow
              tag="◇ FITNESS GUILD"
              title="IRON BODY"
              sub="7,500 steps OR 20-min workout"
              done={false}
              icon={
                <svg width="24" height="20" viewBox="0 0 24 20"><g fill="none" stroke="currentColor" strokeWidth="1.4">
                  <rect x="0" y="7" width="3" height="6"/>
                  <rect x="3" y="4" width="3" height="12"/>
                  <rect x="6" y="9" width="12" height="2"/>
                  <rect x="18" y="4" width="3" height="12"/>
                  <rect x="21" y="7" width="3" height="6"/>
                </g></svg>
              }
            />
            <QuestRow
              tag="◇ BROTHERHOOD"
              title="HOLD THE LINE"
              sub="Check in with your guild"
              done={false}
              icon={
                <svg width="22" height="22" viewBox="0 0 22 22"><g fill="none" stroke="currentColor" strokeWidth="1.4">
                  <circle cx="7" cy="8" r="3"/>
                  <circle cx="15" cy="8" r="3"/>
                  <path d="M2 18 c0-3 3-5 5-5 s5 2 5 5"/>
                  <path d="M10 18 c0-3 3-5 5-5 s5 2 5 5"/>
                </g></svg>
              }
            />
          </div>

          {/* Footer Greek inscription */}
          <div style={{marginTop:"auto", textAlign:"center", paddingTop:6}}>
            <div className="holy-roman" style={{fontSize:9, color:"var(--holy-gold)", letterSpacing:"0.4em"}}>
              ◇  ΤΑΒΩΡ  ◇
            </div>
          </div>
        </div>
      </ScreenFrame>
    </div>
  );
}

Object.assign(window, { StatusWindow, DailyQuestPanel });
