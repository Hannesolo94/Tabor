// Brotherhood Feed: published Content-Studio posts that target the app, with
// reactions (Amen/Fire/Strength/Pray) and comments.
import { supabase } from "@/lib/supabase";

export const REACTIONS: { kind: string; label: string; glyph: string }[] = [
  { kind: "amen", label: "Amen", glyph: "✝" },     // ✝
  { kind: "fire", label: "Fire", glyph: "🔥" }, // 🔥
  { kind: "strength", label: "Strength", glyph: "💪" }, // 💪
  { kind: "pray", label: "Pray", glyph: "🙏" }, // 🙏
];

export interface FeedMedia { kind: string; url: string; poster_url: string | null }
export interface FeedPost {
  id: string; title: string; body: string; excerpt: string | null; author: string | null;
  type: string; cover_image: string | null; published_at: string | null;
  media: FeedMedia[]; reactionCount: number; reactions: Record<string, number>; myReaction: string | null; commentCount: number;
}
export interface FeedComment { id: string; user_id: string; body: string; created_at: string; name: string; avatar_url: string | null }

interface PostRow { id: string; title: string; body: string; excerpt: string | null; author: string | null; type: string | null; cover_image: string | null; published_at: string | null; scheduled_for?: string | null; targets: { app?: boolean } | null }

async function hydrate(posts: PostRow[], userId: string): Promise<FeedPost[]> {
  const ids = posts.map((p) => p.id);
  if (!ids.length) return [];
  const [{ data: media }, { data: reactions }, { data: comments }] = await Promise.all([
    supabase.from("post_media").select("post_id, kind, url, poster_url, sort").in("post_id", ids).order("sort", { ascending: true }),
    supabase.from("post_reactions").select("post_id, user_id, kind").in("post_id", ids),
    supabase.from("post_comments").select("post_id").in("post_id", ids),
  ]);
  const mediaBy = new Map<string, FeedMedia[]>();
  for (const m of media ?? []) { const a = mediaBy.get(m.post_id) ?? []; a.push({ kind: m.kind, url: m.url, poster_url: m.poster_url }); mediaBy.set(m.post_id, a); }
  const rxBy = new Map<string, Record<string, number>>();
  const mineBy = new Map<string, string>();
  for (const r of reactions ?? []) {
    const rec = rxBy.get(r.post_id) ?? {}; rec[r.kind] = (rec[r.kind] ?? 0) + 1; rxBy.set(r.post_id, rec);
    if (r.user_id === userId) mineBy.set(r.post_id, r.kind);
  }
  const ccBy = new Map<string, number>();
  for (const c of comments ?? []) ccBy.set(c.post_id, (ccBy.get(c.post_id) ?? 0) + 1);
  return posts.map((p) => {
    const rec = rxBy.get(p.id) ?? {};
    return {
      id: p.id, title: p.title, body: p.body, excerpt: p.excerpt, author: p.author, type: p.type ?? "static",
      cover_image: p.cover_image, published_at: p.published_at ?? p.scheduled_for ?? null,
      media: mediaBy.get(p.id) ?? [], reactions: rec, reactionCount: Object.values(rec).reduce((s, n) => s + n, 0),
      myReaction: mineBy.get(p.id) ?? null, commentCount: ccBy.get(p.id) ?? 0,
    };
  });
}

export async function getFeed(userId: string): Promise<FeedPost[]> {
  // published posts, plus scheduled posts whose time has arrived (they go live on the
  // dot; the dashboard sweep flips their status to published shortly after)
  const nowIso = new Date().toISOString();
  // order newest-first server-side and only pull app-targeted posts, so a busy
  // posts table can never starve the feed of recent entries.
  const { data } = await supabase.from("posts").select("id, title, body, excerpt, author, type, cover_image, published_at, scheduled_for, targets")
    .or(`status.eq.published,and(status.eq.scheduled,scheduled_for.lte.${nowIso})`)
    .eq("targets->>app", "true")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("scheduled_for", { ascending: false, nullsFirst: false })
    .limit(50);
  const liveAt = (p: PostRow) => new Date(p.published_at ?? p.scheduled_for ?? 0).getTime();
  const appPosts = ((data ?? []) as PostRow[]).filter((p) => p.targets?.app).sort((a, b) => liveAt(b) - liveAt(a));
  return hydrate(appPosts, userId);
}

export async function getPost(id: string, userId: string): Promise<FeedPost | null> {
  const { data } = await supabase.from("posts").select("id, title, body, excerpt, author, type, cover_image, published_at, scheduled_for, targets").eq("id", id).maybeSingle();
  if (!data) return null;
  return (await hydrate([data as PostRow], userId))[0] ?? null;
}

/** One reaction per user per post: same kind toggles off, different kind replaces. */
export async function reactToPost(postId: string, userId: string, kind: string): Promise<string | null> {
  const { data: existing } = await supabase.from("post_reactions").select("kind").eq("post_id", postId).eq("user_id", userId).maybeSingle();
  if (existing?.kind === kind) {
    await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", userId);
    return null;
  }
  await supabase.from("post_reactions").upsert({ post_id: postId, user_id: userId, kind });
  return kind;
}

export async function loadComments(postId: string): Promise<FeedComment[]> {
  const { data } = await supabase.from("post_comments").select("id, user_id, body, created_at").eq("post_id", postId).order("created_at", { ascending: true });
  const rows = data ?? [];
  const uids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profs } = uids.length ? await supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", uids) : { data: [] };
  const pBy = new Map((profs ?? []).map((p) => [p.user_id, p]));
  return rows.map((r) => ({ id: r.id, user_id: r.user_id, body: r.body, created_at: r.created_at, name: pBy.get(r.user_id)?.name || "Brother", avatar_url: pBy.get(r.user_id)?.avatar_url ?? null }));
}

export async function addComment(postId: string, userId: string, body: string): Promise<void> {
  const t = body.trim();
  if (!t) return;
  await supabase.from("post_comments").insert({ post_id: postId, user_id: userId, body: t });
}

export async function deleteComment(id: string): Promise<void> {
  await supabase.from("post_comments").delete().eq("id", id);
}
