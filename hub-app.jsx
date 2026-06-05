// hub-app.jsx — TABOR command hub linking every deliverable
const G = "#C9A961";
const INK = "#E8E2D5";
const MUT = "#8A8378";
const mono = "'JetBrains Mono', monospace";

const SECTIONS = [
  { kicker: "01 · PRODUCT", title: "The App", items: [
    ["TABOR App Prototype.html", "App Prototype", "The full interactive Phase-1 app. Onboarding, daily quests, Word, Body, Guild, Store, Status.", "LIVE · INTERACTIVE"],
    ["TABOR Showcase.html", "Showcase", "Every screen live on one board, each a real interactive instance.", "BOARD"],
    ["TABOR Notifications.html", "Notifications", "iOS + Android lock-screen push mockups that open the app.", "MOCKUP"],
    ["TABOR App Plan.html", "The Campaign Map", "Strategy, IA, navigation, flows, MVP scope.", "PLAN"],
  ] },
  { kicker: "02 · BRAND", title: "Identity System", items: [
    ["TABOR Brand Guidelines.html", "Brand Guidelines", "The Book of Tabor: logo, color, type, voice, motifs, components.", "9 SECTIONS"],
    ["TABOR Brand Kit.html", "Brand Kit", "Downloadable logos (SVG), app icons (PNG), font links.", "DOWNLOADS"],
    ["TABOR Brand Messaging.html", "Brand Messaging", "Positioning, voice, the tenets, what it stands for.", "STRATEGY"],
    ["TABOR Mark.html", "The Mark", "The locked TABOR wordmark, emblem and seal, up close.", "LOGO"],
  ] },
  { kicker: "03 · APPAREL & PRINT", title: "Gear & Graphics", items: [
    ["TABOR Apparel.html", "Apparel Lookbook", "First drop: garments, colorways, placement, print specs.", "LOOKBOOK"],
    ["TABOR Print Concepts.html", "Print Concepts", "Lead six graphic directions blocked out for hand-render.", "6 CONCEPTS"],
    ["TABOR Print Catalogue.html", "Print Catalogue", "50 print directions grouped by theme, with artist briefs.", "50 IDEAS"],
    ["TABOR AI Prompts.html", "AI Prompts", "All 50 concepts as ready-to-paste image prompts.", "50 PROMPTS"],
    ["TABOR Sacred Gamer Prompts.html", "Sacred Gamer", "16 gamer × sacred crossover prompts, brand-safe.", "16 PROMPTS"],
  ] },
  { kicker: "04 · WEB", title: "Storefront", items: [
    ["TABOR Website.html", "The Website", "Commerce-first storefront with persona collections. Printful-ready.", "LIVE SITE"],
  ] },
  { kicker: "05 · PLAN", title: "Roadmap", items: [
    ["TABOR Roadmap.html", "The Road Ahead", "Build plan: polish, apparel, website, production logistics.", "PLAN"],
  ] },
];

function Card({ href, title, desc, tag }) {
  return (
    <a href={encodeURI(href)} style={{ textDecoration: "none", border: "1px solid rgba(201,169,97,0.22)", background: "#0E0E12", padding: "18px 18px", display: "flex", flexDirection: "column", transition: "border-color .15s, transform .15s, background .15s" }}
      onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(201,169,97,0.6)"; e.currentTarget.style.background = "#121218"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(201,169,97,0.22)"; e.currentTarget.style.background = "#0E0E12"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 17, color: INK, letterSpacing: "0.02em" }}>{title}</span>
        <span style={{ color: G, fontFamily: mono, fontSize: 13 }}>↗</span>
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#9A948A", lineHeight: 1.5, margin: "0 0 14px", flex: 1 }}>{desc}</p>
      <span style={{ fontFamily: mono, fontSize: 8, color: G, letterSpacing: "0.16em" }}>{tag}</span>
    </a>
  );
}

function Hub() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 80% 50% at 50% 0%, #16161a, #0a0a0a 58%)", padding: "0 0 80px" }}>
      {/* header */}
      <header style={{ padding: "70px 24px 50px", textAlign: "center", position: "relative", borderBottom: "1px solid rgba(201,169,97,0.16)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 50% 30%, rgba(201,169,97,0.1), transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}><TaborIconSeal id="hub-seal" size={96} /></div>
          <div style={{ fontFamily: "'Pirata One', serif", fontSize: 64, color: G, lineHeight: 0.9 }}>Tabor</div>
          <div style={{ fontFamily: mono, fontSize: 11, color: MUT, letterSpacing: "0.3em", marginTop: 8 }}>SONS OF FIRE · COMMAND HUB</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#9A948A", maxWidth: 540, margin: "16px auto 0", lineHeight: 1.6 }}>Everything built for the TABOR brand and product, in one place. Click any card to open it.</p>
        </div>
      </header>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {SECTIONS.map((s, i) => (
          <section key={i} style={{ marginTop: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: G, letterSpacing: "0.22em" }}>{s.kicker}</span>
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, color: INK, letterSpacing: "0.04em" }}>{s.title}</span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(201,169,97,0.4), transparent)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
              {s.items.map(it => <Card key={it[0]} href={it[0]} title={it[1]} desc={it[2]} tag={it[3]} />)}
            </div>
          </section>
        ))}
        <div style={{ textAlign: "center", marginTop: 56, fontFamily: mono, fontSize: 9, color: "#6E6A60", letterSpacing: "0.16em" }}>◇ FORGED NOT BOUGHT · FREE FOR LIFE ◇</div>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Hub />);
