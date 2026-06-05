// site-app.jsx — TABOR storefront (apparel-first, persona collections, Printful-ready)
const { useState: useWS } = React;

function Nav({ onBag, bagCount }) {
  const [open, setOpen] = useWS(false);
  const links = [["Shop", "shop"], ["Collections", "collections"], ["The App", "app"], ["The Creed", "creed"]];
  const go = (id) => { setOpen(false); const el = document.getElementById(id); if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: "smooth" }); };
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,169,97,0.2)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <TaborIconSeal id="nav-seal" size={28} /><span style={{ fontFamily: "'Pirata One', serif", fontSize: 23, color: GOLD }}>Tabor</span>
        </button>
        <div className="nav-links" style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {links.map(([l, id]) => <button key={id} onClick={() => go(id)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: "#B8B2A6", textTransform: "uppercase" }}>{l}</button>)}
          <button onClick={onBag} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: GOLD, background: "transparent", border: `1px solid ${GOLD}88`, padding: "8px 14px", cursor: "pointer", textTransform: "uppercase" }}>Bag{bagCount ? ` · ${bagCount}` : ""}</button>
        </div>
        <button className="nav-burger" onClick={() => setOpen(o => !o)} style={{ display: "none", flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer" }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 22, height: 2, background: GOLD }} />)}</button>
      </div>
      {open && <div style={{ borderTop: "1px solid rgba(201,169,97,0.2)", padding: "8px 24px 16px" }}>
        {links.map(([l, id]) => <button key={id} onClick={() => go(id)} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid rgba(201,169,97,0.1)", cursor: "pointer", fontFamily: MONO, fontSize: 13, letterSpacing: "0.1em", color: "#E8E2D5", textTransform: "uppercase", padding: "14px 0" }}>{l}</button>)}
        <button onClick={() => { setOpen(false); onBag(); }} style={{ width: "100%", marginTop: 12, fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "13px", cursor: "pointer", textTransform: "uppercase" }}>View Bag{bagCount ? ` · ${bagCount}` : ""}</button>
      </div>}
    </div>
  );
}

// Apparel-first hero
function Hero() {
  const go = (id) => { const e = document.getElementById(id); if (e) window.scrollTo({ top: e.offsetTop - 64, behavior: "smooth" }); };
  return (
    <section style={{ minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 24px 70px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,169,97,0.12), transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, display: "grid", placeItems: "center" }}><TaborIconSeal id="hero-bg" size={640} /></div>
      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: GOLD, letterSpacing: "0.3em", marginBottom: 18 }}>[ SACRED-TACTICAL STREETWEAR ]</div>
        <h1 style={{ fontFamily: "'Pirata One', serif", fontSize: "clamp(58px, 12vw, 150px)", color: "#E8E2D5", margin: 0, lineHeight: 0.88 }}>Wear the Climb</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(15px,2.4vw,19px)", color: "#B8B2A6", maxWidth: 560, margin: "22px auto 0", lineHeight: 1.6 }}>Heavyweight, muted, premium. Gear forged for Christian men who train, game, and refuse to drift. Four collections, one brotherhood.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
          <button onClick={() => go("shop")} style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "16px 34px", cursor: "pointer" }}>Shop the Drop</button>
          <button onClick={() => go("collections")} style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, background: "transparent", border: `1px solid ${GOLD}`, padding: "16px 34px", cursor: "pointer" }}>Find Your Collection</button>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.16em", marginTop: 22 }}>PRINT-ON-DEMAND VIA PRINTFUL · SHIPS WORLDWIDE</div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["SONS OF FIRE", "◇", "FREE BROTHERHOOD APP", "◇", "WORLDWIDE SHIPPING", "◇", "FORGED NOT BOUGHT", "◇"];
  return (
    <div style={{ borderTop: "1px solid rgba(201,169,97,0.2)", borderBottom: "1px solid rgba(201,169,97,0.2)", background: "#0C0C10", overflow: "hidden", padding: "12px 0" }}>
      <div style={{ display: "flex", gap: 28, whiteSpace: "nowrap", justifyContent: "center", flexWrap: "wrap" }}>
        {items.map((t, i) => <span key={i} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", color: t === "◇" ? GOLD : "#9A948A" }}>{t}</span>)}
      </div>
    </div>
  );
}

function SectionHead({ kicker, title, sub }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>{kicker}</div>
      <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: "clamp(28px,5vw,44px)", color: "#E8E2D5", margin: 0, letterSpacing: "0.02em" }}>{title}</h2>
      {sub && <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#9A948A", maxWidth: 580, margin: "14px 0 0", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

// Featured drop (front and center)
function FeaturedShop({ onAdd, filter, setFilter }) {
  const shown = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.collection === filter);
  return (
    <section id="shop" style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <SectionHead kicker="[ THE FIRST DROP ]" title="Shop the Gear" sub="Every piece in heavyweight, muted, premium. Printed on demand and shipped worldwide through Printful." />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
          {[["all", "All"], ...COLLECTIONS.map(c => [c.id, c.name])].map(([id, l]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ cursor: "pointer", fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: filter === id ? "#0A0A0A" : "#9A948A", background: filter === id ? `linear-gradient(180deg,#E8D08C,${GOLD})` : "transparent", border: `1px solid ${GOLD}66`, padding: "9px 14px" }}>{l}</button>
          ))}
        </div>
        <div className="grid4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          {shown.map(p => <ProductCard key={p.sku} p={p} onAdd={onAdd} />)}
        </div>
      </div>
    </section>
  );
}

