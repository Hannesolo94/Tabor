// Donations admin: track pledges/gifts, mark completed, manage the goal + charities.
import { supabaseServer } from "@/lib/supabase/server";
import { setDonationStatus, saveGoal, addCharity, toggleCharity } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";
const GREEN = "#5FB07A";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const tableCard: React.CSSProperties = { ...cardStyle, padding: "8px 16px 14px" };
const cardTitle: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 12 };
const th: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 8px", fontWeight: 400 };
const td: React.CSSProperties = { padding: "13px 8px", fontFamily: BODY, fontSize: 13, color: "#C3BDB1", verticalAlign: "middle" };
function pill(on: boolean): React.CSSProperties {
  return { fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 8, color: on ? GREEN : GOLD, border: `1px solid ${on ? "rgba(95,176,122,0.4)" : "rgba(201,169,97,0.4)"}`, background: on ? "rgba(95,176,122,0.08)" : "rgba(201,169,97,0.08)", display: "inline-block" };
}

export default async function DonationsAdmin() {
  const sb = await supabaseServer();
  const [{ data: donations }, { data: goal }, { data: charities }] = await Promise.all([
    sb.from("donations").select("id, name, email, amount, currency, status, message, created_at").order("created_at", { ascending: false }).limit(200),
    sb.from("donation_goals").select("*").eq("active", true).order("sort").limit(1).maybeSingle(),
    sb.from("charities").select("id, name, blurb, active").order("sort"),
  ]);
  const list = donations ?? [];
  const completed = list.filter((d) => d.status === "completed");
  const raised = completed.reduce((s, d) => s + Number(d.amount), 0);
  const pending = list.filter((d) => d.status === "pending").reduce((s, d) => s + Number(d.amount), 0);

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px", width: "100%" };
  const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ THE MISSION ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Donations</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>Pledges record here; mark them completed once payment clears (real card capture lands with the gateway). The donor wall + goal on /give show completed gifts.</p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        <Stat label="RAISED (COMPLETED)" value={`R${raised.toLocaleString()}`} accent />
        <Stat label="PLEDGED (PENDING)" value={`R${pending.toLocaleString()}`} />
        <Stat label="GIFTS" value={String(completed.length)} />
        {goal && <Stat label="CHARITY SPLIT" value={`${goal.charity_split_pct}%`} />}
      </div>

      {/* goal editor */}
      <form action={saveGoal} className="admin-card" style={{ ...cardStyle, display: "grid", gap: 10, maxWidth: 560, marginBottom: 18 }}>
        <div style={cardTitle}>Active goal</div>
        <input type="hidden" name="id" value={goal?.id ?? ""} />
        <div><label style={lbl}>Title</label><input name="title" defaultValue={goal?.title ?? ""} style={inp} /></div>
        <div><label style={lbl}>Description</label><input name="description" defaultValue={goal?.description ?? ""} style={inp} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Target (R)</label><input name="target_amount" type="number" defaultValue={goal?.target_amount ?? 0} style={inp} /></div>
          <div><label style={lbl}>Charity split %</label><input name="charity_split_pct" type="number" defaultValue={goal?.charity_split_pct ?? 50} style={inp} /></div>
        </div>
        <div><button type="submit" style={btnGold}>Save goal</button></div>
      </form>

      {/* charities */}
      <div className="admin-card" style={{ ...cardStyle, marginBottom: 12 }}>
        <div style={cardTitle}>Charities</div>
        <div>
          {(charities ?? []).map((c, i) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div><span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{c.name}</span>{c.blurb ? <span style={{ fontFamily: BODY, fontSize: 11, color: "#8A847A" }}> · {c.blurb}</span> : null}</div>
              <form action={toggleCharity}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={String(c.active)} /><button style={{ ...btnGhost, color: c.active ? GREEN : "#8A847A" }}>{c.active ? "ACTIVE" : "HIDDEN"}</button></form>
            </div>
          ))}
        </div>
      </div>
      <form action={addCharity} style={{ display: "flex", gap: 8, marginBottom: 22, maxWidth: 560 }}>
        <input name="name" placeholder="Add a charity..." style={{ ...inp, flex: 1 }} />
        <button type="submit" style={btnGold}>Add</button>
      </form>

      {/* donations list */}
      <div className="admin-card" style={tableCard}>
        <div style={{ ...cardTitle, padding: "6px 8px 0" }}>Gifts</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Donor", "Message", "Amount", "Status"].map((h, i) => <th key={h} style={{ ...th, textAlign: i >= 2 ? "right" : "left" }}>{h}</th>)}</tr></thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={td}>
                  <div style={{ fontFamily: BODY, fontSize: 13.5, color: "#E8E2D5", fontWeight: 600 }}>{d.name || "Anonymous"}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", marginTop: 2 }}>{d.email} · {new Date(d.created_at).toISOString().slice(0, 10)}</div>
                </td>
                <td style={{ ...td, fontSize: 12, color: "#9A948A", maxWidth: 280 }}>{d.message || "—"}</td>
                <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontSize: 13, color: GOLD }}>R{Number(d.amount).toLocaleString()}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  <form action={setDonationStatus} style={{ display: "inline" }}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="status" value={d.status === "completed" ? "pending" : "completed"} />
                    <button style={{ ...pill(d.status === "completed"), cursor: "pointer", background: "transparent" }}>{d.status === "completed" ? "● COMPLETED" : "MARK PAID"}</button>
                  </form>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} style={{ ...td, color: "#8A847A" }}>No donations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(160deg, rgba(40,40,50,0.5), rgba(16,16,22,0.42))", borderRadius: 14, boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 30px -22px rgba(0,0,0,0.9)", padding: "14px 18px", minWidth: 140 }}>
      <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.12em" }}>{label}</div>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 22, color: accent ? GOLD : "#E8E2D5", marginTop: 4 }}>{value}</div>
    </div>
  );
}
const btnGold: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };
const btnGhost: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", background: "rgba(201,169,97,0.05)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "7px 11px", cursor: "pointer" };
