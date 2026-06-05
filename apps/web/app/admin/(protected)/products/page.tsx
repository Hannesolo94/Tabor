// Admin product list. Shows every product (live + draft) with quick status, and
// links to edit. Reads via the admin's session (sees drafts too).
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { personaById, categoryById } from "@/lib/catalog";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("products")
    .select("sku,name,collection,category,base_price,status,featured,inventory,track_inventory,sort")
    .order("sort", { ascending: true });
  const rows = data ?? [];

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

      <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 70px 90px 80px", padding: "12px 18px", borderBottom: "1px solid rgba(201,169,97,0.12)", fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.12em" }}>
          <span>NAME</span><span>COLLECTION</span><span>TYPE</span><span>PRICE</span><span>STATUS</span><span>STOCK</span>
        </div>
        {rows.map((r, i) => {
          const live = r.status === "live";
          const stock = r.track_inventory ? (r.inventory > 0 ? `${r.inventory}` : "SOLD OUT") : "—";
          return (
            <Link key={r.sku} href={`/admin/products/${r.sku}`} style={{ textDecoration: "none", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 70px 90px 80px", alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: "#E8E2D5" }}>
                {r.name}
                {r.featured && <span style={{ fontFamily: MONO, fontSize: 7.5, color: GOLD, letterSpacing: "0.1em", border: `1px solid ${GOLD}44`, padding: "1px 4px", marginLeft: 8 }}>FEATURED</span>}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#9A948A", textTransform: "uppercase" }}>{personaById(r.collection ?? "")?.name ?? r.collection}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#9A948A", textTransform: "uppercase" }}>{categoryById(r.category ?? "")?.name ?? r.category}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD }}>${r.base_price}</span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: live ? "#7BBF7B" : "#8A847A" }}>{live ? "● LIVE" : "○ DRAFT"}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: stock === "SOLD OUT" ? "#C03A3A" : "#9A948A" }}>{stock}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
