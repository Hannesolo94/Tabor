import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { updateCollection, deleteCollection } from "../actions";
import { ProductPicker, type PickerProduct } from "../ProductPicker";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function EditCollection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: col } = await sb.from("collections").select("*").eq("id", id).maybeSingle();
  if (!col) notFound();

  const [allProducts, members] = await Promise.all([
    sb.from("products").select("sku, name, collection, category, status").order("sort", { ascending: true }),
    sb.from("collection_products").select("sku").eq("collection_id", id),
  ]);
  const products = (allProducts.data ?? []) as PickerProduct[];
  const initial = (members.data ?? []).map((m) => m.sku);

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "10px 12px", width: "100%" };
  const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/admin/collections" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>← COLLECTIONS</Link>
        {col.visible && <Link href={`/collection/${col.slug}`} target="_blank" style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.12em", textDecoration: "none" }}>VIEW ON SITE ↗</Link>}
      </div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 28, color: "#E8E2D5", margin: "14px 0 20px" }}>{col.title}</h1>

      <form action={updateCollection} style={{ display: "grid", gap: 12, maxWidth: 520, marginBottom: 28 }}>
        <input type="hidden" name="id" value={col.id} />
        <div><label style={lbl}>Title</label><input name="title" defaultValue={col.title} style={inp} /></div>
        <div><label style={lbl}>Description</label><input name="description" defaultValue={col.description ?? ""} style={inp} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "end" }}>
          <div><label style={lbl}>Sort</label><input name="sort" type="number" defaultValue={col.sort} style={inp} /></div>
          <label style={{ fontFamily: MONO, fontSize: 11, color: "#C3BDB1", display: "flex", gap: 8, alignItems: "center", paddingBottom: 10 }}><input type="checkbox" name="visible" defaultChecked={col.visible} /> Visible on site</label>
        </div>
        <div><button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "11px 20px", cursor: "pointer" }}>Save details</button></div>
      </form>

      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginBottom: 4 }}>Products in this collection</div>
      <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 12px" }}>Search the whole catalog and tick what belongs here, then Save selection.</p>
      <ProductPicker collectionId={col.id} products={products} initial={initial} />

      <form action={deleteCollection} style={{ marginTop: 30, paddingTop: 16, borderTop: "1px solid rgba(192,58,58,0.25)" }}>
        <input type="hidden" name="id" value={col.id} />
        <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C03A3A", background: "none", border: "1px solid rgba(192,58,58,0.4)", padding: "10px 16px", cursor: "pointer" }}>Delete collection</button>
      </form>
    </div>
  );
}
