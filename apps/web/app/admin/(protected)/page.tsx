// Admin dashboard. Reads live data via the admin's RLS-authed session.
import { supabaseServer } from "@/lib/supabase/server";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ border: "1px solid rgba(201,169,97,0.18)", background: "#0E0E12", padding: "20px 22px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#8A847A", letterSpacing: "0.16em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: PIRATA, fontSize: 38, color: "#E8E2D5", lineHeight: 1.1, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  const sb = await supabaseServer();

  const [waitlist, customers, orders] = await Promise.all([
    sb.from("waitlist").select("email, source, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(8),
    sb.from("profiles").select("user_id", { count: "exact", head: true }),
    sb.from("orders").select("total", { count: "exact" }),
  ]);

  const signupCount = waitlist.count ?? 0;
  const customerCount = customers.count ?? 0;
  const orderCount = orders.count ?? 0;
  const revenue = (orders.data ?? []).reduce((a, b) => a + (Number(b.total) || 0), 0);
  const recent = waitlist.data ?? [];

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ OVERVIEW ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 26px" }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 34 }}>
        <Stat label="Revenue" value={`$${revenue.toFixed(0)}`} sub="ALL TIME" />
        <Stat label="Orders" value={String(orderCount)} sub={orderCount === 0 ? "AWAITING CHECKOUT" : "TOTAL"} />
        <Stat label="Email Signups" value={String(signupCount)} sub="WAITLIST + PROMO" />
        <Stat label="Registered" value={String(customerCount)} sub="APP/SITE ACCOUNTS" />
      </div>

      <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(201,169,97,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", letterSpacing: "0.04em" }}>Recent Signups</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.12em" }}>LATEST {recent.length}</span>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: "22px 20px", fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No signups yet.</div>
        ) : (
          recent.map((r, i) => (
            <div key={r.email + i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{r.email}</span>
              <span style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 8.5, color: GOLD, letterSpacing: "0.1em", border: `1px solid ${GOLD}33`, padding: "2px 6px", textTransform: "uppercase" }}>{r.source || "web"}</span>
                <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#6E6A60" }}>{new Date(r.created_at).toISOString().slice(0, 10)}</span>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
