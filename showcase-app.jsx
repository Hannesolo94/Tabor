// showcase-app.jsx — TABOR: every screen on one board, each a LIVE interactive app
const { useState: useShS } = React;

// rich seed for the "in app" frames (independent in-memory state per frame)
const seedRich = {
  onboarded: true, name: "Hannes", cls: "Sentinel", denomination: "Orthodox",
  rankIdx: 3, level: 17, xp: 5170, stats: { STR: 5200, AGI: 3400, WIS: 4600, MANA: 3900 },
  streak: 47, quests: DEFAULT_QUESTS.map((q, i) => ({ ...q, done: i === 1 })), guildLine: "",
};
const noop = () => {};

// Scales any child that already includes its own device (App renders IOSDevice)
function AppFrame({ label, children, scale = 0.58 }) {
  const W = 402, H = 874;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: W * scale, height: H * scale, overflow: "hidden", borderRadius: 48 * scale }}>
        <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.18em", marginTop: 12, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// Wraps non-app content (notifications) in a device shell
function DeviceFrame({ label, children, scale = 0.58 }) {
  const W = 402, H = 874;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: W * scale, height: H * scale, overflow: "hidden", borderRadius: 48 * scale }}>
        <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <IOSDevice dark><div style={{ height: "100%", position: "relative" }}>{children}</div></IOSDevice>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.18em", marginTop: 12, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// interactive lock-screen notifications (tap a card to open the live prototype)
function MiniNotifs({ android }) {
  const N = [
    ["rank", "Rank Attained", "You are Forged. Your guild has been told.", false, "status"],
    ["nudge", "Hold the Line", "Marcus checked in. Your line is still owed today.", false, "guild"],
    ["streak", "Your streak is at risk", "07:24 to reset. Do not let Day 47 fall.", true, "quests"],
  ];
  const sys = '-apple-system, system-ui, sans-serif';
  const open = (t) => { window.location.href = "TABOR App Prototype.html#" + t; };
  return (
    <div style={{ height: "100%", background: "radial-gradient(ellipse 90% 60% at 50% 22%, #1c1a16, #0A0A0A 70%)", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, display: "grid", placeItems: "center" }}><TaborIconSeal id={android ? "mn-a" : "mn-i"} size={250} /></div>
      <div style={{ textAlign: "center", paddingTop: 86, position: "relative" }}>
        <div style={{ fontFamily: sys, fontWeight: 300, fontSize: 72, color: "#fff" }}>9:41</div>
        <div style={{ fontFamily: sys, fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Tuesday, June 4</div>
      </div>
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 36 }}>
        {N.map(([kind, t, b, urgent, tab], i) => (
          <div key={i} onClick={() => open(tab)} style={{ cursor: "pointer", borderRadius: android ? 26 : 20, marginBottom: 11, padding: "14px 15px", background: android ? (urgent ? "rgba(48,28,28,0.92)" : "rgba(30,29,33,0.92)") : "rgba(44,44,48,0.62)", backdropFilter: android ? "none" : "blur(18px)", border: urgent ? "1px solid rgba(192,58,58,0.4)" : "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: android ? "50%" : 6, background: "#0A0A0A", border: "1px solid rgba(201,169,97,0.4)", display: "grid", placeItems: "center", overflow: "hidden" }}><TaborIconSeal id={`mni-${android ? "a" : "i"}-${i}`} size={22} /></div>
              <span style={{ fontFamily: sys, fontSize: 13, color: urgent ? "#E08585" : "rgba(201,169,97,0.9)", fontWeight: 500 }}>Tabor</span>
              <span style={{ fontFamily: sys, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>· now</span>
              <span style={{ marginLeft: "auto", fontFamily: sys, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>tap to open ›</span>
            </div>
            <div style={{ fontFamily: sys, fontWeight: 600, fontSize: 15, color: "#fff" }}>{t}</div>
            <div style={{ fontFamily: sys, fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.32, marginTop: 1 }}>{b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <div style={{ marginBottom: 54 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, color: "var(--holy-ivory)", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{title}</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(201,169,97,0.5), transparent)" }} />
        </div>
        {sub && <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#9A948A", marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 36, justifyContent: "center", maxWidth: 1320, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

function Showcase() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 90% 50% at 50% 0%, #17171c, #0a0a0a 60%)", padding: "48px 20px 90px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div className="holy-system" style={{ color: "var(--holy-gold)", letterSpacing: "0.3em" }}>[ THE FULL SYSTEM · LIVE ]</div>
        <h1 style={{ fontFamily: "'Pirata One', serif", fontSize: 56, color: "var(--holy-gold)", margin: "10px 0 0" }}>Tabor</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#9A948A", maxWidth: 600, margin: "10px auto 0", lineHeight: 1.55 }}>Every screen of the Phase 1 prototype on one board. Each phone is a real, independent, fully interactive instance. Tap, navigate, complete quests, build a Tabata, chat, shop. The notification cards open the live app.</p>
      </div>

      <Section title="The Awakening" sub="A fresh, interactive onboarding. Click through it.">
        <AppFrame label="Onboarding · live"><App persist={false} /></AppFrame>
      </Section>

      <Section title="The App" sub="Six live instances, each on a different tab. All fully interactive.">
        <AppFrame label="Quests · home"><App persist={false} initialTab="quests" seed={seedRich} /></AppFrame>
        <AppFrame label="The Word"><App persist={false} initialTab="scripture" seed={seedRich} /></AppFrame>
        <AppFrame label="Body · Iron"><App persist={false} initialTab="body" seed={seedRich} /></AppFrame>
        <AppFrame label="Guild"><App persist={false} initialTab="guild" seed={seedRich} /></AppFrame>
        <AppFrame label="Store"><App persist={false} initialTab="store" seed={seedRich} /></AppFrame>
        <AppFrame label="Status · advance rank"><App persist={false} initialTab="status" seed={seedRich} /></AppFrame>
      </Section>

      <Section title="The System Calls" sub="Lock-screen pushes. Tap any card to open the live app to that screen.">
        <DeviceFrame label="iOS · lock screen"><MiniNotifs /></DeviceFrame>
        <DeviceFrame label="Android · lock screen"><MiniNotifs android /></DeviceFrame>
      </Section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Showcase />);
