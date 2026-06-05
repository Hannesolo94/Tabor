// Site footer. Static, server-rendered.
import Link from "next/link";
import { TaborSeal } from "@/components/TaborSeal";
import { CATEGORIES, PERSONAS } from "@/lib/catalog";
import { GOLD, MONO, PIRATA } from "@/lib/ui";

export function SiteFooter() {
  const col: React.CSSProperties = { fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.08em", textDecoration: "none", display: "block", padding: "5px 0", textTransform: "uppercase" };
  const head: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.18em", marginBottom: 8, textTransform: "uppercase" };
  return (
    <footer style={{ borderTop: "1px solid rgba(201,169,97,0.14)", padding: "48px 24px 36px", background: "#0A0A0A" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <TaborSeal id="ft-seal" size={28} />
            <span style={{ fontFamily: PIRATA, fontSize: 22, color: GOLD }}>Tabor</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.14em", lineHeight: 1.8 }}>SONS OF FIRE<br />FORGED NOT BOUGHT</div>
        </div>
        <div>
          <div style={head}>Collections</div>
          {PERSONAS.map((p) => <Link key={p.id} href={`/collections/${p.id}`} style={col}>{p.name}</Link>)}
        </div>
        <div>
          <div style={head}>Gear</div>
          {CATEGORIES.slice(0, 6).map((c) => <Link key={c.id} href={`/shop?type=${c.id}`} style={col}>{c.name}</Link>)}
        </div>
        <div>
          <div style={head}>The Brotherhood</div>
          <Link href="/shop" style={col}>Shop All</Link>
          <Link href="/#app" style={col}>The App</Link>
          <Link href="/#creed" style={col}>The Creed</Link>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "28px auto 0", paddingTop: 18, borderTop: "1px solid rgba(201,169,97,0.1)", fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.14em", textAlign: "center", lineHeight: 1.9 }}>
        FULFILLED LOCALLY + WORLDWIDE · PRINTED ON DEMAND
        <br />
        <span style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          {[["Shipping", "/shipping"], ["Returns", "/returns"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([l, h]) => (
            <Link key={h} href={h} style={{ color: "#8A847A", textDecoration: "none" }}>{l.toUpperCase()}</Link>
          ))}
        </span>
        <br />© 2026 TABOR BROTHERHOOD
      </div>
    </footer>
  );
}
