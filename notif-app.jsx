// notif-app.jsx — TABOR push notification mockups (iOS + Android)
const SYS = '-apple-system, "SF Pro", system-ui, sans-serif';
const ROBOTO = 'Roboto, "Google Sans", system-ui, sans-serif';
const KIND_TAB = { rank: "status", nudge: "guild", quest: "quests", streak: "quests" };
function openApp(tab) { window.location.href = "TABOR App Prototype.html" + (tab ? "#" + tab : ""); }

function AppIcon({ round, size = 38 }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0, borderRadius: round ? "50%" : size * 0.27, background: "#0A0A0A", overflow: "hidden", display: "grid", placeItems: "center", border: "1px solid rgba(201,169,97,0.4)" }}>
      <TaborIconSeal id={`ni-${size}-${round ? "r" : "s"}-${Math.random().toString(36).slice(2, 6)}`} size={size * 0.92} />
    </div>
  );
}

// shared notification content (the System voice)
const NOTIFS = [
  { kind: "rank", title: "Rank Attained", body: "You are Forged. Your guild has been told.", time: "now", urgent: false },
  { kind: "nudge", title: "Hold the Line", body: "Marcus checked in. Your honest line is still owed today.", time: "2m", urgent: false },
  { kind: "quest", title: "Daily Quest Issued", body: "Three trials await, Sentinel. The chapter, the iron, the line.", time: "6:00", urgent: false },
  { kind: "streak", title: "Your streak is at risk", body: "07:24 to reset. Do not let Day 47 fall.", time: "8m", urgent: true },
];

function Wall({ children }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 60% at 50% 22%, #1c1a16, #0A0A0A 70%)" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, display: "grid", placeItems: "center" }}>
        <TaborIconSeal id="wall-seal" size={260} />
      </div>
      {children}
    </div>
  );
}

// ── iOS ──
function IOSNotif({ n }) {
  return (
    <div onClick={() => openApp(KIND_TAB[n.kind])} style={{ borderRadius: 20, overflow: "hidden", position: "relative", marginBottom: 9, cursor: "pointer", background: "rgba(44,44,48,0.62)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", gap: 10, padding: "11px 12px" }}>
        <AppIcon />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: SYS, fontWeight: 600, fontSize: 14, color: "#fff" }}>{n.title}</span>
            <span style={{ fontFamily: SYS, fontSize: 11, color: "rgba(235,235,245,0.6)" }}>{n.time}</span>
          </div>
          <div style={{ fontFamily: SYS, fontSize: 13.5, color: "rgba(235,235,245,0.85)", lineHeight: 1.32, marginTop: 1 }}>{n.body}</div>
        </div>
      </div>
    </div>
  );
}

function IPhone() {
  return (
    <div style={{ width: 300, height: 620, borderRadius: 46, overflow: "hidden", position: "relative", boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.4)" }}>
      <Wall>
        {/* dynamic island */}
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 100, height: 30, borderRadius: 20, background: "#000", zIndex: 5 }} />
        {/* status */}
        <div style={{ position: "absolute", top: 16, left: 22, right: 22, display: "flex", justifyContent: "space-between", fontFamily: SYS, fontSize: 13, fontWeight: 600, color: "#fff" }}>
          <span>9:41</span><span>tabor</span>
        </div>
        {/* clock */}
        <div style={{ textAlign: "center", paddingTop: 64 }}>
          <div style={{ fontFamily: SYS, fontWeight: 600, fontSize: 15, color: "rgba(255,255,255,0.85)" }}>Tuesday, June 4</div>
          <div style={{ fontFamily: SYS, fontWeight: 300, fontSize: 76, color: "#fff", lineHeight: 1, marginTop: 2 }}>9:41</div>
        </div>
        {/* notifications */}
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 24 }}>
          {NOTIFS.map((n, i) => <IOSNotif key={i} n={n} />)}
        </div>
      </Wall>
    </div>
  );
}

// ── ANDROID ──
function AndroidNotif({ n, actions }) {
  return (
    <div onClick={() => openApp(KIND_TAB[n.kind])} style={{ borderRadius: 26, cursor: "pointer", background: n.urgent ? "rgba(48,28,28,0.92)" : "rgba(30,29,33,0.92)", marginBottom: 9, padding: "13px 15px", border: n.urgent ? "1px solid rgba(192,58,58,0.4)" : "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <AppIcon round size={20} />
        <span style={{ fontFamily: ROBOTO, fontSize: 12, color: n.urgent ? "#E08585" : "rgba(201,169,97,0.9)", fontWeight: 500 }}>Tabor</span>
        <span style={{ fontFamily: ROBOTO, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>· {n.time}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>⌄</span>
      </div>
      <div style={{ fontFamily: ROBOTO, fontWeight: 500, fontSize: 14.5, color: "#fff" }}>{n.title}</div>
      <div style={{ fontFamily: ROBOTO, fontSize: 13.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.35, marginTop: 2 }}>{n.body}</div>
      {actions && (
        <div style={{ display: "flex", gap: 18, marginTop: 12 }}>
          {actions.map((a, i) => <span key={i} style={{ fontFamily: ROBOTO, fontWeight: 600, fontSize: 13, color: n.urgent ? "#E08585" : "#D8B86E", textTransform: "uppercase", letterSpacing: "0.04em" }}>{a}</span>)}
        </div>
      )}
    </div>
  );
}

function AndroidPhone() {
  return (
    <div style={{ width: 300, height: 620, borderRadius: 38, overflow: "hidden", position: "relative", boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.4)" }}>
      <Wall>
        {/* status bar */}
        <div style={{ position: "absolute", top: 10, left: 20, right: 20, display: "flex", justifyContent: "space-between", fontFamily: ROBOTO, fontSize: 12.5, color: "#fff" }}>
          <span>9:41</span>
          <span style={{ display: "flex", gap: 6, fontSize: 11 }}><span>▦</span><span>▼</span><span>100%</span></span>
        </div>
        {/* clock */}
        <div style={{ textAlign: "center", paddingTop: 48 }}>
          <div style={{ fontFamily: ROBOTO, fontWeight: 300, fontSize: 60, color: "#fff", lineHeight: 1 }}>9:41</div>
          <div style={{ fontFamily: ROBOTO, fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>Tue, Jun 4</div>
        </div>
        {/* notifications */}
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 22 }}>
          <AndroidNotif n={NOTIFS[0]} actions={["View Rank", "Thank guild"]} />
          <AndroidNotif n={NOTIFS[3]} actions={["Open quest", "Snooze"]} />
          <AndroidNotif n={NOTIFS[1]} actions={["Reply", "Check in"]} />
        </div>
      </Wall>
    </div>
  );
}

function NotifApp() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 80% 60% at 50% 0%, #16161a, #0a0a0a 70%)", padding: "44px 20px 70px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto 34px", textAlign: "center" }}>
        <div className="holy-system" style={{ color: "var(--holy-gold)", letterSpacing: "0.26em" }}>[ PUSH NOTIFICATIONS ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, color: "var(--holy-ivory)", margin: "8px 0 0", letterSpacing: "0.06em" }}>THE SYSTEM CALLS</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#9A948A", maxWidth: 520, margin: "10px auto 0", lineHeight: 1.55 }}>How TABOR reaches a man on his lock screen. The same commanding voice, native to each platform. Rank-ups, accountability nudges, daily quests, and streak warnings.</p>
      </div>
      <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <IPhone />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.2em", marginTop: 16 }}>iOS · LOCK SCREEN</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <AndroidPhone />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.2em", marginTop: 16 }}>ANDROID · LOCK SCREEN</div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<NotifApp />);
