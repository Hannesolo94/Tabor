// Product detail page. Large art, story, add-to-cart, and "you may also like"
// suggestions (same persona, then same type).
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductArt } from "@/components/product/ProductArt";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCart } from "@/components/product/AddToCart";
import { PRODUCTS, categoryById, personaById, productBySku, suggestions } from "@/lib/catalog";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ sku: p.sku }));
}

export async function generateMetadata({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const p = productBySku(sku);
  return { title: p ? `${p.name} · TABOR` : "TABOR" };
}

export default async function ProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const p = productBySku(sku);
  if (!p) notFound();
  const persona = personaById(p.persona);
  const cat = categoryById(p.category);
  const also = suggestions(p.sku, 4);

  return (
    <div style={{ background: "#0A0A0A" }}>
      {/* breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 0", fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.1em" }}>
        <Link href="/shop" style={{ color: "#7A746A", textDecoration: "none" }}>SHOP</Link>
        {" / "}
        <Link href={`/collections/${p.persona}`} style={{ color: "#7A746A", textDecoration: "none" }}>{persona?.name.toUpperCase()}</Link>
        {" / "}
        <span style={{ color: "#B8B2A6" }}>{p.name.toUpperCase()}</span>
      </div>

      {/* main */}
      <section style={{ padding: "30px 24px 70px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 44, alignItems: "start" }}>
          <div style={{ border: "1px solid rgba(201,169,97,0.2)" }}>
            <ProductArt p={p} size={150} square />
          </div>

          <div>
            <Link href={`/collections/${p.persona}`} style={{ fontFamily: MONO, fontSize: 10, color: persona?.accent ?? GOLD, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none" }}>
              {persona?.name} · {persona?.tag}
            </Link>
            <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(38px,7vw,64px)", color: "#E8E2D5", margin: "8px 0 6px", lineHeight: 0.95 }}>{p.name}</h1>
            <div style={{ fontFamily: MONO, fontSize: 16, color: GOLD, marginBottom: 6 }}>${p.price}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.12em", marginBottom: 22 }}>{p.note.toUpperCase()}</div>

            <AddToCart p={p} />

            <p style={{ fontFamily: BODY, fontSize: 15, color: "#C3BDB1", lineHeight: 1.75, marginTop: 26 }}>{p.description}</p>

            <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(201,169,97,0.12)", display: "grid", gap: 10 }}>
              {[
                ["TYPE", cat?.name ?? ""],
                ["COLLECTION", persona?.name ?? ""],
                ["FULFILMENT", "Printed on demand · ships worldwide"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.14em", width: 110 }}>{k}</span>
                  <span style={{ fontFamily: BODY, fontSize: 13, color: "#B8B2A6" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* you may also like */}
      {also.length > 0 && (
        <section style={{ padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", borderTop: "1px solid rgba(201,169,97,0.12)", paddingTop: 40 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ YOU MAY ALSO LIKE ]</div>
            <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 24, color: "#E8E2D5", margin: "0 0 22px" }}>More from the climb</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {also.map((s) => <ProductCard key={s.sku} p={s} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
