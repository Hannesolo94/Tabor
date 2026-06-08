// Moderation queue: review reported messages/users and act (delete, ban, dismiss).
import { supabaseAdmin } from "@/lib/supabase/admin";
import { deleteReportedMessage, banUser, dismissReport, deleteMessage, silenceUser, banUserById } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const admin = supabaseAdmin();
  const { data: reports } = await admin.from("reports").select("id, reporter, target_user, message_id, reason, detail, status, created_at").eq("status", "open").order("created_at", { ascending: false }).limit(100);
  const list = reports ?? [];

  // hydrate message bodies + names
  const msgIds = list.map((r) => r.message_id).filter(Boolean) as string[];
  const userIds = [...new Set(list.flatMap((r) => [r.reporter, r.target_user]).filter(Boolean))] as string[];
  const [{ data: msgs }, { data: profs }] = await Promise.all([
    msgIds.length ? admin.from("messages").select("id, body").in("id", msgIds) : Promise.resolve({ data: [] as { id: string; body: string }[] }),
    userIds.length ? admin.from("profiles").select("user_id, name, handle, banned").in("user_id", userIds) : Promise.resolve({ data: [] as { user_id: string; name: string; handle: string; banned: boolean }[] }),
  ]);
  const bodyBy = new Map((msgs ?? []).map((m) => [m.id, m.body]));
  const profBy = new Map((profs ?? []).map((p) => [p.user_id, p]));
  const { count: banned } = await admin.from("profiles").select("user_id", { count: "exact", head: true }).eq("banned", true);

  // proactive: recent guild messages (includes auto-hidden, marked for staff)
  const { data: recent } = await admin.from("messages").select("id, body, author_id, created_at, hidden").not("channel_id", "is", null).order("created_at", { ascending: false }).limit(40);
  const recentList = recent ?? [];
  const authorIds = [...new Set(recentList.map((m) => m.author_id).filter(Boolean))] as string[];
  const { data: authorProfs } = authorIds.length ? await admin.from("profiles").select("user_id, name, handle, banned").in("user_id", authorIds) : { data: [] as { user_id: string; name: string; handle: string; banned: boolean }[] };
  const authorBy = new Map((authorProfs ?? []).map((p) => [p.user_id, p]));

  const btn = (bg: string, color: string): React.CSSProperties => {
    const primary = bg !== "none";
    return { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: primary ? "#1a1408" : color, fontWeight: primary ? 700 : 400, background: primary ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.05)", border: primary ? "none" : `1px solid ${GOLD}44`, borderRadius: 10, boxShadow: primary ? "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)" : undefined, padding: "8px 12px", cursor: "pointer" };
  };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ TRUST & SAFETY ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 8px" }}>Moderation</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 22px" }}>{list.length} open {list.length === 1 ? "report" : "reports"} · {banned ?? 0} banned. Reports come from members holding a message and tapping report.</p>

      {list.length === 0 ? (
        <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A" }}>Nothing to review. The brotherhood is at peace.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {list.map((r) => {
            const target = r.target_user ? profBy.get(r.target_user) : null;
            const reporter = r.reporter ? profBy.get(r.reporter) : null;
            return (
              <div key={r.id} style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9.5, color: GOLD, letterSpacing: "0.1em" }}>{r.reason.toUpperCase()} · {new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>reported by {reporter?.name ?? "—"}</span>
                </div>
                {r.message_id && <div style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", borderLeft: `3px solid ${GOLD}55`, borderRadius: 10, padding: "10px 12px", margin: "10px 0" }}>{bodyBy.get(r.message_id) ?? "(message deleted)"}</div>}
                {r.detail && <div style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", marginBottom: 8 }}>{r.detail}</div>}
                <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", marginBottom: 10 }}>against: {target?.name ?? "—"} {target?.handle ? `@${target.handle}` : ""} {target?.banned ? "· ALREADY BANNED" : ""}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {r.message_id && <form action={deleteReportedMessage}><input type="hidden" name="report_id" value={r.id} /><input type="hidden" name="message_id" value={r.message_id} /><button style={btn(`linear-gradient(180deg,#E8D08C,${GOLD})`, "#0A0A0A")}>Delete message</button></form>}
                  {r.target_user && <form action={banUser}><input type="hidden" name="report_id" value={r.id} /><input type="hidden" name="user_id" value={r.target_user} /><button style={btn("none", "#C03A3A")}>Ban user</button></form>}
                  <form action={dismissReport}><input type="hidden" name="report_id" value={r.id} /><button style={btn("none", "#9A948A")}>Dismiss</button></form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* proactive moderation: act on any recent guild message without a report */}
      <div style={{ marginTop: 34 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.16em", marginBottom: 10 }}>RECENT GUILD CHAT · ACT WITHOUT A REPORT</div>
        {recentList.length === 0 ? <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No guild messages yet.</p> : (
          <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
            {recentList.map((m, i) => {
              const a = m.author_id ? authorBy.get(m.author_id) : null;
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 14px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: a?.banned ? "#C03A3A" : "#8A847A" }}>{a?.name ?? "Brother"}{a?.handle ? ` @${a.handle}` : ""} · {new Date(m.created_at).toISOString().slice(11, 16)}{m.hidden ? " · AUTO-HIDDEN" : ""}</span>
                    <div style={{ fontFamily: BODY, fontSize: 13.5, color: m.hidden ? "#8A847A" : "#E8E2D5", textDecoration: m.hidden ? "line-through" : "none" }}>{m.body}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <form action={deleteMessage}><input type="hidden" name="message_id" value={m.id} /><button style={btn("none", "#9A948A")}>Delete</button></form>
                    {m.author_id && <form action={silenceUser}><input type="hidden" name="user_id" value={m.author_id} /><button style={btn("none", GOLD)}>Silence</button></form>}
                    {m.author_id && <form action={banUserById}><input type="hidden" name="user_id" value={m.author_id} /><button style={btn("none", "#C03A3A")}>Ban</button></form>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
