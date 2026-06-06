import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { createPost } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  const sb = await supabaseServer();
  const { data } = await sb.from("posts").select("id, title, slug, status, published_at, updated_at").order("updated_at", { ascending: false });
  const posts = data ?? [];

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ CONTENT ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 22px" }}>Blog</h1>

      {posts.length > 0 && (
        <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12", marginBottom: 20 }}>
          {posts.map((p, i) => (
            <Link key={p.id} href={`/admin/blog/${p.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none", textDecoration: "none" }}>
              <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{p.title} <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>· /{p.slug}</span></span>
              <span style={{ fontFamily: MONO, fontSize: 9, color: p.status === "published" ? "#7BBF7B" : "#8A847A", letterSpacing: "0.08em" }}>{p.status === "published" ? "● LIVE" : "○ DRAFT"}</span>
            </Link>
          ))}
        </div>
      )}

      <form action={createPost} style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12", padding: "18px 20px", display: "flex", gap: 10, maxWidth: 560 }}>
        <input name="title" placeholder="New post title…" required style={{ flex: 1, fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "11px 13px" }} />
        <button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "11px 18px", cursor: "pointer" }}>Create</button>
      </form>
    </div>
  );
}
