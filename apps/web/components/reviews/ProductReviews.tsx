// Reviews block for the product page: summary, list (with UGC media), and the
// write-a-review form.
import { Stars } from "./Stars";
import { ReviewForm } from "./ReviewForm";
import type { Review } from "@/lib/reviews-db";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export function ProductReviews({ sku, reviews, summary }: { sku: string; reviews: Review[]; summary: { count: number; avg: number } }) {
  return (
    <section style={{ padding: "0 24px 70px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", borderTop: "1px solid rgba(201,169,97,0.12)", paddingTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 24, color: "#E8E2D5", margin: 0 }}>Reviews</h2>
          {summary.count > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Stars rating={summary.avg} size={16} />
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#9A948A", letterSpacing: "0.08em" }}>{summary.avg.toFixed(1)} · {summary.count} {summary.count === 1 ? "REVIEW" : "REVIEWS"}</span>
            </span>
          )}
        </div>

        <ReviewForm sku={sku} />

        <div style={{ marginTop: 28, display: "grid", gap: 16 }}>
          {reviews.length === 0 ? (
            <p style={{ fontFamily: BODY, fontSize: 14, color: "#7A746A" }}>No reviews yet. Be the first.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} style={{ border: "1px solid rgba(201,169,97,0.16)", background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <Stars rating={r.rating} />
                  <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#8A847A", letterSpacing: "0.08em" }}>{new Date(r.created_at).toISOString().slice(0, 10)}</span>
                </div>
                {r.title && <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginTop: 8 }}>{r.title}</div>}
                <p style={{ fontFamily: BODY, fontSize: 14, color: "#C3BDB1", lineHeight: 1.6, margin: "6px 0 0" }}>{r.body}</p>
                {r.media.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    {r.media.map((m, i) => (
                      <div key={i} style={{ width: 88, height: 88, border: `1px solid ${GOLD}33`, borderRadius: 12, overflow: "hidden", background: "#15151A" }}>
                        {m.type === "video" ? (
                          <video src={m.url} controls muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: GOLD, letterSpacing: "0.1em", marginTop: 10, textTransform: "uppercase" }}>— {r.name}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
