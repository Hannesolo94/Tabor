// Home — apparel-and-gear-first, persona-led. Server component composing static
// sections + the ProductCard (client) and Waitlist (client) islands.
import Link from "next/link";
import { TaborSeal } from "@/components/TaborSeal";
import { ProductCard } from "@/components/product/ProductCard";
import { Waitlist } from "@/components/home/Waitlist";
import { CATEGORIES, PERSONAS } from "@/lib/catalog";
import { getFeatured } from "@/lib/products-db";
import { GOLD, MONO, PIRATA, CINZEL, BODY, SCRIPTURE } from "@/lib/ui";

export const dynamic = "force-dynamic";

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>{kicker}</div>
      <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "clamp(28px,5vw,44px)", color: "#E8E2D5", margin: 0, letterSpacing: "0.02em" }}>{title}</h2>
      {sub && <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A", maxWidth: 580, margin: "14px 0 0", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

const btnGold: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, padding: "16px 34px", textDecoration: "none" };
const btnGhost: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 600, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, background: "transparent", border: `1px solid ${GOLD}`, padding: "16px 34px", textDecoration: "none" };

export default async function Home() {
  const featured = await getFeatured();
  return (
    <div style={{ background: "#0A0A0A" }}>
      {/* hero */}
      <section style={{ minHeight: "86vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "90px 24px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,169,97,0.12), transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, display: "grid", placeItems: "center" }}><TaborSeal id="hero-bg" size={640} /></div>
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: GOLD, letterSpacing: "0.3em", marginBottom: 18 }}>[ SACRED-TACTICAL GEAR ]</div>
          <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(58px, 12vw, 150px)", color: "#E8E2D5", margin: 0, lineHeight: 0.88 }}>Wear the Climb</h1>
          <p style={{ fontFamily: BODY, fontSize: "clamp(15px,2.4vw,19px)", color: "#B8B2A6", maxWidth: 580, margin: "22px auto 0", lineHeight: 1.6 }}>
            Heavyweight, muted, premium. Apparel and gear forged for Christian men who train, game, and refuse to drift. Four collections, one brotherhood.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
            <Link href="/shop" style={btnGold}>Shop the Drop</Link>
            <Link href="#collections" style={btnGhost}>Find Your Collection</Link>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.16em", marginTop: 22 }}>PRINT-ON-DEMAND · SHIPS WORLDWIDE</div>
        </div>
      </section>

      {/* marquee */}
      <div style={{ borderTop: "1px solid rgba(201,169,97,0.2)", borderBottom: "1px solid rgba(201,169,97,0.2)", background: "#0C0C10", padding: "12px 0" }}>
        <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
          {["SONS OF FIRE", "◇", "FREE BROTHERHOOD APP", "◇", "WORLDWIDE SHIPPING", "◇", "FORGED NOT BOUGHT", "◇"].map((t, i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", color: t === "◇" ? GOLD : "#9A948A" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* featured */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHead kicker="[ THE FIRST DROP ]" title="Forged for the climb" sub="A piece from every collection. Heavyweight apparel and gear, printed on demand, shipped worldwide." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
            {featured.map((p) => <ProductCard key={p.sku} p={p} />)}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/shop" style={{ ...btnGhost, display: "inline-block" }}>Shop All Gear</Link>
          </div>
        </div>
      </section>

      {/* collections (personas) */}
      <section id="collections" style={{ padding: "80px 24px", background: "#0C0C10", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHead kicker="[ COLLECTIONS ]" title="Built for who you are" sub="Every man climbs as a class. Each collection carries a full range cut for a different kind of brother. Find yours." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {PERSONAS.map((c) => (
              <Link key={c.id} href={`/collections/${c.id}`} style={{ textDecoration: "none", border: `1px solid ${c.accent}44`, background: "#0E0E12", padding: "26px 22px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "grid", placeItems: "center", padding: "8px 0 16px" }}><TaborSeal id={"col-" + c.id} size={64} /></div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: c.accent, letterSpacing: "0.18em", textTransform: "uppercase" }}>{c.tag}</div>
                <h3 style={{ fontFamily: PIRATA, fontSize: 30, color: "#E8E2D5", margin: "6px 0 8px" }}>{c.name}</h3>
                <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", lineHeight: 1.55, margin: "0 0 16px", flex: 1 }}>{c.blurb}</p>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: c.accent, textTransform: "uppercase" }}>Enter {c.name} ›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* gear by type */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <SectionHead kicker="[ SHOP BY TYPE ]" title="More than merch" sub="Apparel is the start. Fly the standard, ground the floor you train on, light the dawn watch." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {CATEGORIES.map((c) => (
              <Link key={c.id} href={`/shop?type=${c.id}`} style={{ textDecoration: "none", border: "1px solid rgba(201,169,97,0.22)", background: "#0E0E12", padding: "18px 16px", display: "block" }}>
                <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5" }}>{c.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.08em", marginTop: 6, lineHeight: 1.5 }}>{c.blurb}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* giveaway */}
      <section style={{ padding: "56px 24px", background: "#0C0C10", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", border: `1px solid ${GOLD}44`, background: "radial-gradient(ellipse 80% 90% at 50% 0%, rgba(201,169,97,0.1), transparent 70%)", padding: "36px 28px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em" }}>[ THE BROTHERHOOD GIVES BACK ]</div>
          <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "clamp(24px,4vw,34px)", color: "#E8E2D5", margin: "10px 0 12px" }}>Monthly gear giveaways</h2>
          <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>Every month the brotherhood votes. The most consistent, hardest-working man wins TABOR gear, free. Earn it in the app, wear it in the world.</p>
        </div>
      </section>

      {/* app strip */}
      <section id="app" style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>[ MORE THAN MERCH ]</div>
            <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "clamp(26px,4.5vw,40px)", color: "#E8E2D5", margin: "0 0 16px", letterSpacing: "0.02em" }}>The gear is the uniform. The app is the climb.</h2>
            <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A", lineHeight: 1.65, margin: "0 0 20px" }}>TABOR is a free brotherhood app for Christian men who game. Scripture, fitness, and accountability as a daily quest, guided by a System that calls you upward. Wear the mark, then live it.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["App Store", "Google Play"].map((s) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: CINZEL, fontWeight: 600, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}55`, padding: "12px 20px" }}><span style={{ color: GOLD }}>▸</span>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", placeItems: "center" }}>
            <div style={{ width: 220, border: `1px solid ${GOLD}44`, background: "radial-gradient(ellipse 90% 70% at 50% 0%, #16140e, #0A0A0A 72%)", padding: "40px 24px", textAlign: "center" }}>
              <TaborSeal id="app-seal" size={110} />
              <div style={{ fontFamily: PIRATA, fontSize: 34, color: GOLD, marginTop: 12 }}>Tabor</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: "#9A948A", letterSpacing: "0.2em", marginTop: 6 }}>SONS OF FIRE</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.14em", marginTop: 18, border: `1px solid ${GOLD}44`, padding: "8px" }}>FREE FOR LIFE</div>
            </div>
          </div>
        </div>
      </section>

      {/* creed */}
      <section id="creed" style={{ padding: "80px 24px", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHead kicker="[ THE CREED ]" title="What we stand on." />
          <div style={{ display: "grid", gap: 12, maxWidth: 760 }}>
            {["Christ is the summit. The climb is for Him.", "Discipline is worship.", "The body is a temple, so train it.", "No one climbs alone.", "Forged, not bought."].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "baseline", borderBottom: "1px solid rgba(201,169,97,0.12)", paddingBottom: 14 }}>
                <span style={{ fontFamily: MONO, fontSize: 13, color: GOLD }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: CINZEL, fontWeight: 600, fontSize: "clamp(17px,3vw,23px)", color: "#E8E2D5" }}>{t}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: SCRIPTURE, fontStyle: "italic", fontSize: "clamp(18px,3vw,24px)", color: "#CFC9BD", marginTop: 34, maxWidth: 640, lineHeight: 1.5 }}>
            &ldquo;Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.&rdquo;
            <span style={{ display: "block", fontFamily: MONO, fontStyle: "normal", fontSize: 11, color: "#7A746A", letterSpacing: "0.2em", marginTop: 10 }}>PROVERBS 27:17</span>
          </p>
        </div>
      </section>

      <Waitlist />
    </div>
  );
}
