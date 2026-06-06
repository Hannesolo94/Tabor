// Collections admin: hide/unhide the persona collections, and create/manage your
// own custom collections (curated product groups).
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { PERSONAS } from "@/lib/catalog";
import { createCollection, togglePersona } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminCollections() {
  const sb = await supabaseServer();
  const [cols, hiddenRes, counts] = await Promise.all([
    sb.from("collections").select("id, slug, title, visible, sort").order("sort", { ascending: true }),
    sb.from("app_settings").select("value").eq("key", "personas").maybeSingle(),
    sb.from("collection_products").select("collection_id"),
  ]);
  const collections = cols.data ?? [];
  const hidden: string[] = ((hiddenRes.data?.value as { hidden?: string[] } | undefined)?.hidden) ?? [];
  const countBy = new Map<string, number>();
  for (const r of counts.data ?? []) countBy.set(r.collection_id, (countBy.get(r.collection_id) ?? 0) + 1);

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "10px 12px", width: "100%" };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ MERCHANDISING ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 24px" }}>Collections</h1>

      {/* persona visibility */}
      <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12", padding: "18px 20px", marginBottom: 22 }}>
        <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginBottom: 4 }}>Persona collections</div>
        <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 14px" }}>Your four core collections. Hide one to remove it from the site nav and listings.</p>
        <div style={{ display: "grid", gap: 6 }}>
          {PERSONAS.map((p) => {
            const isHidden = hidden.includes(p.id);
            return (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontFamily: BODY, fontSize: 14, color: isHidden ? "#8A847A" : "#E8E2D5" }}>{p.name} <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>· {p.tag}</span></span>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: isHidden ? "#C03A3A" : "#7BBF7B" }}>{isHidden ? "HIDDEN" : "VISIBLE"}</span>
                  <form action={togglePersona}><input type="hidden" name="persona" value={p.id} /><button style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C3BDB1", background: "none", border: "1px solid rgba(201,169,97,0.3)", padding: "6px 12px", cursor: "pointer" }}>{isHidden ? "Show" : "Hide"}</button></form>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* custom collections */}
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginBottom: 10 }}>Custom collections</div>
      {collections.length > 0 && (
        <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12", marginBottom: 18 }}>
          {collections.map((c, i) => (
            <Link key={c.id} href={`/admin/collections/${c.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none", textDecoration: "none" }}>
              <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{c.title} <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>· /{c.slug}</span></span>
              <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#9A948A" }}>{countBy.get(c.id) ?? 0} items</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: c.visible ? "#7BBF7B" : "#8A847A" }}>{c.visible ? "● LIVE" : "○ HIDDEN"}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <form action={createCollection} style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12", padding: "18px 20px", display: "grid", gap: 10, maxWidth: 520 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.14em" }}>+ NEW COLLECTION</div>
        <input name="title" placeholder="Collection name (e.g. Summer Drop, Best of Sentinel)" required style={inp} />
        <input name="description" placeholder="Short description (optional)" style={inp} />
        <div><button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "11px 20px", cursor: "pointer" }}>Create &amp; add products</button></div>
      </form>
    </div>
  );
}
