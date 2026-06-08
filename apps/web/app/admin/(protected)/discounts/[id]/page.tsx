import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { saveDiscount, deleteDiscount } from "../actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "9px 11px", width: "100%" };
const btn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };
const check: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#C3BDB1", display: "flex", gap: 8, alignItems: "center", marginTop: 12 };
const sectionH: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", marginTop: 16, marginBottom: 6 };
const detail: React.CSSProperties = { fontFamily: BODY, fontSize: 12.5, color: "#C3BDB1", lineHeight: 1.5 };

function Card({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="admin-card" style={cardStyle}>
      {(title || action) && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{title}</span>{action}</div>}
      {children}
    </div>
  );
}

export default async function DiscountEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: d } = await sb.from("discount_codes").select("*").eq("id", id).maybeSingle();
  if (!d) return <p style={{ fontFamily: BODY, color: "#9A948A" }}>Discount not found. <Link href="/admin/discounts" style={{ color: GOLD }}>Back to discounts</Link></p>;

  const valueLabel = d.value_type === "fixed" ? `$${Number(d.amount || 0).toFixed(2)} off` : `${d.percent ?? 0}% off`;
  const details = [
    `${valueLabel} the entire order`,
    d.min_subtotal ? `Minimum spend $${Number(d.min_subtotal).toFixed(2)}` : "No minimum purchase requirement",
    d.usage_limit ? `Limit of ${d.usage_limit} use${d.usage_limit === 1 ? "" : "s"}${d.once_per_email ? ", one per customer" : ""}` : d.once_per_email ? "One use per customer" : "Unlimited uses",
    d.starts_at ? `Active from ${new Date(d.starts_at).toLocaleDateString()}${d.ends_at ? ` until ${new Date(d.ends_at).toLocaleDateString()}` : ""}` : "Active immediately",
  ];
  const dt = (v?: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : "");

  return (
    <form action={saveDiscount}>
      <input type="hidden" name="id" value={d.id} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin/discounts" style={{ color: GOLD, textDecoration: "none", fontSize: 22, lineHeight: 1 }}>‹</Link>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 24, color: "#E8E2D5", margin: 0 }}>{d.code}</h1>
        </div>
        <button type="submit" style={btn}>Save</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 18, alignItems: "start" }}>
        {/* main editor column */}
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Discount code">
            <label style={lbl}>Code</label>
            <input name="code" defaultValue={d.code} style={{ ...inp, textTransform: "uppercase" }} />
            <p style={{ ...detail, marginTop: 8 }}>Customers enter this code at checkout.</p>
          </Card>

          <Card title="Discount value">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 130px" }}><label style={lbl}>Type</label>
                <select name="value_type" defaultValue={d.value_type} style={inp}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <div style={{ flex: "1 1 110px" }}><label style={lbl}>Percent (%)</label><input name="percent" type="number" min="1" max="100" defaultValue={d.percent ?? 10} style={inp} /></div>
              <div style={{ flex: "1 1 110px" }}><label style={lbl}>Fixed ($)</label><input name="amount" type="number" min="0" step="0.01" defaultValue={d.amount ?? ""} style={inp} /></div>
            </div>
            <p style={{ ...detail, marginTop: 8 }}>Type picks which value applies. Percentage uses %, Fixed uses $.</p>
          </Card>

          <Card title="Minimum purchase requirements">
            <label style={lbl}>Minimum order subtotal ($) — blank = no minimum</label>
            <input name="min_subtotal" type="number" min="0" step="0.01" defaultValue={d.min_subtotal ?? ""} style={inp} />
          </Card>

          <Card title="Maximum discount uses">
            <label style={lbl}>Total uses across all customers — blank = unlimited</label>
            <input name="usage_limit" type="number" min="1" defaultValue={d.usage_limit ?? ""} style={inp} />
            <label style={check}><input type="checkbox" name="once_per_email" defaultChecked={d.once_per_email} /> Limit to one use per customer</label>
          </Card>

          <Card title="Active dates">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 180px" }}><label style={lbl}>Starts</label><input name="starts_at" type="datetime-local" defaultValue={dt(d.starts_at)} style={inp} /></div>
              <div style={{ flex: "1 1 180px" }}><label style={lbl}>Ends — blank = never</label><input name="ends_at" type="datetime-local" defaultValue={dt(d.ends_at)} style={inp} /></div>
            </div>
          </Card>

          <Card title="Internal note">
            <input name="note" defaultValue={d.note ?? ""} placeholder="e.g. IG email campaign, launch promo" style={inp} />
          </Card>

          <div>
            <button type="submit" formAction={deleteDiscount} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C03A3A", background: "rgba(192,58,58,0.06)", border: "1px solid rgba(192,58,58,0.4)", borderRadius: 12, padding: "11px 18px", cursor: "pointer" }}>Delete discount</button>
          </div>
        </div>

        {/* right summary rail */}
        <div style={{ display: "grid", gap: 14, position: "sticky", top: 20 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5" }}>{d.code}</span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", padding: "4px 9px", borderRadius: 8, color: d.active ? "#5FB07A" : "#9A948A", border: `1px solid ${d.active ? "rgba(95,176,122,0.4)" : "rgba(255,255,255,0.12)"}` }}>{d.active ? "ACTIVE" : "DRAFT"}</span>
            </div>
            <label style={check}><input type="checkbox" name="active" defaultChecked={d.active} /> Active</label>
            <div style={sectionH}>TYPE</div>
            <div style={detail}>{d.value_type === "fixed" ? "Fixed amount off order" : "Percentage off order"}</div>
            <div style={sectionH}>DETAILS</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>{details.map((t, i) => <li key={i} style={detail}>{t}</li>)}</ul>
            <div style={sectionH}>PERFORMANCE</div>
            <div style={detail}>{d.used_count ?? 0} used{d.usage_limit ? ` of ${d.usage_limit}` : ""}</div>
          </Card>
          <Card title="Tags">
            <input name="tags" defaultValue={(d.tags ?? []).join(", ")} placeholder="comma, separated" style={inp} />
          </Card>
        </div>
      </div>
    </form>
  );
}
