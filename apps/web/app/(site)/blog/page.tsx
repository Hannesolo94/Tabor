import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog-db";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "The Scroll", description: "Words for the brotherhood: scripture, training, and the fight to not drift.", alternates: { canonical: "/blog" } };

export default async function BlogIndex() {
  const posts = await getPublishedPosts();
  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh" }}>
      <section style={{ padding: "60px 24px 24px", borderBottom: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>[ THE SCROLL ]</div>
          <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(40px,8vw,80px)", color: "#E8E2D5", margin: 0, lineHeight: 0.95 }}>The Scroll</h1>
          <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A", maxWidth: 580, margin: "14px 0 0", lineHeight: 1.6 }}>Words for the brotherhood. Scripture, discipline, and the daily fight to not drift.</p>
        </div>
      </section>
      <section style={{ padding: "34px 24px 80px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {posts.length === 0 ? (
            <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A" }}>No entries yet. Soon.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="tabor-lift" style={{ textDecoration: "none", border: "1px solid rgba(201,169,97,0.16)", background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))", borderRadius: 18, boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)", overflow: "hidden", display: "block" }}>
                  {p.cover_image && <div style={{ aspectRatio: "16/9", background: `#15151A url(${p.cover_image}) center/cover` }} />}
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em" }}>{(p.published_at ?? p.scheduled_for) ? new Date((p.published_at ?? p.scheduled_for) as string).toISOString().slice(0, 10) : ""}</div>
                    <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 20, color: "#E8E2D5", margin: "6px 0 8px" }}>{p.title}</h2>
                    {p.excerpt && <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A", margin: 0, lineHeight: 1.55 }}>{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
