// Customers / email list. The full waitlist with source breakdown. (Registered
// app/site accounts get richer profiles here once auth signups exist.)
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const sb = await supabaseServer();
  const { data, count } = await sb
    .from("waitlist")
    .select("email, source, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500);

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
        <a href="/admin/customers/export" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, border: `1px solid ${GOLD}55`, padding: "10px 16px", textDecoration: "none" }}>Export CSV</a>
      </div>

      {/* source breakdown */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        {Object.entries(bySource).map(([src, n]) => (
          <div key={src} style={{ border: "1px solid rgba(201,169,97,0.18)", background: "#0E0E12", padding: "10px 16px" }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>{src}</span>
            <span style={{ fontFamily: MONO, fontSize: 14, color: "#E8E2D5", marginLeft: 10 }}>{n}</span>
          </div>
        ))}
      </div>

      {/* list */}
      <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 110px", padding: "12px 18px", borderBottom: "1px solid rgba(201,169,97,0.12)", fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.14em" }}>
          <span>EMAIL</span><span>SOURCE</span><span>DATE</span>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: "22px 18px", fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No signups yet.</div>
        ) : (
          rows.map((r, i) => (
            <Link key={r.email + i} href={`/admin/customers/${encodeURIComponent(r.email)}`} style={{ textDecoration: "none", display: "grid", gridTemplateColumns: "1fr 120px 110px", alignItems: "center", padding: "11px 18px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", wordBreak: "break-all" }}>{r.email}</span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase" }}>{r.source || "web"}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#6E6A60" }}>{new Date(r.created_at).toISOString().slice(0, 10)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
