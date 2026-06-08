// Tickets: in-app bug + feature reports. Screenshots via signed URLs (private bucket).
import { supabaseServer } from "@/lib/supabase/server";
import { setReportStatus } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Tickets() {
  const sb = await supabaseServer();
  const { data: reports } = await sb.from("bug_reports").select("id, kind, title, body, screenshots, device, app_version, status, created_at").order("created_at", { ascending: false }).limit(200);
  const list = reports ?? [];

  // sign screenshot URLs
  const signed: Record<string, string[]> = {};
  for (const r of list) {
    if (r.screenshots?.length) {
      const urls: string[] = [];
      for (const p of r.screenshots) {
        const { data } = await sb.storage.from("reports").createSignedUrl(p, 3600);
        if (data?.signedUrl) urls.push(data.signedUrl);
      }
      signed[r.id] = urls;
    }
  }
  const open = list.filter((r) => r.status === "open").length;

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ THE QUEUE ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Tickets</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 22px" }}>{open} open · {list.length} total. Reports come straight from the app (Settings → Report a problem).</p>

      {list.length === 0 ? <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No reports yet.</p> : (
        <div style={{ display: "grid", gap: 12 }}>
          {list.map((r) => (
            <div key={r.id} style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: r.kind === "bug" ? "#C03A3A" : GOLD }}>{r.kind === "bug" ? "● BUG" : "✦ FEATURE"}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}> · {r.device} · v{r.app_version} · {new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</span>
                  <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginTop: 4 }}>{r.title}</div>
                  {r.body ? <p style={{ fontFamily: BODY, fontSize: 13, color: "#B8B2A6", lineHeight: 1.6, margin: "4px 0 0" }}>{r.body}</p> : null}
                  {signed[r.id]?.length ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {signed[r.id].map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer"><img src={u} alt="screenshot" style={{ width: 90, height: 90, objectFit: "cover", border: `1px solid ${GOLD}33`, borderRadius: 10 }} /></a>)}
                    </div>
                  ) : null}
                </div>
                <span style={{ fontFamily: MONO, fontSize: 9, padding: "4px 8px", border: `1px solid ${GOLD}33`, borderRadius: 8, color: r.status === "resolved" ? "#7BBF7B" : r.status === "triaged" ? GOLD : "#C03A3A", whiteSpace: "nowrap" }}>{r.status.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {(["open", "triaged", "resolved"] as const).filter((s) => s !== r.status).map((s) => (
                  <form key={s} action={setReportStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value={s} /><button style={btn}>MARK {s.toUpperCase()}</button></form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const btn: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: GOLD, background: "rgba(201,169,97,0.05)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "7px 11px", cursor: "pointer" };
