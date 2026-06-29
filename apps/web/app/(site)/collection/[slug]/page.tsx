// Storefront page for a custom collection.
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { getCollectionBySlug } from "@/lib/collections-db";
import { getRegion } from "@/lib/region";
import { GOLD, MONO, METAL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await getCollectionBySlug(slug, "INTL");
  if (!res) return { title: "TABOR" };
  return { title: res.collection.title, description: res.collection.description ?? `${res.collection.title} — TABOR.`, alternates: { canonical: `/collection/${slug}` } };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const region = await getRegion();
  const res = await getCollectionBySlug(slug, region);
  if (!res) notFound();
  const { collection, products } = res;

  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh" }}>
      <section style={{ padding: "60px 24px 30px", borderBottom: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>[ COLLECTION ]</div>
          <h1 style={{ fontFamily: METAL, fontSize: "clamp(40px,8vw,84px)", color: "#E8E2D5", margin: 0, lineHeight: 0.95 }}>{collection.title}</h1>
          {collection.description && <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A", maxWidth: 600, margin: "14px 0 0", lineHeight: 1.6 }}>{collection.description}</p>}
        </div>
      </section>
      <section style={{ padding: "30px 24px 80px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {products.length === 0 ? (
            <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A" }}>Nothing in this collection yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
              {products.map((p) => <ProductCard key={p.sku} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
