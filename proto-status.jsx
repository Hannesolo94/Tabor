// proto-status.jsx — Status hub: overview, history calendar, rank ladder, honors, settings, share
// Overrides StatusScreen from proto-screens.jsx (loaded after it).
const { useState: useStaS } = React;

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
function monthCells(offset = 0) {
  const now = new Date(); const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const y = base.getFullYear(), m = base.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(dstr(new Date(y, m, d)));
  return { label: base.toLocaleString("en", { month: "long", year: "numeric" }), cells };
}
const HCOL = { sealed: "#C9A961", frozen: "#6E8AA0", missed: "#7A1F1F" };

function Pill({ on, children, onClick }) {
  return <button onClick={onClick} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: on ? "#0A0A0A" : "#9A948A", background: on ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "8px 12px", whiteSpace: "nowrap" }}>{children}</button>;
}
function Row({ label, children }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--holy-ivory)" }}>{label}</span>{children}</div>;
}
function Toggle({ on, onClick }) {
  return <button onClick={onClick} style={{ width: 46, height: 26, borderRadius: 14, border: "none", cursor: "pointer", background: on ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "rgba(255,255,255,0.14)", position: "relative", transition: "background .2s" }}><span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#0A0A0A", transition: "left .2s" }} /></button>;
}

function StatusScreen({ s, actions, level, rankIdx, rankName, nextRank, rankProgress }) {
  const [view, setView] = useStaS("overview");
  const [menuOpen, setMenuOpen] = useStaS(false);
  const [share, setShare] = useStaS(false);
  const [mOff, setMOff] = useStaS(0);
  const cls = CLASSES[s.cls];

  return (
    <Screen>
      <ScreenTop kicker="[ STATUS ]" title={s.name || "Hannes"} right={<span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--holy-gold)" }}>LV.{level}</span>} />
      <div style={{ position: "relative", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--holy-gold)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{({ overview: "Overview", history: "History", ranks: "Ranks", honors: "Honors", inbox: "Inbox", notes: "Notes", system: "The System", settings: "Settings", support: "Support", delete: "Delete Data" })[view]}</span>
          <button onClick={() => setMenuOpen(o => !o)} style={{ background: "rgba(201,169,97,0.08)", border: "1px solid rgba(201,169,97,0.35)", cursor: "pointer", padding: "9px 11px", display: "flex", flexDirection: "column", gap: 3 }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 18, height: 2, background: "var(--holy-gold)" }} />)}
          </button>
        </div>
        {menuOpen && (
          <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, zIndex: 30, minWidth: 172, background: "#15151A", border: "1px solid rgba(201,169,97,0.4)", boxShadow: "0 14px 30px rgba(0,0,0,0.6)" }}>
            {[["overview", "Overview"], ["inbox", "Inbox"], ["history", "History"], ["ranks", "Ranks"], ["honors", "Honors"], ["notes", "Notes"], ["system", "The System"], ["settings", "Settings"], ["support", "Support"]].map(([id, l]) => (
              <button key={id} onClick={() => { setView(id); setMenuOpen(false); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", cursor: "pointer", background: view === id ? "rgba(201,169,97,0.12)" : "transparent", border: "none", borderBottom: "1px solid rgba(201,169,97,0.1)", padding: "13px 16px", fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 14, color: view === id ? "var(--holy-gold)" : "var(--holy-ivory)" }}>{l}{view === id && <span style={{ color: "var(--holy-gold)" }}>✓</span>}</button>
            ))}
          </div>
        )}
      </div>

      {view === "overview" && <>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}><Chip on>{s.cls.toUpperCase()}</Chip><Chip>RANK ▸ {rankName.toUpperCase()}</Chip></div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", border: "1px solid rgba(201,169,97,0.25)", background: "#0E0E12", padding: "16px", marginBottom: 14 }}>
          {s.avatar ? <div style={{ width: 66, height: 66, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(201,169,97,0.5)", flexShrink: 0 }}><img src={s.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div> : <Seal size={66} id="st-seal" />}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>{s.cls}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A", marginTop: 3, lineHeight: 1.45 }}>{cls.tag}. {cls.blurb}</div>
          </div>
        </div>
        {/* streak + freeze */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: "linear-gradient(180deg, rgba(201,169,97,0.16), rgba(201,169,97,0.04))", border: "1px solid rgba(201,169,97,0.4)", padding: "12px 14px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.16em" }}>STREAK</div>
            <div style={{ fontFamily: "'Pirata One', serif", fontSize: 26, color: "var(--holy-ivory)", marginTop: 2 }}>Day {s.streak}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7A746A", marginTop: 2 }}>BEST {s.bestStreak}</div>
          </div>
          <div style={{ flex: 1, background: "rgba(20,20,26,0.6)", border: "1px solid rgba(110,138,160,0.4)", padding: "12px 14px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.16em" }}>FREEZES</div>
            <div style={{ fontFamily: "'Pirata One', serif", fontSize: 26, color: "#9FB8C9", marginTop: 2 }}>{s.freezes}</div>
            <button onClick={() => actions.useFreeze()} disabled={s.freezes <= 0} style={{ marginTop: 4, background: "none", border: "none", cursor: s.freezes > 0 ? "pointer" : "default", color: s.freezes > 0 ? "#9FB8C9" : "#4A4A4A", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", padding: 0 }}>USE TODAY ›</button>
          </div>
        </div>
        {/* stats */}
        <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "18px 16px", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 14 }}>ATTRIBUTES</div>
          {STAT_KEYS.map(k => <StatBar key={k} label={`${k} · ${STAT_NAMES[k].toUpperCase()}`} value={s.stats[k]} max={6500} />)}
        </div>
        {/* rank progress */}
        <div style={{ border: "1px solid rgba(201,169,97,0.3)", background: "rgba(20,20,26,0.6)", padding: "16px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.2em" }}>NEXT RANK</span>
            <span style={{ fontFamily: "'Pirata One', serif", fontSize: 20, color: "var(--holy-gold)" }}>{nextRank}</span>
          </div>
          <div style={{ height: 8, background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.35)", position: "relative" }}><div style={{ position: "absolute", inset: 0, width: `${rankProgress * 100}%`, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)" }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "#9A948A" }}><span style={{ color: "var(--holy-ivory)" }}>{s.xp.toLocaleString()} XP</span><span>Level {level}</span></div>
        </div>
        <GoldBtn onClick={() => setShare(true)}>Share Status Card</GoldBtn>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <GhostBtn onClick={() => actions.resetDay()}>↻ Reset Day</GhostBtn>
          <GhostBtn onClick={() => actions.rankUp()}>⤴ Advance Rank</GhostBtn>
        </div>
      </>}

      {view === "history" && <HistoryView s={s} mOff={mOff} setMOff={setMOff} />}
      {view === "ranks" && <RankLadder level={level} rankIdx={rankIdx} />}
      {view === "honors" && <Honors s={s} />}
      {view === "settings" && <Settings s={s} actions={actions} setView={setView} />}
      {view === "support" && <SupportView />}
      {view === "inbox" && <InboxView s={s} actions={actions} />}
      {view === "notes" && <NotesView s={s} actions={actions} />}
      {view === "system" && <SystemChat s={s} rankName={rankName} level={level} />}
      {view === "delete" && <DeleteData actions={actions} onCancel={() => setView("settings")} />}

      {share && <ShareCard s={s} level={level} rankName={rankName} onClose={() => setShare(false)} />}
    </Screen>
  );
}

