// roadmap-app.jsx — TABOR next-phase plan (reuses GLSection/Body/GLLabel from gl-logo.jsx)
function List({ items }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
    {items.map(([t, d], i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
      <span style={{ color: "var(--holy-gold)", flexShrink: 0 }}>▸</span>
      <div><span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>{t}{d ? " — " : ""}</span><span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "#9A948A", lineHeight: 1.5 }}>{d}</span></div>
    </div>)}
  </div>;
}
function Cards({ items }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
    {items.map(([t, d], i) => <div key={i} style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "16px 16px" }}>
      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-gold)" }}>{t}</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#9A948A", marginTop: 6, lineHeight: 1.5 }}>{d}</div>
    </div>)}
  </div>;
}

function RoadmapApp() {
  return (
    <div style={{ background: "#0A0A0A" }}>
      <section style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "70px 24px", borderBottom: "1px solid rgba(201,169,97,0.14)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,169,97,0.09), transparent 70%)" }} />
        <div style={{ width: 150, position: "relative" }}><TaborIconSeal id="rm-seal" size={130} /></div>
        <div className="holy-system" style={{ color: "var(--holy-gold)", letterSpacing: "0.3em", marginTop: 22 }}>[ NEXT PHASE · BUILD PLAN ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, color: "var(--holy-ivory)", letterSpacing: "0.1em", margin: "10px 0 0" }}>THE ROAD AHEAD</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#9A948A", maxWidth: 560, marginTop: 12, lineHeight: 1.6, position: "relative" }}>Locked plan for the next build sprint. Prototype polish, apparel and gear, the website, and the production realities. Say go and I execute top to bottom.</p>
      </section>

      <GLSection n="01" kicker="Prototype" title="Polish to Add" first>
        <Body>Five additions that round out the Phase-1 prototype. Build order top to bottom.</Body>
        <List items={[
          ["Home Dashboard", "A landing screen that summarizes all three pillars at a glance: today's quest status, streak + freezes, today's reading and workout, latest guild activity, next prayer. Optional default tab over Quests."],
          ["Notifications Feed", "An in-app inbox: System messages, rank-ups, accountability nudges, guild activity, giveaway updates. Read/unread state, each item deep-links into the right screen."],
          ["Seeker Track", "A real gospel-learning path for those who answered 'not yet, but open'. Short lessons (Who is Jesus, The Gospel, Your First Prayer, Finding a Church, Reading the Bible) with gentle tone and progress. Full faith features grow as they walk."],
          ["Quest Variety + Partial Progress", "Daily quests rotate from a pool instead of repeating. Iron Body shows a live progress bar (steps ticking toward goal) with partial credit, not just done/not-done."],
          ["Profile Avatar", "Photo/avatar upload on Status and the guild roster, so brothers have faces."],
        ]} />
      </GLSection>

      <GLSection n="02" kicker="Merch" title="Apparel & Gear">
        <Body>Direction: sacred-tactical streetwear. Heavyweight, muted, premium restraint. Matte black, bone, Byzantine gold, martyr crimson. Blackletter Tabor wordmark and the mountain seal, used sparingly.</Body>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "8px 0 12px" }}>FIRST DROP</div>
        <Cards items={[
          ["Sons of Fire Tee", "240gsm heavyweight. Wordmark back-print, seal at chest."],
          ["Ascent Hoodie", "Brushed-back fleece, tonal seal embroidery, gold cuff inscription."],
          ["Tempered Crewneck", "Midweight loopback, minimal seal, Sons of Fire at the nape."],
          ["Seal Cap + Beanie", "Structured cap and cuffed beanie, gold-thread seal."],
          ["Training Gear", "Joggers, shaker/bottle, lifting straps, sticker + patch pack."],
          ["Labels & Trims", "Woven neck label, gold-foil hangtag with the creed."],
        ]} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "18px 0 10px" }}>HOW I'LL BUILD IT</div>
        <List items={[
          ["Mockup lookbook", "Garment-template mockups (flat-lay + ghost-mannequin) with the seal and wordmark placed, so you see the line before any sample exists."],
          ["Placement / tech specs", "Print sizes, seal embroidery placement, label positions, colorways per piece."],
          ["Print methods", "Heavyweight screenprint for type, tonal embroidery for the seal, woven labels. Authentic, not fake-distressed."],
          ["Then real shots", "Flat-lay and on-model photography once samples exist, dropped into the store and site."],
        ]} />
      </GLSection>

      <GLSection n="03" kicker="Web" title="The Website">
        <Body>Same brand system, responsive. Purpose: convert curiosity into downloads and brotherhood, and sell the gear.</Body>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "8px 0 12px" }}>PAGES</div>
        <Cards items={[
          ["Home / Landing", "Hero with the emblem and manifesto, the three pillars, an app preview, and a waitlist / download CTA."],
          ["The Climb", "How it works: the daily loop, ranks, the System."],
          ["Brotherhood", "Guilds, accountability, the community and giveaways."],
          ["Store", "The apparel line, connected to checkout."],
          ["The Creed / About", "Mission, the five tenets, who it is for."],
          ["Download", "App store links, final call."],
        ]} />
        <div style={{ marginTop: 14 }}>
          <List items={[
            ["Build order", "Landing page first (hero, pillars, app screens, waitlist), then Store, then the rest."],
            ["Commerce", "Store wired to Shopify or similar; app-store badges for download."],
            ["Reuse", "Brand guidelines, the seal, the prototype screens all feed straight in."],
          ]} />
        </div>
      </GLSection>

      <GLSection n="04" kicker="Production" title="Logistics & Go-to-Production">
        <Body>The real-build realities beyond the prototype. Not design work, but named here so nothing surprises you. I can expand any of these into its own spec.</Body>
        <List items={[
          ["Backend & accounts", "Auth, real persistent data, cross-device sync, the data-delete wired to a real backend."],
          ["Content sources", "A Bible API (full text, translations), a real workout library with form videos, authored reading plans and prayers."],
          ["Push notifications", "Infrastructure and scheduling for dawn quests, streak warnings, rank-ups, nudges."],
          ["The System (AI)", "A real model backend with the voice prompt, plus moderation and safety guardrails."],
          ["Payments & fulfillment", "Shopify / Stripe for the store, inventory, shipping."],
          ["Giveaways (legal)", "Sweepstakes rules vary by region: eligibility, official rules, no-purchase-necessary, record-keeping."],
          ["Community safety", "Moderation tools, reporting, blocking, content policy. Essential for any guild and chat product."],
          ["Legal & privacy", "Privacy policy, terms, GDPR/CCPA, age gating (18+), and honoring the instant data-delete promise."],
          ["Measurement", "Analytics, retention loops, A/B for onboarding and the daily loop."],
          ["Accessibility & i18n", "Contrast and screen-reader audit, reduced-motion (done in prototype), localization later."],
        ]} />
      </GLSection>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 28px 70px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.34em", color: "var(--holy-gold)", textTransform: "uppercase" }}>◇ Say "go" and I start at 01 ◇</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6E6A60", letterSpacing: "0.16em", marginTop: 10 }}>TABOR · BUILD PLAN · SONS OF FIRE</div>
      </section>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<RoadmapApp />);
