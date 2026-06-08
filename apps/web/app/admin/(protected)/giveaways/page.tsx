// Giveaways admin: create monthly draws; see nominees + live vote tallies.
import { supabaseServer } from "@/lib/supabase/server";
import { createGiveaway, deleteGiveaway } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function GiveawaysAdmin() {
  const sb = await supabaseServer();
  const { data: giveaways } = await sb.from("giveaways").select("id, month, prize, product_sku, closes_at, created_at").order("created_at", { ascending: false });
  const list = giveaways ?? [];
  // tallies per giveaway
  const ids = list.map((g) => g.id);
  const [{ data: noms }, { data: votes }] = await Promise.all([
    ids.length ? sb.from("giveaway_nominees").select("giveaway_id, user_id") : Promise.resolve({ data: [] as { giveaway_id: string; user_id: string }[] }),
    ids.length ? sb.from("giveaway_votes").select("giveaway_id, nominee_id") : Promise.resolve({ data: [] as { giveaway_id: string; nominee_id: string }[] }),
  ]);
  const nomCount = (gid: string) => (noms ?? []).filter((n) => n.giveaway_id === gid).length;
  const voteCount = (gid: string) => (votes ?? []).filter((v) => v.giveaway_id === gid).length;

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "9px 11px", width: "100%" };
  const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ THE DRAW ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Giveaways</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 22px" }}>Monthly community-voted draws. Free to enter (no purchase). The newest giveaway shows in the app.</p>

      <form action={createGiveaway} style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "16px 18px", display: "grid", gap: 10, maxWidth: 560, marginBottom: 26 }}>
        <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>New giveaway</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Month</label><input name="month" placeholder="2026-06" style={inp} /></div>
          <div><label style={lbl}>Closes</label><input name="closes_at" type="date" style={inp} /></div>
        </div>
        <div><label style={lbl}>Prize</label><input name="prize" placeholder="Sons of Fire Tee + R500 to your charity" style={inp} /></div>
        <div><label style={lbl}>Product SKU (optional)</label><input name="product_sku" style={inp} /></div>
        <div><button type="submit" style={btnGold}>Create giveaway</button></div>
      </form>

      {list.length === 0 ? <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No giveaways yet.</p> : (
        <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
          {list.map((g, i) => (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD }}>{g.month}{i === 0 ? " · LIVE" : ""}</span>
                <div style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{g.prize}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A" }}>{nomCount(g.id)} nominees · {voteCount(g.id)} votes{g.closes_at ? ` · closes ${new Date(g.closes_at).toISOString().slice(0, 10)}` : ""}</div>
              </div>
              <form action={deleteGiveaway}><input type="hidden" name="id" value={g.id} /><button style={btnGhost}>DELETE</button></form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const btnGold: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "10px 16px", cursor: "pointer" };
const btnGhost: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: "#C03A3A", background: "rgba(192,58,58,0.06)", border: "1px solid rgba(192,58,58,0.4)", borderRadius: 10, padding: "7px 11px", cursor: "pointer" };
