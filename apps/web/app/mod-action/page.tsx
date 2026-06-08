// Secure, token-gated quick-moderation page opened from the auto-mod email.
// No login required — the unguessable token authorizes the action.
import { supabaseAdmin } from "@/lib/supabase/admin";
import { quickBan, quickRelease } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function ModAction({ searchParams }: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  const admin = supabaseAdmin();
  const { data: rep } = token ? await admin.from("reports").select("id, target_user, message_id, status, detail").eq("action_token", token).maybeSingle() : { data: null };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
  const card: React.CSSProperties = { maxWidth: 520, width: "100%", background: "#0E0E12", border: "1px solid rgba(201,169,97,0.28)", padding: "30px 28px" };
  const h = (t: string) => <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 22, color: "#E8E2D5", margin: "8px 0 12px" }}>{t}</h1>;
  const tag = <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.2em" }}>[ TABOR MODERATION ]</div>;

  if (sp.done) {
    const msg = sp.done === "ban" ? "User banned. They can no longer post." : sp.done === "release" ? "Released. The silence is lifted and the message restored." : "This action was already handled.";
    return <div style={wrap}><div style={card}>{tag}{h("Done")}<p style={{ fontFamily: BODY, fontSize: 15, color: "#C3BDB1", lineHeight: 1.6 }}>{msg}</p><a href="/admin/moderation" style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.1em", textDecoration: "none" }}>OPEN FULL MODERATION →</a></div></div>;
  }
  if (!rep || rep.status !== "open") {
    return <div style={wrap}><div style={card}>{tag}{h("Already handled")}<p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A", lineHeight: 1.6 }}>This violation has already been actioned or the link is invalid.</p><a href="/admin/moderation" style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.1em", textDecoration: "none" }}>OPEN FULL MODERATION →</a></div></div>;
  }

  const btn = (bg: string, color: string): React.CSSProperties => ({ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color, background: bg, border: bg === "none" ? `1px solid ${GOLD}55` : "none", padding: "13px 18px", cursor: "pointer", width: "100%" });

  return (
    <div style={wrap}>
      <div style={card}>
        {tag}{h("Auto-mod flagged a message")}
        <div style={{ fontFamily: BODY, fontSize: 13.5, color: "#9A948A", lineHeight: 1.6, marginBottom: 6 }}>{rep.detail}</div>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#8A847A", lineHeight: 1.6, marginBottom: 18 }}>The message is already hidden and the user is silenced for 24 hours. Choose what happens next:</p>
        <div style={{ display: "grid", gap: 10 }}>
          <form action={quickBan}><input type="hidden" name="token" value={token} /><button style={btn("none", "#C03A3A")}>Ban permanently</button></form>
          <form action={quickRelease}><input type="hidden" name="token" value={token} /><button style={btn("none", "#7BBF7B")}>Release · false alarm</button></form>
          <a href="/admin/moderation" style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, color: GOLD, letterSpacing: "0.1em", textDecoration: "none", padding: "8px" }}>OPEN FULL MODERATION →</a>
        </div>
      </div>
    </div>
  );
}
