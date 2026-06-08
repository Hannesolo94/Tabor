// Community broadcasts: push an announcement to every app user's inbox.
// (Future: cross-post to Discord + Instagram from the same composer.)
import { supabaseServer } from "@/lib/supabase/server";
import { sendBroadcast, sendTestEmail } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const cardTitle: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 };

export default async function CommunityPage() {
  const sb = await supabaseServer();
  const [{ data: sent }, { count: users }, { data: resend }] = await Promise.all([
    sb.from("broadcasts").select("title, body, sent_by, audience, created_at").order("created_at", { ascending: false }).limit(30),
    sb.from("profiles").select("user_id", { count: "exact", head: true }),
    sb.from("integrations").select("enabled, secret").eq("provider", "resend").maybeSingle(),
  ]);
  const emailReady = !!(resend?.secret && resend?.enabled);
  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px", width: "100%" };
  const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5, display: "block" };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ COMMUNITY ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Broadcast</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>Push an announcement to every member's in-app inbox ({users ?? 0} {users === 1 ? "member" : "members"}). Discord + Instagram cross-posting connect here later.</p>
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 620 }}>
        {/* email provider status + test */}
        <div className="admin-card" style={{ ...cardStyle, border: `1px solid ${emailReady ? "rgba(123,191,123,0.4)" : "rgba(201,169,97,0.14)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: emailReady ? "#7BBF7B" : GOLD, letterSpacing: "0.1em" }}>{emailReady ? "● EMAIL CONNECTED" : "○ EMAIL NOT CONNECTED"}</div>
            <div style={{ fontFamily: BODY, fontSize: 12, color: "#9A948A", marginTop: 3 }}>{emailReady ? "Resend is live. Send yourself a test." : "Add a Resend API key in Settings > Integrations (provider: resend) to send emails."}</div>
          </div>
          <form action={sendTestEmail}><button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8D08C", border: `1px solid ${GOLD}55`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", background: "rgba(201,169,97,0.06)" }}>Send test email to me</button></form>
        </div>

        {/* composer */}
        <form action={sendBroadcast} className="admin-card" style={cardStyle}>
          <div style={cardTitle}>New broadcast</div>
          <div style={{ display: "grid", gap: 12 }}>
            <div><label style={lbl}>Title</label><input name="title" required placeholder="e.g. New drop is live" style={inp} /></div>
            <div><label style={lbl}>Message</label><textarea name="body" rows={4} placeholder="Speak to the brotherhood..." style={{ ...inp, resize: "vertical" }} /></div>
            <div><label style={lbl}>Deep link (optional)</label><input name="deep_link" placeholder="tabor://shop or https://tabor.quest/..." style={inp} /></div>
            <label style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="email" defaultChecked={false} /> Also email members {emailReady ? "" : "(needs email provider)"}</label>
            <div><button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" }}>Send to all members</button></div>
          </div>
        </form>

        {/* sent log */}
        <div className="admin-card" style={cardStyle}>
          <div style={cardTitle}>Sent</div>
          {(sent ?? []).length === 0 ? (
            <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: 0 }}>No broadcasts yet.</p>
          ) : (
            (sent ?? []).map((b, i) => (
              <div key={i} style={{ padding: "13px 0", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5", fontWeight: 600 }}>{b.title}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>{b.audience} sent · {new Date(b.created_at).toISOString().slice(0, 10)}</span>
                </div>
                {b.body && <div style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", marginTop: 4 }}>{b.body}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
