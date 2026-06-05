// proto-guild.jsx — Brotherhood: channels/DMs/chat + reactions, roster/roles, leaderboard, giveaways
const { useState: useGS, useEffect: useGE, useRef: useGR } = React;
const CLASS_COLOR = { Crusader: "#C9A961", Scribe: "#9FB8C9", Sentinel: "#C9A961", Pilgrim: "#A88BC9", System: "#C03A3A" };

const CHANNELS = [
  { id: "dawn-watch", name: "dawn-watch", topic: "General guild chat", locked: false, unread: 3 },
  { id: "iron-logs", name: "iron-logs", topic: "Post your training", locked: false, unread: 0 },
  { id: "accountability", name: "accountability", topic: "Daily check-ins · private", locked: true, unread: 0 },
  { id: "prayer-requests", name: "prayer-requests", topic: "Lift each other up", locked: false, unread: 1 },
];
const DMS = [
  { id: "marcus", name: "Marcus", cls: "Crusader", presence: "online", last: "We lift Saturday?", unread: 2 },
  { id: "elias", name: "Elias", cls: "Scribe", presence: "idle", last: "Reading Romans tonight.", unread: 0 },
  { id: "tomas", name: "Tomas", cls: "Sentinel", presence: "online", last: "47 days. You in tomorrow?", unread: 0 },
  { id: "tempered", name: "The Tempered", cls: "System", presence: "group", last: "4 brothers · group", group: true, unread: 5 },
];
const MEMBERS = [
  ["Tomas", "Sentinel", "Warlord", "Forged", 63, "online"],
  ["Marcus", "Crusader", "Officer", "Forged", 51, "online"],
  ["Elias", "Scribe", "Officer", "Tempered", 40, "idle"],
  ["Hannes", "Sentinel", "Brother", "Tempered", 47, "online"],
  ["Silas", "Crusader", "Brother", "Tempered", 29, "online"],
  ["Caleb", "Pilgrim", "Brother", "Initiate", 12, "offline"],
  ["Andrew", "Scribe", "Brother", "Tempered", 22, "idle"],
  ["Jonah", "Scribe", "Recruit", "Recruit", 4, "idle"],
  ["Levi", "Crusader", "Recruit", "Recruit", 7, "offline"],
];
const ROLE_COLOR = { Warlord: "#E6C878", Officer: "#C9A961", Brother: "#9A948A", Recruit: "#6E6A60" };
const SEED = {
  "dawn-watch": [["Tomas", "Sentinel", "Dawn, brothers. Who is climbing today?", "6:02"], ["Marcus", "Crusader", "Scouted the chapter before work. Hard day ahead.", "6:14"], ["System", "System", "Hannes attained the rank of Forged.", "6:20"]],
  "iron-logs": [["Marcus", "Crusader", "Forge routine done. Pull-ups still humbling me.", "5:50"], ["Elias", "Scribe", "20 min Tabata. Legs gone. Worth it.", "6:31"]],
  "accountability": [["Tomas", "Sentinel", "Honest line: almost skipped today. Showed up anyway.", "6:40"]],
  "prayer-requests": [["Elias", "Scribe", "Pray for my father's surgery Thursday.", "5:31"], ["Marcus", "Crusader", "Praying, brother. He is held.", "5:44"]],
  "marcus": [["Marcus", "Crusader", "Forged. Respect, brother.", "6:21"], ["Marcus", "Crusader", "We lift Saturday?", "6:22"]],
  "elias": [["Elias", "Scribe", "Reading Romans tonight. Join me?", "9:10"]],
  "tomas": [["Tomas", "Sentinel", "47 days. You in tomorrow?", "8:02"]],
  "tempered": [["Tomas", "Sentinel", "Group check: all three quests today?", "7:30"], ["Marcus", "Crusader", "Done.", "7:33"]],
};
function Presence({ p }) { const c = p === "online" ? "#5BA86B" : p === "idle" ? "#C9A961" : "#5A554C"; if (p === "group") return <span style={{ fontSize: 11, color: "#9A948A" }}>◇</span>; return <span style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block", border: "2px solid #0A0A0A" }} />; }
function Avatar({ name, cls, size = 38 }) { return <div style={{ width: size, height: size, flexShrink: 0, borderRadius: "32%", background: "rgba(201,169,97,0.12)", border: `1px solid ${CLASS_COLOR[cls] || "#C9A961"}55`, display: "grid", placeItems: "center", fontFamily: "'Pirata One', serif", fontSize: size * 0.45, color: CLASS_COLOR[cls] || "#C9A961" }}>{name[0]}</div>; }
function Badge({ n }) { return n > 0 ? <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: "var(--holy-gold)", color: "#0A0A0A", fontFamily: "var(--font-mono)", fontSize: 10, display: "grid", placeItems: "center", fontWeight: 600 }}>{n}</span> : null; }

