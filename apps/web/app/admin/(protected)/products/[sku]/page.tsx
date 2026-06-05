import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";
import { deleteProduct } from "../actions";
import { GOLD, MONO, CINZEL } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const sb = await supabaseServer();
  const { data } = await sb.from("products").select("*").eq("sku", sku).maybeSingle();
  if (!data) notFound();

  const product = {
    sku: data.sku,
    name: data.name,
    persona: data.collection,
    category: data.category,
    price: Number(data.base_price ?? 0),
    blurb: data.blurb ?? "",
    description: data.description ?? "",
    note: data.note ?? "",
    tagline: data.tagline ?? "",
    sizes: data.sizes ?? [],
    imageUrl: data.image_url ?? "",
    tone: data.tone ?? "#15151A",
    ink: data.ink ?? "#C9A961",
    mark: data.mark ?? "seal",
    featured: !!data.featured,
    status: data.status ?? "draft",
    inventory: data.inventory ?? 0,
    trackInventory: !!data.track_inventory,
    sort: data.sort ?? 0,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/admin/products" style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.12em", textDecoration: "none" }}>← PRODUCTS</Link>
        <Link href={`/product/${data.sku}`} target="_blank" style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.12em", textDecoration: "none" }}>VIEW ON SITE ↗</Link>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", margin: "16px 0 6px" }}>[ EDIT ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 28, color: "#E8E2D5", margin: "0 0 24px" }}>{data.name}</h1>

      <ProductForm product={product} />

      {/* delete */}
      <form action={deleteProduct} style={{ marginTop: 36, paddingTop: 18, borderTop: "1px solid rgba(192,58,58,0.25)" }}>
        <input type="hidden" name="sku" value={data.sku} />
        <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C03A3A", background: "none", border: "1px solid rgba(192,58,58,0.4)", padding: "10px 16px", cursor: "pointer" }}>
          Delete this product
        </button>
      </form>
    </div>
  );
}
