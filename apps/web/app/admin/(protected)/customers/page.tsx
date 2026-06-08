// Customers / email list. The full waitlist with source breakdown. (Registered
// app/site accounts get richer profiles here once auth signups exist.)
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { syncAllToEmailPlatform } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; tag?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const tag = (sp.tag ?? "").trim().toLowerCase();
  const sb = await supabaseServer();

  // all tags (for chips + per-row badges)
  const { data: tagRows } = await sb.from("customer_tags").select("email, tag");
  const allTags = [...new Set((tagRows ?? []).map((t) => t.tag))].sort();
  const tagsByEmail = new Map<string, string[]>();
  for (const t of tagRows ?? []) tagsByEmail.set(t.email, [...(tagsByEmail.get(t.email) ?? []), t.tag]);
  const taggedEmails = tag ? new Set((tagRows ?? []).filter((t) => t.tag === tag).map((t) => t.email)) : null;

  let query = sb
    .from("waitlist")
    .select("email, source, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500);
  if (q) query = query.ilike("email", `%${q}%`);
  if (taggedEmails) query = query.in("email", [...taggedEmails].slice(0, 500));
  const { data, count } = await query;

  const rows = data ?? [];
  const bySource = rows.reduce<Record<string, number>>((acc, r) => {
    const k = r.source || "web";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ AUDIENCE ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Customers</h1>
          <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: 0 }}>{count ?? 0} email signups collected. Click any customer to view, note, or erase their data.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <form action={syncAllToEmailPlatform}>
            <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8D08C", border: `1px solid ${GOLD}55`, borderRadius: 12, padding: "10px 16px", cursor: "pointer", background: "rgba(201,169,97,0.06)" }}>Sync to Email Platform</button>
          </form>
          <a href="/admin/customers/export" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8D08C", border: `1px solid ${GOLD}55`, borderRadius: 12, background: "rgba(201,169,97,0.06)", padding: "10px 16px", textDecoration: "none" }}>Export CSV</a>
        </div>
      </div>

      <form action="/admin/customers" method="get" style={{ marginBottom: 14, maxWidth: 360 }}>
        <input name="q" defaultValue={q} placeholder="Search by email…" style={{ width: "100%", fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "9px 12px" }} />
      </form>

      {/* segment chips (tags) */}
      {allTags.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em" }}>SEGMENTS:</span>
          <Link href="/admin/customers" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", padding: "5px 10px", borderRadius: 8, border: `1px solid ${GOLD}44`, color: !tag ? "#1a1408" : "#C3BDB1", background: !tag ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.04)" }}>All</Link>
          {allTags.map((t) => (
            <Link key={t} href={`/admin/customers?tag=${encodeURIComponent(t)}`} style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", padding: "5px 10px", borderRadius: 8, border: `1px solid ${GOLD}44`, color: tag === t ? "#1a1408" : "#C3BDB1", background: tag === t ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.04)" }}>{t}</Link>
          ))}
        </div>
      )}

      {/* source breakdown */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        {Object.entries(bySource).map(([src, n]) => (
          <div key={src} style={{ border: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(160deg, rgba(40,40,50,0.5), rgba(16,16,22,0.42))", borderRadius: 12, boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset", padding: "10px 16px" }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>{src}</span>
            <span style={{ fontFamily: MONO, fontSize: 14, color: "#E8E2D5", marginLeft: 10 }}>{n}</span>
          </div>
        ))}
      </div>

      {/* list */}
      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px", padding: "12px 18px", borderBottom: "1px solid rgba(201,169,97,0.12)", fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.14em" }}>
          <span>EMAIL</span><span>SOURCE</span><span>DATE</span>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: "22px 18px", fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No signups yet.</div>
        ) : (
          rows.map((r, i) => (
            <Link key={r.email + i} href={`/admin/customers/${encodeURIComponent(r.email)}`} style={{ textDecoration: "none", display: "grid", gridTemplateColumns: "1fr 120px 110px", alignItems: "center", padding: "11px 18px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", wordBreak: "break-all" }}>
                {r.email}
                {(tagsByEmail.get(r.email) ?? []).map((t) => <span key={t} style={{ fontFamily: MONO, fontSize: 8, color: GOLD, border: `1px solid ${GOLD}44`, borderRadius: 8, padding: "1px 5px", marginLeft: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t}</span>)}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase" }}>{r.source || "web"}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#8A847A" }}>{new Date(r.created_at).toISOString().slice(0, 10)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