function GuildScreen({ s, actions, go }) {
  const q = s.quests.find(x => x.id === "line");
  const [section, setSection] = useGS("channels");
  const [open, setOpen] = useGS(null);
  const [profile, setProfile] = useGS(null);
  const [msgs, setMsgs] = useGS(() => JSON.parse(JSON.stringify(SEED)));

  if (open) return <Chat s={s} actions={actions} target={open} msgs={msgs} setMsgs={setMsgs} onBack={() => setOpen(null)} questDone={q.done} />;
  if (profile) return <MemberProfile m={profile} onBack={() => setProfile(null)} onMessage={() => { setProfile(null); setOpen({ kind: "dm", id: profile[0].toLowerCase(), name: profile[0], cls: profile[1] }); }} />;

  return (
    <Screen>
      <ScreenTop kicker="[ BROTHERHOOD ]" title="Guild" right={<Seal size={40} id="gd-seal" />} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(201,169,97,0.3)", background: "linear-gradient(180deg, rgba(201,169,97,0.1), rgba(201,169,97,0.02))", padding: "13px 15px", marginBottom: 16 }}>
        <div><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--holy-ivory)" }}>Sons of Tabor · IV</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.1em", marginTop: 2 }}>9 BROTHERS · 4 ONLINE</div></div>
        <Seal size={34} id="gd-banner" />
      </div>
      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        {[["channels", "Channels"], ["roster", "Roster"], ["ranks", "Ranks"], ["giveaway", "Giveaway"]].map(([id, l]) => <button key={id} onClick={() => setSection(id)} style={{ flex: 1, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: section === id ? "#0A0A0A" : "#9A948A", background: section === id ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "9px 0" }}>{l}</button>)}
      </div>

      {section === "channels" && <>
        {!q.done && <div style={{ marginBottom: 16 }}><SystemLine>Hold the line. Post your honest word in <span style={{ color: "var(--holy-gold)" }}>#accountability</span>.</SystemLine></div>}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>TEXT CHANNELS</div>
        {CHANNELS.map(ch => (
          <button key={ch.id} onClick={() => setOpen({ kind: "channel", id: ch.id, name: ch.name })} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", cursor: "pointer", background: ch.id === "accountability" && !q.done ? "rgba(201,169,97,0.07)" : "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "12px 4px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "#6E6A60" }}>{ch.locked ? "🔒" : "#"}</span>
            <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14.5, color: "var(--holy-ivory)" }}>{ch.name}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#7A746A" }}>{ch.topic}</div></div>
            {ch.id === "accountability" && !q.done ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#0A0A0A", background: "var(--holy-gold)", padding: "3px 6px", letterSpacing: "0.1em" }}>QUEST</span> : <Badge n={ch.unread} />}
          </button>
        ))}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "22px 0 10px" }}>DIRECT MESSAGES</div>
        {DMS.map(dm => (
          <button key={dm.id} onClick={() => setOpen({ kind: "dm", id: dm.id, name: dm.name, cls: dm.cls })} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", cursor: "pointer", background: "transparent", border: "none", padding: "10px 4px" }}>
            <div style={{ position: "relative" }}><Avatar name={dm.name} cls={dm.cls} /><span style={{ position: "absolute", bottom: -2, right: -2 }}><Presence p={dm.presence} /></span></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>{dm.name}</span>{dm.group && <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--holy-gold)", letterSpacing: "0.1em", border: "1px solid rgba(201,169,97,0.35)", padding: "1px 5px" }}>GROUP</span>}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "#7A746A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dm.last}</div></div>
            <Badge n={dm.unread} />
          </button>
        ))}
        <button onClick={() => {}} style={{ width: "100%", marginTop: 16, cursor: "pointer", fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--holy-gold)", background: "transparent", border: "1px dashed rgba(201,169,97,0.5)", padding: "13px" }}>＋ Forge or Invite to a Guild</button>
      </>}

      {section === "roster" && <Roster onOpen={setProfile} />}
      {section === "ranks" && <Leaderboard />}
      {section === "giveaway" && <Giveaway />}
    </Screen>
  );
}

