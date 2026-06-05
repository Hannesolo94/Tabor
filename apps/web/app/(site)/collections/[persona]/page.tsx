// Persona collection page — the primary product structure. Tells the persona's
// meaning + design language, then shows that persona's full range grouped by type.
import { notFound } from "next/navigation";
import Link from "next/link";
import { TaborSeal } from "@/components/TaborSeal";
import { ProductCard } from "@/components/product/ProductCard";
import { PERSONAS, categoriesInPersona, personaById, productsByPersona } from "@/lib/catalog";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export function generateStaticParams() {
  return PERSONAS.map((p) => ({ persona: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ persona: string }> }) {
  const { persona } = await params;
  const p = personaById(persona);
  return { title: p ? `${p.name} · TABOR` : "TABOR" };
}

export default async function CollectionPage({ params }: { params: Promise<{ persona: string }> }) {
  const { persona: personaId } = await params;
  const persona = personaById(personaId);
  if (!persona) notFound();
  const products = productsByPersona(persona.id);
  const cats = categoriesInPersona(persona.id);

  return (
    <div style={{ background: "#0A0A0A" }}>
      {/* persona header */}
      <section style={{ padding: "70px 24px 50px", borderBottom: `1px solid ${persona.accent}33`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, display: "grid", placeItems: "center" }}><TaborSeal id="persona-bg" size={520} /></div>
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: persona.accent, letterSpacing: "0.24em", textTransform: "uppercase" }}>{persona.tag}</div>
          <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(48px,9vw,96px)", color: "#E8E2D5", margin: "8px 0 18px", lineHeight: 0.9 }}>{persona.name}</h1>
          <p style={{ fontFamily: BODY, fontSize: 16, color: "#C3BDB1", lineHeight: 1.7, maxWidth: 680 }}>{persona.meaning}</p>
          <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid rgba(201,169,97,0.14)", maxWidth: 680 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: persona.accent, letterSpacing: "0.2em", marginBottom: 8 }}>THE DESIGN</div>
            <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A", lineHeight: 1.65, margin: 0 }}>{persona.design}</p>
          </div>
        </div>
      </section>

      {/* the range, grouped by category */}
      <section style={{ padding: "50px 24px 80px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {cats.map((cat) => {
            const items = products.filter((p) => p.category === cat.id);
            return (
              <div key={cat.id} style={{ marginBottom: 48 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
                  <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 22, color: "#E8E2D5", letterSpacing: "0.04em" }}>{cat.name}</h2>
                  <Link href={`/shop?type=${cat.id}`} style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.12em", textDecoration: "none", textTransform: "uppercase" }}>All {cat.name} ›</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
                  {items.map((p) => <ProductCard key={p.sku} p={p} />)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* other collections */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", borderTop: "1px solid rgba(201,169,97,0.12)", paddingTop: 36 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.2em", marginBottom: 16 }}>[ OTHER COLLECTIONS ]</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {PERSONAS.filter((p) => p.id !== persona.id).map((p) => (
              <Link key={p.id} href={`/collections/${p.id}`} style={{ textDecoration: "none", border: `1px solid ${p.accent}55`, padding: "12px 20px", fontFamily: CINZEL, fontWeight: 600, fontSize: 14, color: "#E8E2D5" }}>{p.name} ›</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
