// proto-screens.jsx — Quests home + Status Window
const { useState: useSS, useEffect: useSE } = React;

function Countdown() {
  const [t, setT] = useSS("");
  useSE(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now); end.setHours(24, 0, 0, 0);
      const d = Math.max(0, end - now);
      const h = String(Math.floor(d / 3.6e6)).padStart(2, "0");
      const m = String(Math.floor((d % 3.6e6) / 6e4)).padStart(2, "0");
      const sec = String(Math.floor((d % 6e4) / 1000)).padStart(2, "0");
      setT(`${h}:${m}:${sec}`);
    };
    tick(); const i = setInterval(tick, 1000); return () => clearInterval(i);
  }, []);
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--holy-gold)", letterSpacing: "0.04em" }}>{t}</span>;
}

function QuestCard({ q, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", cursor: "pointer",
      background: q.done ? "rgba(201,169,97,0.08)" : "rgba(232,226,213,0.03)",
      border: "1px solid rgba(201,169,97,0.25)", padding: "15px 15px", marginBottom: 10,
    }}>
      <div style={{
        width: 24, height: 24, flexShrink: 0, display: "grid", placeItems: "center",
        border: `1.5px solid ${q.done ? "var(--holy-gold)" : "rgba(232,226,213,0.4)"}`, background: q.done ? "var(--holy-gold)" : "transparent",
      }}>
        {q.done && <svg width="13" height="10" viewBox="0 0 13 10"><polyline points="1,5 5,9 12,1" stroke="#0A0A0A" strokeWidth="2.2" fill="none" /></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--holy-gold)", letterSpacing: "0.18em" }}>{q.pillar.toUpperCase()}</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 17, color: "var(--holy-ivory)", margin: "2px 0", textDecoration: q.done ? "line-through" : "none", textDecorationColor: "rgba(201,169,97,0.6)" }}>{q.title}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A" }}>{q.sub}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)" }}>+{q.stat}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6E6A60", marginTop: 2 }}>{q.xp} XP</div>
      </div>
    </button>
  );
}

function QuestsScreen({ s, level, rankName, nextRank, rankProgress, allDone, go }) {
  return (
    <Screen>
      <ScreenTop kicker="[ DAILY QUEST ISSUED ]" title="Dawn"
        right={<Seal size={42} id="q-seal" />} />
      <HomeSummary s={s} level={level} rankName={rankName} go={go} />

      <div style={{ marginBottom: 14 }}>
        <SystemLine>{SYSTEM.dawn(s.cls, nextRank)}</SystemLine>
      </div>

      {/* streak + countdown */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, background: "linear-gradient(180deg, rgba(201,169,97,0.16), rgba(201,169,97,0.04))", border: "1px solid rgba(201,169,97,0.4)", padding: "12px 14px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.18em" }}>STREAK</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            <svg width="18" height="22" viewBox="0 0 22 26"><path d="M11 1 C13 6 18 9 18 15 C18 20 15 24 11 24 C7 24 4 20 4 15 C4 12 7 11 7 8 C9 9 11 7 11 1Z" fill="#C9A961" /></svg>
            <span style={{ fontFamily: "'Pirata One', serif", fontSize: 26, color: "var(--holy-ivory)" }}>Day {s.streak}</span>
          </div>
        </div>
        <div style={{ flex: 1, background: "rgba(20,20,26,0.6)", border: "1px solid rgba(232,226,213,0.16)", padding: "12px 14px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.18em" }}>RESETS IN</div>
          <div style={{ marginTop: 5 }}><Countdown /></div>
        </div>
      </div>

      {/* quests */}
      {s.quests.map(q => <QuestCard key={q.id} q={q} onClick={() => go(q.tab)} />)}

      {/* daily seal / rank progress */}
      {allDone ? (
        <div style={{ marginTop: 6 }}>
          <SystemLine>{SYSTEM.allDone}</SystemLine>
          <div style={{ textAlign: "center", padding: "22px 0 6px" }}>
            <Seal size={84} id="q-seal-done" />
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "var(--holy-gold)", letterSpacing: "0.22em", marginTop: 10 }}>DAY {s.streak} SEALED</div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 6, background: "rgba(20,20,26,0.6)", border: "1px solid rgba(201,169,97,0.3)", padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.2em" }}>TO {nextRank.toUpperCase()}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)" }}>{Math.round(rankProgress * 100)}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.35)", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: `${rankProgress * 100}%`, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)", transition: "width 0.7s" }} />
          </div>
        </div>
      )}
    </Screen>
  );
}

function StatusScreen({ s, rankName, nextRank, rankProgress, actions }) {
  const cls = CLASSES[s.cls];
  return (
    <Screen>
      <ScreenTop kicker="[ STATUS ]" title={s.name || "Hannes"} right={<span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--holy-gold)" }}>LV.{s.level}</span>} />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <Chip on>{s.cls.toUpperCase()}</Chip>
        <Chip>RANK ▸ {rankName.toUpperCase()}</Chip>
      </div>

      {/* identity card */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", border: "1px solid rgba(201,169,97,0.25)", background: "#0E0E12", padding: "16px", marginBottom: 16 }}>
        <Seal size={66} id="st-seal" />
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>{s.cls}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A", marginTop: 3, lineHeight: 1.45 }}>{cls.tag}. {cls.blurb}</div>
        </div>
      </div>

      {/* stats */}
      <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "18px 16px", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 14 }}>ATTRIBUTES</div>
        {STAT_KEYS.map(k => <StatBar key={k} label={`${k} · ${STAT_NAMES[k].toUpperCase()}`} value={s.stats[k]} />)}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed rgba(201,169,97,0.2)", textAlign: "center", fontFamily: "var(--font-scripture)", fontStyle: "italic", fontSize: 15, color: "#CFC9BD" }}>
          “Iron sharpens iron.”
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "#7A746A", fontStyle: "normal", marginTop: 4 }}>PROV. 27:17</div>
        </div>
      </div>

      {/* rank progress */}
      <div style={{ border: "1px solid rgba(201,169,97,0.3)", background: "rgba(20,20,26,0.6)", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.2em" }}>NEXT RANK</span>
          <span style={{ fontFamily: "'Pirata One', serif", fontSize: 20, color: "var(--holy-gold)" }}>{nextRank}</span>
        </div>
        <div style={{ height: 8, background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.35)", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, width: `${rankProgress * 100}%`, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "#9A948A" }}>
          <span style={{ color: "var(--holy-ivory)" }}>{s.xp.toLocaleString()} XP</span>
          <span>Level {s.level}</span>
        </div>
      </div>
      {/* demo controls */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <GhostBtn onClick={() => actions.resetDay()}>↻ Reset Day</GhostBtn>
        <GhostBtn onClick={() => actions.rankUp()}>⤴ Advance Rank</GhostBtn>
      </div>
      <div style={{ marginTop: 10 }}>
        <GhostBtn onClick={() => { if (confirm("Restart the Awakening and wipe progress?")) actions.hardReset(); }}>Restart Awakening</GhostBtn>
      </div>
    </Screen>
  );
}

Object.assign(window, { QuestsScreen, StatusScreen, Countdown });
