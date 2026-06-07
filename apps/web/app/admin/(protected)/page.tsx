// Admin dashboard. Shopify-style: date range, top summary, charts, funnel,
// best-sellers, traffic sources. Sales metrics come from orders (fill in once
// checkout is live); traffic/conversion collect from day one.
import Link from "next/link";
import { getDashboard, type RangeKey } from "@/lib/analytics-db";
import { supabaseServer } from "@/lib/supabase/server";
import { BarList, Funnel, LineChart } from "@/components/admin/Charts";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const money = (n: number) => `$${n.toFixed(n < 100 ? 2 : 0)}`;
const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ border: "1px solid rgba(201,169,97,0.18)", background: "#0E0E12", padding: "16px 18px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: accent ? GOLD : "#E8E2D5", lineHeight: 1.1, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.08em", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12", padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", letterSpacing: "0.04em" }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  const sp = await searchParams;
  const isCustom = sp.range === "custom" && sp.from && sp.to;
  const rangeKey = (isCustom ? "custom" : ["today", "7d", "30d", "90d"].includes(sp.range ?? "") ? sp.range : "30d") as RangeKey;
  const d = await getDashboard(rangeKey, isCustom ? { from: sp.from, to: sp.to } : undefined);
  const regionSym = (r: string) => (r === "ZA" ? "R" : "$");
  // donations (completed) — alongside apparel revenue
  const sbDash = await supabaseServer();
  const { data: donRows } = await sbDash.from("donations").select("amount").eq("status", "completed");
  const donations = (donRows ?? []).reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ {d.fromLabel.slice(5)} → {d.toLabel.slice(5)} ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Dashboard</h1>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {RANGES.map((r) => (
              <Link key={r.key} href={`/admin?range=${r.key}`} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", padding: "8px 12px", border: `1px solid ${GOLD}44`, color: rangeKey === r.key && !isCustom ? "#0A0A0A" : "#9A948A", background: rangeKey === r.key && !isCustom ? `linear-gradient(180deg,#E8D08C,${GOLD})` : "transparent" }}>{r.label}</Link>
            ))}
          </div>
          <form action="/admin" method="get" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="hidden" name="range" value="custom" />
            <input type="date" name="from" defaultValue={isCustom ? sp.from : d.fromLabel} aria-label="From date" style={{ fontFamily: MONO, fontSize: 10, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}44`, padding: "7px 8px" }} />
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A" }}>→</span>
            <input type="date" name="to" defaultValue={isCustom ? sp.to : d.toLabel} aria-label="To date" style={{ fontFamily: MONO, fontSize: 10, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}44`, padding: "7px 8px" }} />
            <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: isCustom ? "#0A0A0A" : "#9A948A", background: isCustom ? `linear-gradient(180deg,#E8D08C,${GOLD})` : "transparent", border: `1px solid ${GOLD}44`, padding: "7px 12px", cursor: "pointer" }}>Apply</button>
          </form>
        </div>
      </div>

      {/* summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 12 }}>
        <Stat label="Revenue" value={money(d.revenue)} sub={d.orderCount ? `${d.orderCount} orders` : "awaiting checkout"} accent />
        <Stat label="Orders" value={String(d.orderCount)} sub={`AOV ${money(d.aov)}`} />
        <Stat label="Conversion" value={`${d.conversion.toFixed(1)}%`} sub="orders / sessions" />
        <Stat label="Sessions" value={String(d.sessions)} sub={`${d.visitors} visitors`} />
        <Stat label="Pageviews" value={String(d.pageviews)} />
        <Stat label="Gross margin" value={d.revenue ? `${d.marginPct.toFixed(0)}%` : "—"} sub={d.revenue ? money(d.margin) : "set product costs"} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 26 }}>
        <Stat label="Avg LTV" value={money(d.ltv)} sub="per customer, all time" />
        <Stat label="Repeat rate" value={`${d.repeatRate.toFixed(0)}%`} sub="customers with 2+ orders" />
        <Stat label="Cart abandon" value={`${d.cartAbandon.toFixed(0)}%`} sub="added but not bought" />
        <Stat label="COGS" value={money(d.cogs)} sub="supplier cost" />
        <Stat label="App clicks" value={String(d.appClicks)} sub="store-button taps" />
        <Stat label="Donations" value={`R${donations.toLocaleString()}`} sub="completed gifts" />
      </div>

      {/* charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginBottom: 14 }}>
        <Card title="Revenue"><LineChart labels={d.series.labels} values={d.series.revenue} format={money} /></Card>
        <Card title="Sessions"><LineChart labels={d.series.labels} values={d.series.sessions} /></Card>
      </div>

      {/* funnel + sources */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginBottom: 14 }}>
        <Card title="Funnel">
          <Funnel steps={[{ label: "Pageviews", value: d.funnel.pageviews }, { label: "Add to cart", value: d.funnel.addToCart }, { label: "Checkout", value: d.funnel.checkout }, { label: "Purchase", value: d.funnel.purchase }]} />
        </Card>
        <Card title="Traffic sources"><BarList items={d.sources.map((s) => ({ label: s.source, value: s.count }))} /></Card>
      </div>

      {/* revenue by region */}
      <div style={{ marginBottom: 14 }}>
        <Card title="Revenue by region">
          {d.regions.length === 0 ? (
            <p style={{ fontFamily: MONO, fontSize: 11, color: "#8A847A" }}>No regional sales yet. ZA and International revenue will split out here once orders flow.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {d.regions.map((r) => (
                <div key={r.region} style={{ border: "1px solid rgba(201,169,97,0.14)", padding: "12px 14px" }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.14em" }}>{r.region === "ZA" ? "SOUTH AFRICA" : "INTERNATIONAL"}</div>
                  <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 22, color: GOLD, marginTop: 4 }}>{regionSym(r.region)}{r.revenue.toFixed(0)}</div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: "#9A948A", letterSpacing: "0.08em", marginTop: 2 }}>{r.orders} {r.orders === 1 ? "ORDER" : "ORDERS"}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* best sellers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginBottom: 14 }}>
        <Card title="Best-selling products"><BarList items={d.topProducts.map((p) => ({ label: p.name, value: p.revenue, sub: `${p.qty} sold` }))} format={money} /></Card>
        <Card title="Top categories"><BarList items={d.topCategories.map((c) => ({ label: c.category, value: c.revenue, sub: `${c.qty} sold` }))} format={money} /></Card>
      </div>

      {/* low stock */}
      {d.lowStock.length > 0 && (
        <Card title="Low stock alerts" action={<Link href="/admin/products" style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em", textDecoration: "none" }}>MANAGE →</Link>}>
          {d.lowStock.map((p) => (
            <div key={p.sku} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{p.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: p.inventory === 0 ? "#C03A3A" : GOLD }}>{p.inventory === 0 ? "SOLD OUT" : `${p.inventory} left`}</span>
            </div>
          ))}
        </Card>
      )}

      {d.orderCount === 0 && (
        <p style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.06em", marginTop: 18, lineHeight: 1.6 }}>
          SALES METRICS POPULATE ONCE CHECKOUT IS LIVE. TRAFFIC + CONVERSION ARE COLLECTING NOW.
        </p>
      )}
    </div>
  );
}