function HistoryView({ s, mOff, setMOff }) {
  const { label, cells } = monthCells(mOff);
  const t = todayStr();
  const sealedCount = Object.values(s.history).filter(v => v === "sealed").length;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={() => setMOff(mOff - 1)} style={{ background: "none", border: "none", color: "var(--holy-gold)", fontSize: 18, cursor: "pointer" }}>‹</button>
        <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)", letterSpacing: "0.06em" }}>{label}</span>
        <button onClick={() => setMOff(Math.min(0, mOff + 1))} style={{ background: "none", border: "none", color: mOff < 0 ? "var(--holy-gold)" : "#3A3A3A", fontSize: 18, cursor: "pointer" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 16 }}>
        {DOW.map((d, i) => <div key={i} style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9, color: "#6E6A60" }}>{d}</div>)}
        {cells.map((c, i) => {
          const st = c && s.history[c]; const isToday = c === t;
          return <div key={i} style={{ aspectRatio: "1", display: "grid", placeItems: "center", borderRadius: 6, border: isToday ? "1px solid var(--holy-gold)" : "1px solid rgba(255,255,255,0.04)", background: st ? `${HCOL[st]}${st === "sealed" ? "" : "55"}` : (c ? "rgba(255,255,255,0.02)" : "transparent") }}>
            {c && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: st === "sealed" ? "#0A0A0A" : (st ? "#E8E2D5" : "#5A554C") }}>{+c.slice(8)}</span>}
          </div>;
        })}
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        {[["Sealed", "sealed"], ["Frozen", "frozen"], ["Missed", "missed"]].map(([l, k]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: HCOL[k], borderRadius: 2 }} /><span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.08em" }}>{l.toUpperCase()}</span></div>)}
      </div>
      <div style={{ border: "1px solid rgba(201,169,97,0.25)", background: "#0E0E12", padding: "14px 16px", textAlign: "center" }}>
        <span style={{ fontFamily: "'Pirata One', serif", fontSize: 28, color: "var(--holy-gold)" }}>{sealedCount}</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#9A948A", marginLeft: 8 }}>days sealed all-time</span>
      </div>
    </div>
  );
}

