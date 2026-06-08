// Admin product list. Shows every product (live + draft) with quick status, and
// links to edit. Reads via the admin's session (sees drafts too).
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { ProductsTable, type Row } from "./ProductsTable";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const sb = await supabaseServer();
  let query = sb
    .from("products")
    .select("sku,name,collection,category,base_price,status,featured,inventory,track_inventory,sort")
    .order("sort", { ascending: true });
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  const { data } = await query;
  const rows = (data ?? []) as Row[];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ CATALOG ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Products</h1>
          <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>{rows.length} products. Edits go live instantly.</p>
        </div>
        <Link href="/admin/products/new" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", borderRadius: 12, padding: "11px 18px", textDecoration: "none" }}>+ New Product</Link>
      </div>

      <form action="/admin/products" method="get" style={{ marginBottom: 12, maxWidth: 360 }}>
        <input name="q" defaultValue={q} placeholder="Search products by name or SKU…" style={{ width: "100%", fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "9px 12px" }} />
      </form>
      <p style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.08em", marginBottom: 10 }}>{q ? `${rows.length} MATCH "${q.toUpperCase()}" · ` : ""}TIP: TICK PRODUCTS TO BULK-ASSIGN COLLECTION/TYPE OR PUBLISH AT ONCE.</p>
      <ProductsTable rows={rows} />
    </div>
  );
}
