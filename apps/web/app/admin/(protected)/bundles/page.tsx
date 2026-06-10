// Bundles admin: curated product packs sold at a discount (AOV driver). Create a
// bundle, then pick its products (works like Collections).
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { createBundle } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminBundles() {
  const sb = await supabaseServer();
  const [bundlesRes, counts] = await Promise.all([
    sb.from("bundles").select("id, slug, title, visible, sort, discount_percent").order("sort", { ascending: true }),
    sb.from("bundle_products").select("bundle_id"),
  ]);
  const bundles = bundlesRes.data ?? [];
  const countBy = new Map<string, number>();
  for (const r of counts.data ?? []) countBy.set(r.bundle_id, (countBy.get(r.bundle_id) ?? 0) + 1);

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "10px 12px", width: "100%" };
  const card: React.CSSProperties = { border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)" };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ MERCHANDISING ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Bundles</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 24px", maxWidth: 640 }}>Curated packs sold at a discount: pick any products from the catalog, set a discount, and the bundle price is computed from the members (works in every currency). Bundles are not eligible for promo or discount codes.</p>

      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginBottom: 10 }}>Your bundles</div>
      {bundles.length > 0 ? (
        <div style={{ ...card, overflow: "hidden", marginBottom: 18 }}>
          {bundles.map((b, i) => (
            <Link key={b.id} href={`/admin/bundles/${b.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none", textDecoration: "none" }}>
              <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{b.title} <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>· /{b.slug}</span></span>
              <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 9.5, color: GOLD }}>{b.discount_percent}% OFF</span>
                <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#9A948A" }}>{countBy.get(b.id) ?? 0} items</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: b.visible ? "#7BBF7B" : "#8A847A" }}>{b.visible ? "● LIVE" : "○ HIDDEN"}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#8A847A", marginBottom: 18 }}>No bundles yet. Create your first below.</p>
      )}

      <form action={createBundle} style={{ ...card, padding: "18px 20px", display: "grid", gap: 10, maxWidth: 520 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.14em" }}>+ NEW BUNDLE</div>
        <input name="title" placeholder="Bundle name (e.g. Narrow Path Pack, First 5 Tee Pack)" required style={inp} />
        <input name="description" placeholder="Short description (optional)" style={inp} />
        <div>
          <label style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, display: "block" }}>Discount %</label>
          <input name="discount_percent" type="number" min={0} max={90} step={1} defaultValue={23} style={{ ...inp, maxWidth: 140 }} />
        </div>
        <div><button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" }}>Create &amp; pick products</button></div>
      </form>
    </div>
  );
}