function Roster({ onOpen }) {
  const groups = ["Warlord", "Officer", "Brother", "Recruit"];
  return (
    <div>
      {groups.map(role => {
        const list = MEMBERS.filter(m => m[2] === role);
        if (!list.length) return null;
        return (
          <div key={role} style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: ROLE_COLOR[role], letterSpacing: "0.2em", marginBottom: 8 }}>{role.toUpperCase()} · {list.length}</div>
            {list.map(m => (
              <button key={m[0]} onClick={() => onOpen(m)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", cursor: "pointer", background: "transparent", border: "none", padding: "9px 4px" }}>
                <div style={{ position: "relative" }}><Avatar name={m[0]} cls={m[1]} size={36} /><span style={{ position: "absolute", bottom: -2, right: -2 }}><Presence p={m[5]} /></span></div>
                <div style={{ flex: 1 }}><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>{m[0]}{m[0] === "Hannes" && <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--holy-gold)", marginLeft: 8 }}>YOU</span>}</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7A746A", letterSpacing: "0.06em" }}>{m[1].toUpperCase()} · {m[3]}</div></div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--holy-gold)" }}>🔥{m[4]}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function MemberProfile({ m, onBack, onMessage }) {
  const [name, cls, role, rank, streak] = m;
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: 14 }}>← ROSTER</button>
      <div style={{ textAlign: "center", padding: "10px 0 18px" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Avatar name={name} cls={cls} size={84} /></div>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 34, color: "var(--holy-ivory)", marginTop: 10 }}>{name}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}><Chip on>{cls.toUpperCase()}</Chip><Chip>{role.toUpperCase()}</Chip></div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[["RANK", rank], ["STREAK", `🔥 ${streak}`], ["CLASS", cls]].map(([l, v]) => <div key={l} style={{ flex: 1, border: "1px solid rgba(201,169,97,0.22)", background: "#0E0E12", padding: "12px", textAlign: "center" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#9A948A", letterSpacing: "0.16em" }}>{l}</div><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-gold)", marginTop: 4 }}>{v}</div></div>)}
      </div>
      <GoldBtn onClick={onMessage}>Message {name}</GoldBtn>
    </div>
  );
}

function Leaderboard() {
  const sorted = [...MEMBERS].sort((a, b) => b[4] - a[4]);
  const medal = ["①", "②", "③"];
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 12 }}>STREAK LEADERS · THIS SEASON</div>
      {sorted.map((m, i) => (
        <div key={m[0]} style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${i < 3 ? "rgba(201,169,97,0.4)" : "rgba(201,169,97,0.16)"}`, background: m[0] === "Hannes" ? "rgba(201,169,97,0.1)" : "#0E0E12", padding: "12px 14px", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: i < 3 ? 18 : 12, color: i < 3 ? "var(--holy-gold)" : "#6E6A60", width: 24 }}>{i < 3 ? medal[i] : i + 1}</span>
          <Avatar name={m[0]} cls={m[1]} size={32} />
          <div style={{ flex: 1 }}><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>{m[0]}</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7A746A" }}>{m[3]}</div></div>
          <span style={{ fontFamily: "'Pirata One', serif", fontSize: 20, color: "var(--holy-gold)" }}>🔥{m[4]}</span>
        </div>
      ))}
    </div>
  );
}

function Giveaway() {
  const [voted, setVoted] = useGS(null);
  const nominees = [["Tomas", "Sentinel", 63, 14], ["Marcus", "Crusader", 51, 11], ["Hannes", "Sentinel", 47, 9], ["Silas", "Crusader", 29, 5]];
  return (
    <div>
      <div style={{ border: "1px solid rgba(201,169,97,0.4)", background: "linear-gradient(180deg, rgba(201,169,97,0.12), rgba(201,169,97,0.02))", padding: "18px 16px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em" }}>THIS MONTH'S GIVEAWAY</div>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 28, color: "var(--holy-ivory)", margin: "6px 0 4px" }}>Ascent Hoodie</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#9A948A", lineHeight: 1.5 }}>Voted by the brotherhood. Awarded to the most consistent, hardest-working man this month.</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.14em", marginTop: 10 }}>VOTING CLOSES IN 6 DAYS</div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>NOMINEES · CAST ONE VOTE</div>
      {nominees.map(([n, cls, streak, votes]) => {
        const isVoted = voted === n; const total = votes + (isVoted ? 1 : 0);
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, border: `1px solid ${isVoted ? "rgba(201,169,97,0.6)" : "rgba(201,169,97,0.2)"}`, background: isVoted ? "rgba(201,169,97,0.1)" : "#0E0E12", padding: "12px 14px", marginBottom: 8 }}>
            <Avatar name={n} cls={cls} size={36} />
            <div style={{ flex: 1 }}><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>{n}</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7A746A" }}>🔥 {streak} days · {total} votes</div></div>
            <button onClick={() => setVoted(voted === n ? null : n)} disabled={voted && voted !== n} style={{ cursor: voted && voted !== n ? "default" : "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: isVoted ? "#0A0A0A" : (voted ? "#4A4A4A" : "var(--holy-gold)"), background: isVoted ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "9px 13px" }}>{isVoted ? "VOTED" : "VOTE"}</button>
          </div>
        );
      })}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6E6A60", letterSpacing: "0.1em", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>NOMINEES ARE THE MONTH'S TOP-CONSISTENCY BROTHERS.<br />ONE MAN, ONE VOTE. FREE GEAR FOR THE FAITHFUL.</div>
    </div>
  );
}

const REACTS = ["⚡", "✝", "🔥"];
function Chat({ s, actions, target, msgs, setMsgs, onBack, questDone }) {
  const [text, setText] = useGS("");
  const [reacts, setReacts] = useGS({});
  const scroller = useGR(null);
  const list = msgs[target.id] || [];
  const isAccount = target.kind === "channel" && target.id === "accountability";
  useGE(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [list.length]);
  const send = () => { if (!text.trim()) return; const now = new Date(); const tm = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`; setMsgs(m => ({ ...m, [target.id]: [...(m[target.id] || []), [s.name || "Hannes", s.cls, text.trim(), tm, true]] })); if (isAccount && !questDone) { actions.setGuildLine(text.trim()); actions.completeQuest("line"); } setText(""); };
  const react = (i, r) => setReacts(p => { const k = `${i}-${r}`; const cur = p[k] || 0; return { ...p, [k]: cur ? 0 : 1 }; });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0A0A0A" }}>
      <div style={{ paddingTop: 56, paddingBottom: 12, paddingLeft: 16, paddingRight: 16, borderBottom: "1px solid rgba(201,169,97,0.2)", display: "flex", alignItems: "center", gap: 12, background: "#0E0E12" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--holy-gold)", fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1 }}>‹</button>
        {target.kind === "channel" ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "#6E6A60" }}>{target.id === "accountability" ? "🔒" : "#"}</span> : <Avatar name={target.name} cls={target.cls} size={30} />}
        <div style={{ flex: 1 }}><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>{target.name}</div>{target.kind === "channel" && <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "#7A746A" }}>{CHANNELS.find(c => c.id === target.id)?.topic}</div>}</div>
      </div>
      <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px" }}>
        {list.map((m, i) => {
          const [n, c, body, tm, mine] = m;
          if (c === "System") return <div key={i} style={{ textAlign: "center", margin: "10px 0" }}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.1em", background: "rgba(201,169,97,0.08)", border: "1px solid rgba(201,169,97,0.25)", padding: "5px 10px" }}>⚡ {body}</span></div>;
          return (
            <div key={i} style={{ display: "flex", gap: 11, marginBottom: 14 }}>
              <Avatar name={n} cls={c} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13.5, color: mine ? "var(--holy-gold)" : (CLASS_COLOR[c] || "var(--holy-ivory)") }}>{n}</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#5A554C" }}>{tm}</span></div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#CFC9BD", lineHeight: 1.45, marginTop: 2 }}>{body}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  {REACTS.map(r => { const on = reacts[`${i}-${r}`]; return <button key={r} onClick={() => react(i, r)} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, color: on ? "var(--holy-gold)" : "#6E6A60", background: on ? "rgba(201,169,97,0.12)" : "transparent", border: `1px solid ${on ? "rgba(201,169,97,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "2px 8px" }}>{r}{on ? " 1" : ""}</button>; })}
                </div>
              </div>
            </div>
          );
        })}
        {isAccount && questDone && <div style={{ textAlign: "center", margin: "8px 0" }}><span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#5BA86B", letterSpacing: "0.12em" }}>✓ HELD THE LINE TODAY</span></div>}
      </div>
      <div style={{ padding: "10px 12px 86px", borderTop: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12", display: "flex", gap: 8, alignItems: "center" }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder={isAccount ? "Your honest line..." : `Message ${target.name}`} style={{ flex: 1, background: "rgba(232,226,213,0.05)", border: "1px solid rgba(201,169,97,0.3)", color: "var(--holy-ivory)", fontFamily: "var(--font-body)", fontSize: 14, padding: "12px 14px", outline: "none", borderRadius: 22 }} />
        <button onClick={send} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: "50%", border: "none", background: text.trim() ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "rgba(201,169,97,0.2)", color: "#0A0A0A", cursor: "pointer", fontSize: 18 }}>➤</button>
      </div>
    </div>
  );
}

Object.assign(window, { GuildScreen });
