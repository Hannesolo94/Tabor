// Admin management: grant/revoke admin access by email. Safeguards prevent
// self-demotion and removing the last admin.
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { grantAdmin, revokeAdmin } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Admins() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const admin = supabaseAdmin();
  const { data: admins } = await admin.from("profiles").select("user_id, email, name").eq("role", "admin").order("email");
  const list = admins ?? [];

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "11px 13px" };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ THE COUNCIL ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Admins</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 22px", maxWidth: 560 }}>
        Admins have full access to this dashboard: moderation, tickets, orders, content, everything. Grant access by email. The person must have created an account first (on the app or via the admin login) so they have a password.
      </p>

      <form action={grantAdmin} style={{ display: "flex", gap: 8, maxWidth: 520, marginBottom: 26 }}>
        <input name="email" type="email" placeholder="brother@email.com" style={{ ...inp, flex: 1 }} />
        <button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "0 18px", cursor: "pointer" }}>Grant admin</button>
      </form>

      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.16em", marginBottom: 10 }}>CURRENT ADMINS · {list.length}</div>
      <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12" }}>
        {list.map((a, i) => {
          const isSelf = a.user_id === user?.id;
          return (
            <div key={a.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div>
                <span style={{ fontFamily: BODY, fontSize: 14.5, color: "#E8E2D5" }}>{a.name || a.email}</span>
                {a.name ? <span style={{ fontFamily: MONO, fontSize: 11, color: "#8A847A" }}> · {a.email}</span> : null}
                {isSelf ? <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em" }}> · YOU</span> : null}
              </div>
              {!isSelf && list.length > 1 ? (
                <form action={revokeAdmin}><input type="hidden" name="user_id" value={a.user_id} /><button style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: "#C03A3A", background: "none", border: "1px solid rgba(192,58,58,0.4)", padding: "7px 11px", cursor: "pointer" }}>REVOKE</button></form>
              ) : <span style={{ fontFamily: MONO, fontSize: 9, color: "#6e6a60" }}>{isSelf ? "—" : "LAST ADMIN"}</span>}
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily: BODY, fontSize: 12, color: "#8A847A", marginTop: 12 }}>You cannot remove yourself, and the last admin cannot be removed (prevents lockout). Moderation of group chats lives under <strong>Community → Moderation</strong>; app support requests under <strong>Community → Tickets</strong>.</p>
    </div>
  );
}
