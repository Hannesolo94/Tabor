// Customer detail: everything we hold for one email — signup, account, orders,
// and a notes/requests log. Plus the one-click erase.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DeleteCustomer } from "../DeleteCustomer";
import { addNote, deleteNote, addTag, removeTag } from "../actions";
import { GOLD, MONO, CINZEL, BODY, formatMoney } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function CustomerDetail({ params }: { params: Promise<{ email: string }> }) {
  const { email: raw } = await params;
  const email = decodeURIComponent(raw);

  const sb = await supabaseServer();
  const admin = supabaseAdmin();

  const [waitlist, notes, profRes, tagsRes] = await Promise.all([
    sb.from("waitlist").select("source, created_at").eq("email", email).maybeSingle(),
    sb.from("customer_notes").select("id, body, author, created_at").eq("email", email).order("created_at", { ascending: false }),
    admin.from("profiles").select("user_id, name, streak, role").eq("email", email).maybeSingle(),
    sb.from("customer_tags").select("tag").eq("email", email).order("tag"),
  ]);
  const tags = (tagsRes.data ?? []).map((t) => t.tag);

  const profile = profRes.data ? { name: profRes.data.name, streak: profRes.data.streak, role: profRes.data.role } : null;
  const user = profRes.data ? { id: profRes.data.user_id } : null;
  let orders: { id: string; status: string; total: number | null; currency?: string | null; created_at: string }[] = [];
  if (user) {
    const o = await admin.from("orders").select("id, status, total, currency, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    orders = o.data ?? [];
  }

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div style={{ display: "flex", gap: 14, padding: "7px 0" }}>
      <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#7A746A", letterSpacing: "0.12em", width: 130 }}>{k}</span>
      <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{v}</span>
    </div>
  );

  return (
    <div>
      <Link href="/admin/customers" style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.12em", textDecoration: "none" }}>← CUSTOMERS</Link>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: "14px 0 4px", wordBreak: "break-all" }}>{email}</h1>
      <div style={{ fontFamily: MONO, fontSize: 10, color: user ? "#7BBF7B" : "#8A847A", letterSpacing: "0.08em", marginBottom: 24 }}>
        {user ? "● REGISTERED ACCOUNT" : "○ EMAIL CONTACT (NO ACCOUNT)"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {/* profile / signup */}
        <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" }}>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", letterSpacing: "0.04em", marginBottom: 8 }}>DETAILS</div>
          {waitlist.data && <Row k="SIGNUP SOURCE" v={waitlist.data.source || "web"} />}
          {waitlist.data && <Row k="JOINED" v={new Date(waitlist.data.created_at).toISOString().slice(0, 10)} />}
          {profile?.name && <Row k="NAME" v={profile.name} />}
          {profile && <Row k="STREAK" v={`${profile.streak ?? 0} days`} />}
          {profile?.role && <Row k="ROLE" v={profile.role} />}
          {!waitlist.data && !profile && <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#7A746A" }}>No signup record (may have been added another way).</p>}
        </div>

        {/* orders */}
        <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" }}>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", letterSpacing: "0.04em", marginBottom: 8 }}>ORDERS</div>
          {orders.length === 0 ? (
            <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#7A746A" }}>No orders yet.</p>
          ) : (
            orders.map((o) => (
              <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#C3BDB1" }}>{o.status.toUpperCase()}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: GOLD }}>{formatMoney(o.total ?? 0, o.currency)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* tags */}
      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px", marginTop: 20 }}>
        <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", letterSpacing: "0.04em", marginBottom: 12 }}>TAGS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {tags.map((t) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, color: GOLD, border: `1px solid ${GOLD}44`, borderRadius: 8, padding: "5px 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {t}
              <form action={removeTag} style={{ display: "inline" }}><input type="hidden" name="email" value={email} /><input type="hidden" name="tag" value={t} /><button type="submit" aria-label={`Remove tag ${t}`} style={{ background: "none", border: "none", color: "#8A847A", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>×</button></form>
            </span>
          ))}
          <form action={addTag} style={{ display: "inline-flex", gap: 6 }}>
            <input type="hidden" name="email" value={email} />
            <input name="tag" placeholder="add tag (e.g. vip, sa, lapsed)" style={{ fontFamily: MONO, fontSize: 11, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "6px 9px", width: 180 }} />
            <button type="submit" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C3BDB1", background: "rgba(201,169,97,0.05)", border: "1px solid rgba(201,169,97,0.3)", borderRadius: 10, padding: "6px 10px", cursor: "pointer" }}>Add</button>
          </form>
        </div>
      </div>

      {/* notes / requests */}
      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px", marginTop: 20 }}>
        <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", letterSpacing: "0.04em", marginBottom: 12 }}>NOTES &amp; REQUESTS</div>
        <form action={addNote} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input type="hidden" name="email" value={email} />
          <input name="body" placeholder="Add a note or log a request..." required style={{ flex: 1, fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "10px 12px" }} />
          <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>Add</button>
        </form>
        {(notes.data ?? []).length === 0 ? (
          <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#7A746A" }}>No notes yet.</p>
        ) : (
          (notes.data ?? []).map((n) => (
            <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <div style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{n.body}</div>
                <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.08em", marginTop: 3 }}>{n.author} · {new Date(n.created_at).toISOString().slice(0, 10)}</div>
              </div>
              <form action={deleteNote}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="email" value={email} />
                <button type="submit" style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em" }}>REMOVE</button>
              </form>
            </div>
          ))
        )}
      </div>

      {/* danger zone */}
      <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid rgba(192,58,58,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#C03A3A", letterSpacing: "0.14em" }}>DATA PRIVACY</div>
          <div style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", marginTop: 3 }}>Erase this customer and all their data (POPIA / GDPR right to be forgotten).</div>
        </div>
        <DeleteCustomer email={email} />
      </div>
    </div>
  );
}