function RankLadder({ level, rankIdx }) {
  return (
    <div>
      {RANKS.map((r, i) => {
        const reached = i <= rankIdx; const current = i === rankIdx;
        return (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 14, border: `1px solid ${current ? "rgba(201,169,97,0.6)" : "rgba(201,169,97,0.16)"}`, background: current ? "rgba(201,169,97,0.1)" : "#0E0E12", padding: "14px 16px", marginBottom: 8, opacity: reached ? 1 : 0.5 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: reached ? "var(--holy-gold)" : "#6E6A60", width: 24 }}>{String(i + 1).padStart(2, "0")}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Pirata One', serif", fontSize: 22, color: reached ? "var(--holy-ivory)" : "#7A746A" }}>{r}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7A746A", letterSpacing: "0.1em" }}>FROM LEVEL {RANK_LEVELS[i]}</div>
            </div>
            {current && <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#0A0A0A", background: "var(--holy-gold)", padding: "3px 7px", letterSpacing: "0.1em" }}>YOU</span>}
            {reached && !current && <span style={{ color: "var(--holy-gold)" }}>✓</span>}
          </div>
        );
      })}
    </div>
  );
}

function Honors({ s }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {ACHIEVEMENTS.map(a => {
        const on = s.achievements.includes(a.id);
        return (
          <div key={a.id} style={{ border: `1px solid ${on ? "rgba(201,169,97,0.4)" : "rgba(255,255,255,0.06)"}`, background: on ? "rgba(201,169,97,0.07)" : "#0C0C10", padding: "16px 14px", textAlign: "center", opacity: on ? 1 : 0.55 }}>
            <div style={{ fontSize: 24, color: on ? "var(--holy-gold)" : "#4A4A4A" }}>{a.icon}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: on ? "var(--holy-ivory)" : "#6E6A60", marginTop: 8 }}>{a.name}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#7A746A", marginTop: 4, lineHeight: 1.4 }}>{a.desc}</div>
            {!on && <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#5A554C", letterSpacing: "0.14em", marginTop: 8 }}>LOCKED</div>}
          </div>
        );
      })}
    </div>
  );
}

function Settings({ s, actions, setView }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 6 }}>PROFILE</div>
      <AvatarPick s={s} actions={actions} />
      <input value={s.name} onChange={e => actions.updateProfile({ name: e.target.value })} placeholder="Name" style={{ width: "100%", boxSizing: "border-box", background: "rgba(232,226,213,0.04)", border: "1px solid rgba(201,169,97,0.3)", color: "var(--holy-ivory)", fontFamily: "'Pirata One', serif", fontSize: 22, padding: "12px 14px", outline: "none", marginBottom: 12 }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.16em", marginBottom: 8 }}>TRADITION</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {["Orthodox", "Catholic", "Protestant", "Other"].map(d => <Pill key={d} on={s.denomination === d} onClick={() => actions.updateProfile({ denomination: d })}>{d}</Pill>)}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "8px 0 2px" }}>NOTIFICATIONS</div>
      {[["rank", "Rank-ups"], ["nudge", "Accountability nudges"], ["quest", "Daily quest issued"], ["streak", "Streak warnings"], ["quiet", "Quiet hours (9pm to 6am)"]].map(([k, l]) => <Row key={k} label={l}><Toggle on={s.notifPrefs[k]} onClick={() => actions.setNotifPref(k, !s.notifPrefs[k])} /></Row>)}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "18px 0 2px" }}>APP</div>
      <Row label="Reduced motion"><Toggle on={s.settings.reducedMotion} onClick={() => actions.setSetting("reducedMotion", !s.settings.reducedMotion)} /></Row>
      <Row label="Sound"><Toggle on={s.settings.sound} onClick={() => actions.setSetting("sound", !s.settings.sound)} /></Row>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "18px 0 2px" }}>ASSISTANT</div>
      <Row label="Let the System track my progress"><Toggle on={s.aiOptIn} onClick={() => actions.setAiOptIn(!s.aiOptIn)} /></Row>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "18px 0 8px" }}>PRIVACY</div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#7A746A", lineHeight: 1.5, margin: "0 0 10px" }}>We store only what the app needs to function. No selling, no sharing, ever.</p>
      <button onClick={() => setView("delete")} style={{ width: "100%", fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E08585", background: "transparent", border: "1px solid rgba(122,31,31,0.5)", padding: "13px", cursor: "pointer", marginBottom: 10 }}>Delete My Data</button>
      <GhostBtn onClick={() => { if (confirm("Wipe all progress and restart the Awakening?")) actions.hardReset(); }}>Restart Awakening</GhostBtn>
    </div>
  );
}

