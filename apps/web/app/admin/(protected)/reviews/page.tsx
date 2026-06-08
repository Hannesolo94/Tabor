// Review moderation. Approve / reject / delete, see media, filter by status.
import { supabaseServer } from "@/lib/supabase/server";
import { Stars } from "@/components/reviews/Stars";
import { approveReview, rejectReview, deleteReview } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "approved", "rejected"] as const;

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = (STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "pending";

  const sb = await supabaseServer();
  const { data: reviews } = await sb.from("reviews").select("*").eq("status", status).order("created_at", { ascending: false });
  const ids = (reviews ?? []).map((r) => r.id);
  const { data: media } = ids.length ? await sb.from("review_media").select("review_id, type, url").in("review_id", ids) : { data: [] };
  const mediaBy = new Map<string, { type: string; url: string }[]>();
  for (const m of media ?? []) {
    const a = mediaBy.get(m.review_id) ?? [];
    a.push(m);
    mediaBy.set(m.review_id, a);
  }

  const counts: Record<string, number> = {};
  for (const s of STATUSES) {
    const { count } = await sb.from("reviews").select("id", { count: "exact", head: true }).eq("status", s);
    counts[s] = count ?? 0;
  }

  const btn: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid rgba(201,169,97,0.3)", borderRadius: 10, padding: "8px 12px", cursor: "pointer", background: "rgba(201,169,97,0.05)", color: "#C3BDB1" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ SOCIAL PROOF ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Reviews</h1>
        </div>
        <a href="/admin/reviews/export" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8D08C", border: `1px solid ${GOLD}55`, borderRadius: 12, background: "rgba(201,169,97,0.06)", padding: "10px 16px", textDecoration: "none" }}>Export CSV</a>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {STATUSES.map((s) => (
          <a key={s} href={`/admin/reviews?status=${s}`} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", padding: "8px 14px", borderRadius: 10, border: `1px solid ${GOLD}44`, color: status === s ? "#1a1408" : "#9A948A", fontWeight: status === s ? 700 : 400, boxShadow: status === s ? "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)" : undefined, background: status === s ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "transparent" }}>
            {s} ({counts[s]})
          </a>
        ))}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {(reviews ?? []).length === 0 ? (
          <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No {status} reviews.</p>
        ) : (
          (reviews ?? []).map((r) => (
            <div key={r.id} style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Stars rating={r.rating} />
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "#9A948A" }}>{r.name} · {r.sku ?? "—"}</span>
                </span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>{new Date(r.created_at).toISOString().slice(0, 10)}{r.consent ? " · CONSENT ✓" : ""}</span>
              </div>
              {r.title && <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginTop: 8 }}>{r.title}</div>}
              <p style={{ fontFamily: BODY, fontSize: 13.5, color: "#C3BDB1", lineHeight: 1.6, margin: "6px 0 0" }}>{r.body}</p>
              {(mediaBy.get(r.id) ?? []).length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {(mediaBy.get(r.id) ?? []).map((m, i) => (
                    <div key={i} style={{ width: 70, height: 70, border: `1px solid ${GOLD}33`, borderRadius: 10, overflow: "hidden", background: "#15151A" }}>
                      {m.type === "video" ? <video src={m.url} muted controls style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {status !== "approved" && <form action={approveReview}><input type="hidden" name="id" value={r.id} /><button style={{ ...btn, color: "#7BBF7B", borderColor: "rgba(123,191,123,0.4)" }}>Approve</button></form>}
                {status !== "rejected" && <form action={rejectReview}><input type="hidden" name="id" value={r.id} /><button style={btn}>Reject</button></form>}
                <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button style={{ ...btn, color: "#C03A3A", borderColor: "rgba(192,58,58,0.4)" }}>Delete</button></form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
