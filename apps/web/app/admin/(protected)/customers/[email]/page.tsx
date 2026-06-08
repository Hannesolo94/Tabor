// Customer detail — Shopify-style: metrics row (spend/orders/since/segment), last order
// + notes/timeline (left), customer / contact / address / marketing / tags (right rail).
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DeleteCustomer } from "../DeleteCustomer";
import { addNote, deleteNote, addTag, removeTag } from "../actions";
import { GOLD, MONO, CINZEL, BODY, formatMoney } from "@/lib/ui";

export const dynamic = "force-dynamic";
const GREEN = "#5FB07A";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const sectionH: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", marginTop: 16, marginBottom: 6 };
const detail: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#C3BDB1", lineHeight: 1.55 };

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="admin-card" style={cardStyle}>
      {(title || action) && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{title}</span>{action}</div>}
      {children}
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-card" style={{ ...cardStyle, padding: "16px 18px" }}>
      <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 22, color: "#E8E2D5", marginTop: 6 }}>{value}</div>
    </div>
  );
}

export default async function CustomerDetail({ params }: { params: Promise<{ email: string }> }) {
  const { email: raw } = await params;
  const email = decodeURIComponent(raw);
  const sb = await supabaseServer();
  const admin = supabaseAdmin();

  const [waitlist, notes, profRes, tagsRes] = await Promise.all([
    sb.from("waitlist").select("source, created_at").eq("email", email).maybeSingle(),
    sb.from("customer_notes").select("id, body, author, created_at").eq("email", email).order("created_at", { ascending: false }),
    admin.from("profiles").select("user_id, name, streak, role, created_at").eq("email", email).maybeSingle(),
    sb.from("customer_tags").select("tag").eq("email", email).order("tag"),
  ]);
  const tags = (tagsRes.data ?? []).map((t) => t.tag);
  const profile = profRes.data;
  const user = profile ? { id: profile.user_id } : null;

  let orders: { id: string; printful_order_id: string | null; status: string; total: number | null; currency?: string | null; created_at: string; shipping: unknown; items: unknown }[] = [];
  if (user) {
    const o = await admin.from("orders").select("id, printful_order_id, status, total, currency, created_at, shipping, items").eq("user_id", user.id).order("created_at", { ascending: false });
    orders = o.data ?? [];
  }

  const spent = orders.reduce((a, o) => a + Number(o.total ?? 0), 0);
  const cur = orders[0]?.currency;
  const sinceDate = waitlist.data?.created_at || profile?.created_at || orders[orders.length - 1]?.created_at;
  const monthsSince = sinceDate ? Math.max(0, Math.round((Date.now() - new Date(sinceDate).getTime()) / (30 * 86400000))) : 0;
  const segment = orders.length === 0 ? "Prospect" : spent >= 200 ? "VIP" : orders.length > 1 ? "Returning" : "New";
  const last = orders[0];
  const lastItems = (Array.isArray(last?.items) ? last!.items : []) as { name?: string; sku?: string; variant?: string; qty?: number; quantity?: number; price?: number }[];
  const ship = (last?.shipping ?? {}) as Record<string, string>;
  const addrName = ship.name || ship.full_name || profile?.name || "";
  const addrLines = [ship.address1 || ship.address || ship.street, ship.address2, [ship.city, ship.state_code || ship.state, ship.zip || ship.postal_code].filter(Boolean).join(", "), ship.country_code || ship.country].filter(Boolean) as string[];
  const paid = (s: string) => ["paid", "fulfilled", "shipped"].includes(s);
  const fulfilled = (s: string) => ["fulfilled", "shipped"].includes(s);
  const pill = (on: boolean, label: string): React.CSSProperties => ({ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 8, color: on ? GREEN : GOLD, border: `1px solid ${on ? "rgba(95,176,122,0.4)" : "rgba(201,169,97,0.4)"}`, display: "inline-block" });

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <Link href="/admin/customers" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>‹ CUSTOMERS</Link>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 25, color: "#E8E2D5", margin: "8px 0 4px", wordBreak: "break-all" }}>{profile?.name || email}</h1>
        <div style={{ fontFamily: MONO, fontSize: 10, color: user ? GREEN : "#8A847A", letterSpacing: "0.08em" }}>{user ? "● REGISTERED ACCOUNT" : "○ EMAIL CONTACT (NO ACCOUNT)"}</div>
      </div>

      {/* metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 18 }}>
        <Metric label="Amount spent" value={formatMoney(spent, cur)} />
        <Metric label="Orders" value={String(orders.length)} />
        <Metric label="Customer since" value={monthsSince >= 1 ? `${monthsSince} mo` : "new"} />
        <Metric label="Segment" value={segment} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, alignItems: "start" }}>
        {/* left */}
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Last order placed" action={orders.length > 1 ? <Link href={`/admin/orders`} style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em", textDecoration: "none" }}>VIEW ALL ({orders.length})</Link> : undefined}>
            {!last ? <p style={detail}>No orders yet.</p> : (
              <Link href={`/admin/orders/${last.id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: "#E8E2D5", fontWeight: 600 }}>{last.printful_order_id ? `#${last.printful_order_id}` : `#${last.id.slice(0, 8)}`}</span>
                  <span style={pill(paid(last.status), "")}>{paid(last.status) ? "PAID" : "PENDING"}</span>
                  <span style={pill(fulfilled(last.status), "")}>{fulfilled(last.status) ? "FULFILLED" : "UNFULFILLED"}</span>
                  <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 13, color: GOLD }}>{formatMoney(last.total ?? 0, last.currency)}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", marginTop: 6 }}>{new Date(last.created_at).toLocaleString()}</div>
                {lastItems.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: i ? 0 : 10 }}>
                    <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{it.name ?? it.sku}{it.variant ? ` · ${it.variant}` : ""} × {it.qty ?? it.quantity ?? 1}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: "#9A948A" }}>{formatMoney(Number(it.price ?? 0) * (it.qty ?? it.quantity ?? 1), last.currency)}</span>
                  </div>
                ))}
              </Link>
            )}
          </Card>

          <Card title="Notes & timeline">
            <form action={addNote} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input type="hidden" name="email" value={email} />
              <input name="body" placeholder="Add a note or log a request…" required style={{ flex: 1, fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "10px 12px" }} />
              <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>Add</button>
            </form>
            {waitlist.data && <div style={{ ...detail, paddingLeft: 14, borderLeft: "1px solid rgba(201,169,97,0.2)", marginBottom: 8 }}>● Joined via {waitlist.data.source || "web"} <span style={{ color: "#7A746A", fontFamily: MONO, fontSize: 10 }}>{new Date(waitlist.data.created_at).toLocaleDateString()}</span></div>}
            {(notes.data ?? []).length === 0 ? <p style={detail}>No notes yet.</p> : (notes.data ?? []).map((n) => (
              <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div><div style={detail}>{n.body}</div><div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.08em", marginTop: 3 }}>{n.author} · {new Date(n.created_at).toLocaleDateString()}</div></div>
                <form action={deleteNote}><input type="hidden" name="id" value={n.id} /><input type="hidden" name="email" value={email} /><button type="submit" style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em" }}>REMOVE</button></form>
              </div>
            ))}
          </Card>
        </div>

        {/* right rail */}
        <div style={{ display: "grid", gap: 14 }}>
          <Card title="Customer">
            <div style={sectionH}>CONTACT</div>
            <div style={detail}>{email}</div>
            {ship.phone && <div style={detail}>{ship.phone}</div>}
            {addrLines.length > 0 && (
              <>
                <div style={sectionH}>DEFAULT ADDRESS</div>
                {addrName && <div style={detail}>{addrName}</div>}
                {addrLines.map((l, i) => <div key={i} style={detail}>{l}</div>)}
              </>
            )}
            <div style={sectionH}>MARKETING</div>
            <div style={detail}>{waitlist.data ? "● Email subscribed" : "○ Not subscribed"}</div>
            {profile && (
              <>
                <div style={sectionH}>ACCOUNT</div>
                <div style={detail}>Streak {profile.streak ?? 0}d{profile.role && profile.role !== "user" ? ` · ${profile.role}` : ""}</div>
              </>
            )}
          </Card>

          <Card title="Tags">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {tags.map((t) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, color: GOLD, border: `1px solid ${GOLD}44`, borderRadius: 8, padding: "5px 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {t}
                  <form action={removeTag} style={{ display: "inline" }}><input type="hidden" name="email" value={email} /><input type="hidden" name="tag" value={t} /><button type="submit" aria-label={`Remove tag ${t}`} style={{ background: "none", border: "none", color: "#8A847A", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>×</button></form>
                </span>
              ))}
            </div>
            <form action={addTag} style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input type="hidden" name="email" value={email} />
              <input name="tag" placeholder="add tag" style={{ flex: 1, fontFamily: MONO, fontSize: 11, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "7px 9px" }} />
              <button type="submit" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C3BDB1", background: "rgba(201,169,97,0.05)", border: "1px solid rgba(201,169,97,0.3)", borderRadius: 10, padding: "7px 10px", cursor: "pointer" }}>Add</button>
            </form>
          </Card>

          <Card title="Data privacy">
            <p style={{ ...detail, fontSize: 12, marginBottom: 12 }}>Erase this customer and all their data (POPIA / GDPR right to be forgotten).</p>
            <DeleteCustomer email={email} />
          </Card>
        </div>
      </div>
    </div>
  );
}
