// Community broadcasts: push an announcement to every app user's inbox.
// (Future: cross-post to Discord + Instagram from the same composer.)
import { supabaseServer } from "@/lib/supabase/server";
import { sendBroadcast, sendTestEmail } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const sb = await supabaseServer();
  const [{ data: sent }, { count: users }, { data: resend }] = await Promise.all([
    sb.from("broadcasts").select("title, body, sent_by, audience, created_at").order("created_at", { ascending: false }).limit(30),
    sb.from("profiles").select("user_id", { count: "exact", head: true }),
    sb.from("integrations").select("enabled, secret").eq("provider", "resend").maybeSingle(),
  ]);
  const emailReady = !!(resend?.secret && resend?.enabled);
  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "11px 13px", width: "100%" };
  const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ COMMUNITY ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 8px" }}>Broadcast</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 24px" }}>Push an announcement to every member's in-app inbox ({users ?? 0} {users === 1 ? "member" : "members"}). Discord + Instagram cross-posting connect here later.</p>

      {/* email provider status + test */}
      <div style={{ border: `1px solid ${emailReady ? "rgba(123,191,123,0.4)" : GOLD + "44"}`, background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "14px 18px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, maxWidth: 560 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: emailReady ? "#7BBF7B" : GOLD, letterSpacing: "0.1em" }}>{emailReady ? "● EMAIL CONNECTED" : "○ EMAIL NOT CONNECTED"}</div>
          <div style={{ fontFamily: BODY, fontSize: 12, color: "#9A948A", marginTop: 3 }}>{emailReady ? "Resend is live. Send yourself a test." : "Add a Resend API key in Settings > Integrations (provider: resend) to send emails."}</div>
        </div>
        <form action={sendTestEmail}><button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8D08C", border: `1px solid ${GOLD}55`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", background: "rgba(201,169,97,0.06)" }}>Send test email to me</button></form>
      </div>

      <form action={sendBroadcast} style={{ display: "grid", gap: 12, maxWidth: 560, marginBottom: 30 }}>
        <div><label style={lbl}>Title</label><input name="title" required placeholder="e.g. New drop is live" style={inp} /></div>
        <div><label style={lbl}>Message</label><textarea name="body" rows={4} placeholder="Speak to the brotherhood..." style={{ ...inp, resize: "vertical" }} /></div>
        <div><label style={lbl}>Deep link (optional)</label><input name="deep_link" placeholder="tabor://shop or https://tabor.quest/..." style={inp} /></div>
        <label style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="email" defaultChecked={false} /> Also email members {emailReady ? "" : "(needs email provider)"}</label>
        <div><button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "12px 22px", cursor: "pointer" }}>Send to all members</button></div>
      </form>

      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginBottom: 10 }}>Sent</div>
      {(sent ?? []).length === 0 ? (
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No broadcasts yet.</p>
      ) : (
        <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
          {(sent ?? []).map((b, i) => (
            <div key={i} style={{ padding: "13px 16px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5", fontWeight: 600 }}>{b.title}</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>{b.audience} sent · {new Date(b.created_at).toISOString().slice(0, 10)}</span>
              </div>
              {b.body && <div style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", marginTop: 4 }}>{b.body}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
