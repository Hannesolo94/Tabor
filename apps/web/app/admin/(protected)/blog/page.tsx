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

export default async function AdminBlog() {
  const sb = await supabaseServer();
  const { data } = await sb.from("posts").select("id, title, slug, status, published_at, updated_at").order("updated_at", { ascending: false });
  const posts = data ?? [];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ CONTENT ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Blog</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>Write and publish posts. Drafts stay hidden until you set them live.</p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {posts.length > 0 && (
          <div className="admin-card" style={{ ...cardStyle, padding: "8px 20px 10px" }}>
            {posts.map((p, i) => (
              <Link key={p.id} href={`/admin/blog/${p.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none", textDecoration: "none" }}>
                <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{p.title} <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>· /{p.slug}</span></span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: p.status === "published" ? "#7BBF7B" : "#8A847A", letterSpacing: "0.08em" }}>{p.status === "published" ? "● LIVE" : "○ DRAFT"}</span>
              </Link>
            ))}
          </div>
        )}

        <form action={createPost} className="admin-card" style={{ ...cardStyle, maxWidth: 560 }}>
          <div style={cardTitle}>New post</div>
          <label style={lbl}>Title</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input name="title" placeholder="New post title…" required style={{ ...inp, flex: 1 }} />
            <button type="submit" style={goldBtn}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