// Persona collections
function Collections({ onAdd, setFilter }) {
  const jumpShop = (id) => { setFilter(id); const e = document.getElementById("shop"); if (e) window.scrollTo({ top: e.offsetTop - 64, behavior: "smooth" }); };
  return (
    <section id="collections" style={{ padding: "80px 24px", background: "#0C0C10", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <SectionHead kicker="[ COLLECTIONS ]" title="Built for who you are" sub="Every man climbs as a class. Each collection is cut for a different kind of brother. Find yours." />
        <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {COLLECTIONS.map(c => {
            const hero = PRODUCTS.find(p => p.collection === c.id);
            return (
              <div key={c.id} style={{ border: `1px solid ${c.accent}44`, background: "#0E0E12", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: 0 }}>
                  <div style={{ width: "42%", aspectRatio: "3/4", background: hero.tone, display: "grid", placeItems: "center", position: "relative", overflow: "hidden", borderRight: `1px solid ${c.accent}33` }}>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 11px, transparent 11px 22px)" }} />
                    {hero.mark === "seal" ? <TaborIconSeal id={"col-" + c.id} size={70} /> : <div style={{ fontFamily: "'Pirata One', serif", fontSize: 30, color: hero.ink, position: "relative" }}>Tabor</div>}
                  </div>
                  <div style={{ flex: 1, padding: "22px 20px", display: "flex", flexDirection: "column" }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: c.accent, letterSpacing: "0.18em" }}>{c.tag.toUpperCase()}</div>
                    <h3 style={{ fontFamily: "'Pirata One', serif", fontSize: 30, color: "#E8E2D5", margin: "6px 0 8px" }}>{c.name}</h3>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#9A948A", lineHeight: 1.55, margin: "0 0 16px", flex: 1 }}>{c.blurb}</p>
                    <button onClick={() => jumpShop(c.id)} style={{ alignSelf: "flex-start", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: c.accent, background: "transparent", border: `1px solid ${c.accent}77`, padding: "10px 16px", cursor: "pointer", textTransform: "uppercase" }}>Shop {c.name} ›</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// App as secondary support
function AppStrip() {
  const go = (id) => { const e = document.getElementById(id); if (e) window.scrollTo({ top: e.offsetTop - 64, behavior: "smooth" }); };
  return (
    <section id="app" style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }} className="grid2">
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>[ MORE THAN MERCH ]</div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: "clamp(26px,4.5vw,40px)", color: "#E8E2D5", margin: "0 0 16px", letterSpacing: "0.02em" }}>The gear is the uniform. The app is the climb.</h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#9A948A", lineHeight: 1.65, margin: "0 0 20px" }}>TABOR is a free brotherhood app for Christian men who game. Scripture, fitness, and accountability as a daily quest, guided by a System that calls you upward. Wear the mark, then live it.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["App Store", "Google Play"].map(s => <button key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}55`, padding: "12px 20px", cursor: "pointer" }}><span style={{ color: GOLD }}>▸</span>{s}</button>)}
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 22, flexWrap: "wrap" }}>
            {[["Scripture Raid", "Daily Word + quizzes"], ["Fitness Guild", "Workouts to your level"], ["Brotherhood", "Guilds + giveaways"]].map(([t, d]) => (
              <div key={t}><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: GOLD }}>{t}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "#7A746A", marginTop: 2 }}>{d}</div></div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", placeItems: "center" }}>
          <div style={{ width: 220, border: `1px solid ${GOLD}44`, background: "radial-gradient(ellipse 90% 70% at 50% 0%, #16140e, #0A0A0A 72%)", padding: "40px 24px", textAlign: "center" }}>
            <TaborIconSeal id="app-seal" size={110} />
            <div style={{ fontFamily: "'Pirata One', serif", fontSize: 34, color: GOLD, marginTop: 12 }}>Tabor</div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#9A948A", letterSpacing: "0.2em", marginTop: 6 }}>SONS OF FIRE</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.14em", marginTop: 18, border: `1px solid ${GOLD}44`, padding: "8px" }}>FREE FOR LIFE</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GiveawayBanner() {
  return (
    <section style={{ padding: "56px 24px", background: "#0C0C10", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", border: `1px solid ${GOLD}44`, background: "radial-gradient(ellipse 80% 90% at 50% 0%, rgba(201,169,97,0.1), transparent 70%)", padding: "36px 28px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em" }}>[ THE BROTHERHOOD GIVES BACK ]</div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: "clamp(24px,4vw,34px)", color: "#E8E2D5", margin: "10px 0 12px" }}>Monthly gear giveaways</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "#9A948A", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>Every month the brotherhood votes. The most consistent, hardest-working man wins TABOR gear, free. Earn it in the app, wear it in the world.</p>
      </div>
    </section>
  );
}

function Creed() {
  const tenets = ["Christ is the summit. The climb is for Him.", "Discipline is worship.", "The body is a temple, so train it.", "No one climbs alone.", "Forged, not bought."];
  return (
    <section id="creed" style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHead kicker="[ THE CREED ]" title="What we stand on." />
        <div style={{ display: "grid", gap: 12, maxWidth: 760 }}>
          {tenets.map((t, i) => <div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline", borderBottom: "1px solid rgba(201,169,97,0.12)", paddingBottom: 14 }}><span style={{ fontFamily: MONO, fontSize: 13, color: GOLD }}>{String(i + 1).padStart(2, "0")}</span><span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: "clamp(17px,3vw,23px)", color: "#E8E2D5" }}>{t}</span></div>)}
        </div>
        <p style={{ fontFamily: "var(--font-scripture)", fontStyle: "italic", fontSize: "clamp(18px,3vw,24px)", color: "#CFC9BD", marginTop: 34, maxWidth: 640, lineHeight: 1.5 }}>“Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.”<span style={{ display: "block", fontFamily: MONO, fontStyle: "normal", fontSize: 11, color: "#7A746A", letterSpacing: "0.2em", marginTop: 10 }}>PROVERBS 27:17</span></p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "44px 24px", borderTop: "1px solid rgba(201,169,97,0.14)", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12 }}><TaborIconSeal id="ft-seal" size={28} /><span style={{ fontFamily: "'Pirata One', serif", fontSize: 22, color: GOLD }}>Tabor</span></div>
      <div style={{ fontFamily: MONO, fontSize: 9, color: "#6E6A60", letterSpacing: "0.16em", lineHeight: 2 }}>SONS OF FIRE · FULFILLED BY PRINTFUL · SHIPS WORLDWIDE<br />SHIPPING · RETURNS · PRIVACY · TERMS · © 2026 TABOR BROTHERHOOD</div>
    </footer>
  );
}

function Cart({ items, onClose, onRemove }) {
  const total = items.reduce((a, b) => a + b.price, 0);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(390px, 92vw)", height: "100%", background: "#0E0E12", borderLeft: `1px solid ${GOLD}55`, padding: "28px 22px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, color: "#E8E2D5", letterSpacing: "0.08em" }}>YOUR BAG</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#9A948A", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {items.length === 0 ? <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#9A948A" }}>Your bag is empty. The drop awaits.</p> : <>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{it.name}</div><div style={{ fontFamily: MONO, fontSize: 11, color: GOLD }}>${it.price}</div></div>
              <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", color: "#6E6A60", fontSize: 12, cursor: "pointer", fontFamily: MONO, letterSpacing: "0.1em" }}>REMOVE</button>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0", fontFamily: MONO, fontSize: 15, color: "#E8E2D5" }}><span>TOTAL</span><span style={{ color: GOLD }}>${total}</span></div>
          <button style={{ width: "100%", fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "15px", cursor: "pointer" }}>Checkout</button>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#6E6A60", letterSpacing: "0.1em", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>CHECKOUT FULFILLED BY PRINTFUL.<br />SECURE PAYMENT · WORLDWIDE SHIPPING</div>
        </>}
      </div>
    </div>
  );
}

function Site() {
  const [cart, setCart] = useWS([]);
  const [cartOpen, setCartOpen] = useWS(false);
  const [filter, setFilter] = useWS("all");
  const add = (p) => { setCart(c => [...c, p]); setCartOpen(true); };
  return (
    <div style={{ background: "#0A0A0A" }}>
      <Nav onBag={() => setCartOpen(true)} bagCount={cart.length} />
      <Hero />
      <Marquee />
      <FeaturedShop onAdd={add} filter={filter} setFilter={setFilter} />
      <Collections onAdd={add} setFilter={setFilter} />
      <GiveawayBanner />
      <AppStrip />
      <Creed />
      <Footer />
      {cartOpen && <Cart items={cart} onClose={() => setCartOpen(false)} onRemove={(i) => setCart(c => c.filter((_, j) => j !== i))} />}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Site />);
