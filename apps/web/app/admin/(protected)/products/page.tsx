// Admin product list. Shows every product (live + draft) with quick status, and
// links to edit. Reads via the admin's session (sees drafts too).
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { ProductsTable, type Row } from "./ProductsTable";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("products")
    .select("sku,name,collection,category,base_price,status,featured,inventory,track_inventory,sort")
    .order("sort", { ascending: true });
  const rows = (data ?? []) as Row[];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ CATALOG ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Products</h1>
          <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>{rows.length} products. Edits go live instantly.</p>
        </div>
        <Link href="/admin/products/new" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, padding: "11px 18px", textDecoration: "none" }}>+ New Product</Link>
      </div>

      <p style={{ fontFamily: MONO, fontSize: 9, color: "#6E6A60", letterSpacing: "0.08em", marginBottom: 10 }}>TIP: TICK PRODUCTS TO BULK-ASSIGN COLLECTION/TYPE OR PUBLISH AT ONCE.</p>
      <ProductsTable rows={rows} />
    </div>
  );
}
