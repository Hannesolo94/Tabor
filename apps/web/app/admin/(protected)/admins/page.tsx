// Admin management: grant/revoke admin access by email. Safeguards prevent
// self-demotion and removing the last admin.
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-guard";
import { revokeAdmin } from "./actions";
import { InviteForm } from "./InviteForm";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const btnGhost: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: "#C03A3A", background: "rgba(192,58,58,0.06)", border: "1px solid rgba(192,58,58,0.4)", borderRadius: 10, padding: "7px 11px", cursor: "pointer" };

export default async function Admins() {
  await requireAdmin();
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const admin = supabaseAdmin();
  const { data: admins } = await admin.from("profiles").select("user_id, email, name, role").in("role", ["admin", "moderator"]).order("role").order("email");
  const list = admins ?? [];
  const adminCount = list.filter((a) => a.role === "admin").length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ THE COUNCIL ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Staff</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0", maxWidth: 600 }}>
          <strong style={{ color: "#E8E2D5" }}>Admins</strong> have full access. <strong style={{ color: "#E8E2D5" }}>Moderators</strong> see only the dashboard + community tools (Moderation, Tickets, Giveaways) — not settings, keys, or staff. Invite by email: if they have no account, one is created and they get a sign-in email.
        </p>
      </div>

      <InviteForm />

      <div className="admin-card" style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px 0" }}><div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase" }}>Current staff · {list.length}</div></div>
        {list.map((a, i) => {
          const isSelf = a.user_id === user?.id;
          const canRevoke = !isSelf && (a.role === "moderator" || adminCount > 1);
          return (
            <div key={a.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: i === 0 ? 12 : 0 }}>
              <div>
                <span style={{ fontFamily: MONO, fontSize: 8.5, color: a.role === "admin" ? GOLD : "#8A847A", letterSpacing: "0.1em", border: `1px solid ${a.role === "admin" ? GOLD : "#8A847A"}55`, borderRadius: 8, padding: "2px 6px", marginRight: 8 }}>{a.role === "admin" ? "ADMIN" : "MOD"}</span>
                <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{a.name || a.email}</span>
                {a.name ? <span style={{ fontFamily: MONO, fontSize: 11, color: "#8A847A" }}> · {a.email}</span> : null}
                {isSelf ? <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em" }}> · YOU</span> : null}
              </div>
              {canRevoke ? (
                <form action={revokeAdmin}><input type="hidden" name="user_id" value={a.user_id} /><button style={btnGhost}>REVOKE</button></form>
              ) : <span style={{ fontFamily: MONO, fontSize: 9, color: "#6e6a60" }}>{isSelf ? "—" : "LAST ADMIN"}</span>}
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#8A847A", marginTop: 14 }}>You cannot remove yourself, and the last admin cannot be removed (prevents lockout). Moderation of group chats lives under <strong>Community → Moderation</strong>; app support requests under <strong>Community → Tickets</strong>.</p>
    </div>
  );
}