function SupportView() {
  const [open, setOpen] = useStaS(-1);
  const FAQ = [
    ["Is Tabor really free?", "Free for life. No brother is priced out of his own becoming."],
    ["How do streaks and freezes work?", "Seal all three quests to hold your streak. Freezes protect a missed day automatically, or spend one yourself."],
    ["How is my class chosen?", "From your Awakening answers. Your focus can shift as you grow."],
    ["How do I change my guild?", "Open Guild settings to switch guilds or forge a new one anytime."],
    ["How do I delete my data?", "Settings includes an instant wipe. Your data is yours, always."],
  ];
  const Btn2 = ({ icon, label, sub, onClick }) => (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", cursor: "pointer", background: "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.22)", padding: "15px 16px", marginBottom: 10 }}>
      <span style={{ fontSize: 18, color: "var(--holy-gold)", width: 22, textAlign: "center" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A" }}>{sub}</div>
      </div>
      <span style={{ color: "var(--holy-gold)" }}>›</span>
    </button>
  );
  return (
    <div>
      <div style={{ marginBottom: 14 }}><SystemLine>The order stands with you. Reach us anytime, {""}brother.</SystemLine></div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>CONTACT</div>
      <Btn2 icon="✉" label="Email support" sub="support@taborbrotherhood.com" onClick={() => { window.location.href = "mailto:support@taborbrotherhood.com"; }} />
      <Btn2 icon="◇" label="Message the team" sub="In-app chat, replies within a day" onClick={() => {}} />
      <Btn2 icon="⚠" label="Report a problem" sub="Bugs, abuse, or anything broken" onClick={() => {}} />

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "20px 0 10px" }}>HELP</div>
      {FAQ.map(([q, a], i) => (
        <div key={i} style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", marginBottom: 8 }}>
          <button onClick={() => setOpen(open === i ? -1 : i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", cursor: "pointer", background: "none", border: "none", padding: "14px 16px" }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5, color: "var(--holy-ivory)" }}>{q}</span>
            <span style={{ color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 14 }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#9A948A", lineHeight: 1.5, margin: 0, padding: "0 16px 14px" }}>{a}</p>}
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 20 }}>
        <a href="#" onClick={e => e.preventDefault()} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.12em", textDecoration: "none" }}>PRIVACY</a>
        <a href="#" onClick={e => e.preventDefault()} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.12em", textDecoration: "none" }}>TERMS</a>
      </div>
      <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9, color: "#6E6A60", letterSpacing: "0.14em", marginTop: 12 }}>TABOR · v0.1 PROTOTYPE</div>
    </div>
  );
}

function ShareCard({ s, level, rankName, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.8)", display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 320, background: "radial-gradient(ellipse 90% 70% at 50% 0%, #1a1812, #0A0A0A 72%)", border: "1px solid rgba(201,169,97,0.5)", padding: "28px 22px", textAlign: "center" }}>
        <Seal size={92} id="share-seal" />
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 38, color: "var(--holy-ivory)", marginTop: 8 }}>{s.name || "Hannes"}</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.2em", color: "var(--holy-gold)", marginTop: 4 }}>{rankName.toUpperCase()} · LEVEL {level}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, alignItems: "center", margin: "14px 0" }}>
          <svg width="16" height="20" viewBox="0 0 22 26"><path d="M11 1 C13 6 18 9 18 15 C18 20 15 24 11 24 C7 24 4 20 4 15 C4 12 7 11 7 8 C9 9 11 7 11 1Z" fill="#C9A961" /></svg>
          <span style={{ fontFamily: "'Pirata One', serif", fontSize: 22, color: "var(--holy-gold)" }}>Day {s.streak}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid rgba(201,169,97,0.2)", borderBottom: "1px solid rgba(201,169,97,0.2)", padding: "12px 0", margin: "8px 0" }}>
          {STAT_KEYS.map(k => <div key={k}><div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A" }}>{k}</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--holy-ivory)", marginTop: 2 }}>{(s.stats[k] / 1000).toFixed(1)}k</div></div>)}
        </div>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 10, letterSpacing: "0.3em", color: "var(--holy-gold)", marginTop: 8 }}>SONS OF FIRE</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <GhostBtn onClick={onClose}>Close</GhostBtn>
          <GoldBtn onClick={onClose}>Share ↗</GoldBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StatusScreen });
