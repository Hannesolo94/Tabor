import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { createPost } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const cardTitle: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px", width: "100%" };
const goldBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };

const DEST: [string, string][] = [["app", "📱"], ["email", "✉️"], ["blog", "🌐"], ["instagram", "IG"], ["tiktok", "TT"]];

export default async function AdminBlog() {
  const sb = await supabaseServer();
  const { data } = await sb.from("posts").select("id, title, slug, status, type, targets, updated_at").order("updated_at", { ascending: false });
  const posts = (data ?? []) as { id: string; title: string; slug: string; status: string; type: string | null; targets: Record<string, boolean> | null }[];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ STUDIO ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Content Studio</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0", maxWidth: 640 }}>One composer, many destinations. Build a post — reel, carousel, video, gif, or static — and publish it to the app feed, email, the website blog, and social. Or drop media and a brief and have it drafted for you.</p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {posts.length > 0 && (
          <div className="admin-card" style={{ ...cardStyle, padding: "8px 20px 10px" }}>
            {posts.map((p, i) => {
              const t = p.targets ?? {};
              return (
                <Link key={p.id} href={`/admin/blog/${p.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "13px 0", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none", textDecoration: "none" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: GOLD, border: `1px solid ${GOLD}55`, borderRadius: 6, padding: "2px 6px", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>{p.type ?? "static"}</span>
                    <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ display: "flex", gap: 5 }}>
                      {DEST.filter(([k]) => t[k]).map(([k, icon]) => (
                        <span key={k} style={{ fontFamily: MONO, fontSize: k === "instagram" || k === "tiktok" ? 8 : 11, color: "#9A948A" }}>{icon}</span>
                      ))}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: p.status === "published" ? "#7BBF7B" : "#8A847A", letterSpacing: "0.08em" }}>{p.status === "published" ? "● LIVE" : "○ DRAFT"}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <form action={createPost} className="admin-card" style={{ ...cardStyle, maxWidth: 560 }}>
          <div style={cardTitle}>New post</div>
          <label style={lbl}>Title</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input name="title" placeholder="Name it — then build it in the composer…" required style={{ ...inp, flex: 1 }} />
            <button type="submit" style={goldBtn}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
