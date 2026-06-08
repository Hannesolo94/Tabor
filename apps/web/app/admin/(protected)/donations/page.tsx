// Donations admin: track pledges/gifts, mark completed, manage the goal + charities.
import { supabaseServer } from "@/lib/supabase/server";
import { setDonationStatus, saveGoal, addCharity, toggleCharity } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

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

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "9px 11px", width: "100%" };
  const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ THE MISSION ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Donations</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 22px" }}>Pledges record here; mark them completed once payment clears (real card capture lands with the gateway). The donor wall + goal on /give show completed gifts.</p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <Stat label="RAISED (COMPLETED)" value={`R${raised.toLocaleString()}`} accent />
        <Stat label="PLEDGED (PENDING)" value={`R${pending.toLocaleString()}`} />
        <Stat label="GIFTS" value={String(completed.length)} />
        {goal && <Stat label="CHARITY SPLIT" value={`${goal.charity_split_pct}%`} />}
      </div>

      {/* goal editor */}
      <form action={saveGoal} style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "16px 18px", display: "grid", gap: 10, maxWidth: 560, marginBottom: 22 }}>
        <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>Active goal</div>
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
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginBottom: 10 }}>Charities</div>
      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden", marginBottom: 12 }}>
        {(charities ?? []).map((c, i) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div><span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{c.name}</span>{c.blurb ? <span style={{ fontFamily: BODY, fontSize: 11, color: "#8A847A" }}> · {c.blurb}</span> : null}</div>
            <form action={toggleCharity}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={String(c.active)} /><button style={{ ...btnGhost, color: c.active ? "#7BBF7B" : "#8A847A" }}>{c.active ? "ACTIVE" : "HIDDEN"}</button></form>
          </div>
        ))}
      </div>
      <form action={addCharity} style={{ display: "flex", gap: 8, marginBottom: 26, maxWidth: 560 }}>
        <input name="name" placeholder="Add a charity..." style={{ ...inp, flex: 1 }} />
        <button type="submit" style={btnGold}>Add</button>
      </form>

      {/* donations list */}
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginBottom: 10 }}>Gifts</div>
      {list.length === 0 ? <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No donations yet.</p> : (
        <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
          {list.map((d, i) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{d.name || "Anonymous"}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A" }}> · {d.email} · {new Date(d.created_at).toISOString().slice(0, 10)}</span>
                {d.message ? <div style={{ fontFamily: BODY, fontSize: 11.5, color: "#9A948A" }}>{d.message}</div> : null}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 13, color: GOLD }}>R{Number(d.amount).toLocaleString()}</span>
                <form action={setDonationStatus}><input type="hidden" name="id" value={d.id} /><input type="hidden" name="status" value={d.status === "completed" ? "pending" : "completed"} /><button style={{ ...btnGhost, color: d.status === "completed" ? "#7BBF7B" : GOLD }}>{d.status === "completed" ? "● COMPLETED" : "MARK PAID"}</button></form>
              </div>
            </div>
          ))}
        </div>
      )}
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
const btnGold: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer" };
const btnGhost: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", background: "rgba(201,169,97,0.05)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "7px 11px", cursor: "pointer" };
