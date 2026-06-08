// Shop All — every product, filterable by type (category) and collection
// (persona) via URL query params. Filter pills are links, so it stays a server
// component and the filtered state is shareable/bookmarkable.
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { CATEGORIES, PERSONAS, categoryById, personaById } from "@/lib/catalog";
import { getProducts } from "@/lib/products-db";
import { getRegion } from "@/lib/region";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const metadata = { title: "Shop · TABOR" };
export const dynamic = "force-dynamic";

function pill(active: boolean, accent = GOLD): React.CSSProperties {
  return { fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", color: active ? "#1a1408" : "#9A948A", fontWeight: active ? 700 : 400, background: active ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.05)", border: `1px solid ${accent}${active ? "00" : "40"}`, borderRadius: 10, boxShadow: active ? "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)" : "none", padding: "9px 14px", display: "inline-block" };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ type?: string; persona?: string; q?: string }> }) {
  const sp = await searchParams;
  const type = sp.type && categoryById(sp.type) ? sp.type : undefined;
  const persona = sp.persona && personaById(sp.persona) ? sp.persona : undefined;
  const q = (sp.q ?? "").trim() || undefined;

  const region = await getRegion();
  const items = await getProducts(region, { category: type, persona, q });

  const cat = type ? categoryById(type) : undefined;
  const per = persona ? personaById(persona) : undefined;
  const heading = q ? `Search: "${q}"` : cat ? cat.name : per ? per.name : "Shop All";
  const sub = q ? `${items.length} ${items.length === 1 ? "result" : "results"} for "${q}".` : cat ? cat.blurb : per ? per.blurb : "Every piece across every collection. Heavyweight, muted, premium.";

  const qp = (next: { type?: string; persona?: string }) => {
    const params = new URLSearchParams();
    if (next.type) params.set("type", next.type);
    if (next.persona) params.set("persona", next.persona);
    const s = params.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh" }}>
      <section style={{ padding: "60px 24px 30px", borderBottom: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>[ {type ? "SHOP BY TYPE" : persona ? "COLLECTION" : "THE FULL RANGE"} ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "clamp(30px,5vw,46px)", color: "#E8E2D5", margin: 0 }}>{heading}</h1>
          <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A", maxWidth: 600, margin: "12px 0 0", lineHeight: 1.6 }}>{sub}</p>
        </div>
      </section>

      {/* filters */}
      <section style={{ padding: "24px 24px 8px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <form action="/shop" method="get" style={{ display: "flex", gap: 8, marginBottom: 22, maxWidth: 420 }}>
            <input name="q" defaultValue={q ?? ""} placeholder="Search products..." style={{ flex: 1, fontFamily: MONO, fontSize: 12, color: "#E8E2D5", background: "rgba(21,21,26,0.7)", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "12px 14px" }} />
            <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 12, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", padding: "11px 20px", cursor: "pointer" }}>Search</button>
          </form>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.18em", marginBottom: 8 }}>COLLECTION</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <Link href={qp({ type })} style={pill(!persona)}>All</Link>
            {PERSONAS.map((p) => <Link key={p.id} href={qp({ type, persona: p.id })} style={pill(persona === p.id, p.accent)}>{p.name}</Link>)}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.18em", marginBottom: 8 }}>TYPE</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link href={qp({ persona })} style={pill(!type)}>All</Link>
            {CATEGORIES.map((c) => <Link key={c.id} href={qp({ persona, type: c.id })} style={pill(type === c.id)}>{c.name}</Link>)}
          </div>
        </div>
      </section>

      {/* grid */}
      <section style={{ padding: "26px 24px 80px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.12em", marginBottom: 16 }}>{items.length} {items.length === 1 ? "PIECE" : "PIECES"}</div>
          {items.length === 0 ? (
            <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A" }}>Nothing here yet. The drop is coming.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
              {items.map((p) => <ProductCard key={p.sku} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
