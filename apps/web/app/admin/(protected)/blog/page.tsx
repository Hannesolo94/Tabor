import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { createPost, approveAndPublish, requestChanges } from "./actions";
import { SocialBadge } from "./SocialBadge";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const cardTitle: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px", width: "100%" };
const goldBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };
const ghostBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C3BDB1", background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}44`, borderRadius: 10, padding: "9px 14px", cursor: "pointer" };
const DEST: [string, string][] = [["app", "📱"], ["email", "✉️"], ["blog", "🌐"], ["instagram", "IG"], ["tiktok", "TT"]];

interface Row { id: string; title: string; slug: string; status: string; type: string | null; targets: Record<string, boolean> | null; body: string; excerpt: string | null }

function destIcons(t: Record<string, boolean>) {
  return DEST.filter(([k]) => t[k]).map(([k, icon]) => (
    <span key={k} style={{ fontFamily: MONO, fontSize: k === "instagram" || k === "tiktok" ? 8 : 11, color: "#9A948A" }}>{icon}</span>
  ));
}

export default async function AdminBlog() {
  const sb = await supabaseServer();
  const { data } = await sb.from("posts").select("id, title, slug, status, type, targets, body, excerpt, updated_at").order("updated_at", { ascending: false });
  const posts = (data ?? []) as Row[];
  const review = posts.filter((p) => p.status === "review");
  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ STUDIO ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Content Studio</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0", maxWidth: 640 }}>One composer, many destinations. Build a post or draft one from a brief. Drafts land in Ready for Review for your approval before anything goes live.</p>
      </div>

      <div style={{ display: "grid", gap: 22 }}>
        {/* Ready for review */}
        {review.length > 0 && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.14em", marginBottom: 10 }}>● READY FOR REVIEW · {review.length}</div>
            <div style={{ display: "grid", gap: 12 }}>
              {review.map((p) => (
                <div key={p.id} className="admin-card" style={{ ...cardStyle, borderColor: `${GOLD}44` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Link href={`/admin/blog/${p.id}`} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 16, color: "#E8E2D5", textDecoration: "none" }}>{p.title}</Link>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 8, color: GOLD, border: `1px solid ${GOLD}55`, borderRadius: 6, padding: "2px 6px", textTransform: "uppercase" }}>{p.type ?? "static"}</span>
                      {destIcons(p.targets ?? {})}
                    </span>
                  </div>
                  <p style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", lineHeight: 1.6, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{(p.body || p.excerpt || "").slice(0, 320)}{(p.body || "").length > 320 ? "…" : ""}</p>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <form action={approveAndPublish}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" style={goldBtn}>Approve &amp; Publish</button>
                    </form>
                    <Link href={`/admin/blog/${p.id}`} style={{ ...ghostBtn, textDecoration: "none", display: "inline-block" }}>Edit</Link>
                    <form action={requestChanges} style={{ display: "flex", gap: 8, flex: 1, minWidth: 240, alignItems: "stretch" }}>
                      <input type="hidden" name="id" value={p.id} />
                      <input name="feedback" placeholder="Request changes (e.g. shorter, add the verse, more hype)…" style={{ ...inp, flex: 1 }} />
                      <button type="submit" style={ghostBtn}>Re-draft</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New post */}
        <form action={createPost} className="admin-card" style={{ ...cardStyle, maxWidth: 560 }}>
          <div style={cardTitle}>New post</div>
          <label style={lbl}>Title</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input name="title" placeholder="Name it — then build it in the composer…" required style={{ ...inp, flex: 1 }} />
            <button type="submit" style={goldBtn}>Create</button>
          </div>
        </form>

        {/* Drafts */}
        {drafts.length > 0 && (
          <Section title={`DRAFTS · ${drafts.length}`} rows={drafts} />
        )}
        {/* Published */}
        {published.length > 0 && (
          <Section title={`PUBLISHED · ${published.length}`} rows={published} live />
        )}
      </div>
    </div>
  );
}

function Section({ title, rows, live }: { title: string; rows: Row[]; live?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.14em", marginBottom: 10 }}>{title}</div>
      <div className="admin-card" style={{ ...cardStyle, padding: "8px 20px 10px" }}>
        {rows.map((p, i) => (
          <Link key={p.id} href={`/admin/blog/${p.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "13px 0", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none", textDecoration: "none" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{ fontFamily: MONO, fontSize: 8, color: GOLD, border: `1px solid ${GOLD}55`, borderRadius: 6, padding: "2px 6px", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>{p.type ?? "static"}</span>
              <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              {live ? <SocialBadge postId={p.id} /> : null}
              <span style={{ display: "flex", gap: 5 }}>{destIcons(p.targets ?? {})}</span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: live ? "#7BBF7B" : "#8A847A", letterSpacing: "0.08em" }}>{live ? "● LIVE" : "○ DRAFT"}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
