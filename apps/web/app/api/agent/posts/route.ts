// Agent door into the Content Studio. Lets Hannes's content engine (laptop) and the
// BurgerBot hub create, schedule, review and pull posts the same way the composer does.
// Auth: Authorization: Bearer <key>, the key from the integrations row 'agent' (or the
// AGENT_API_KEY env). Fail closed: no key configured means every call is refused.
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createUploadTicket } from "@/lib/storage-upload";
import { getSocialStatus } from "@/lib/zernio";
import { publishPostCore, schedulePostCore, cancelScheduleCore, type PostTargets } from "@/lib/content-publish";

export const dynamic = "force-dynamic";

const TYPES = ["static", "carousel", "video", "reel", "gif", "mixed"];

async function authorized(req: Request): Promise<boolean> {
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!got) return false;
  const { data } = await supabaseAdmin().from("integrations").select("secret, enabled").eq("provider", "agent").maybeSingle();
  const want = (data?.enabled && data?.secret) || process.env.AGENT_API_KEY;
  if (!want) return false;
  const a = Buffer.from(String(got)), b = Buffer.from(String(want));
  return a.length === b.length && timingSafeEqual(a, b);
}

async function audit(action: string, id: string | null, detail: Record<string, unknown> = {}) {
  try { await supabaseAdmin().from("audit_log").insert({ actor: "agent", action, entity: "post", entity_id: id, detail }); } catch { /* best effort */ }
}

const deny = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });

/** Recent posts with their media, newest first. ?status=review|scheduled|published|draft&limit=40 */
export async function GET(req: Request) {
  if (!(await authorized(req))) return deny();
  const u = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(u.searchParams.get("limit") ?? 40) || 40));
  const sb = supabaseAdmin();
  let q = sb.from("posts").select("id, slug, title, excerpt, body, type, status, targets, brief, feedback, scheduled_for, schedule_tz, published_at, social_status, social_post_id, created_at, updated_at, post_media(kind, url, poster_url, sort)").order("updated_at", { ascending: false }).limit(limit);
  const status = u.searchParams.get("status");
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const posts = (data ?? []).map((p) => ({ ...p, post_media: [...((p.post_media as { sort: number }[]) ?? [])].sort((a, b) => a.sort - b.sort) }));
  return NextResponse.json({ posts });
}

/** { action: create | upload | schedule | publish | pull | feedback | status, ... } */
export async function POST(req: Request) {
  if (!(await authorized(req))) return deny();
  const b = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!b || typeof b.action !== "string") return NextResponse.json({ error: "action required" }, { status: 400 });
  const sb = supabaseAdmin();
  const id = typeof b.id === "string" ? b.id : "";

  switch (b.action) {
    case "upload": {   // signed direct-upload ticket for the content-media bucket
      const t = await createUploadTicket(String(b.name ?? "media.bin"), "content-media", "agent");
      return NextResponse.json(t, { status: "error" in t ? 500 : 200 });
    }
    case "create": {
      const p = (b.post ?? {}) as Record<string, unknown>;
      const title = String(p.title ?? "").trim();
      const body = String(p.body ?? "");
      if (!title || !body) return NextResponse.json({ error: "post.title and post.body required" }, { status: 400 });
      const type = TYPES.includes(String(p.type)) ? String(p.type) : "static";
      const tg = (p.targets ?? {}) as Partial<PostTargets>;
      const targets: PostTargets = { app: !!tg.app, email: false, blog: !!tg.blog, instagram: !!tg.instagram, tiktok: !!tg.tiktok };   // email never from the agent
      const media = Array.isArray(p.media) ? (p.media as { kind?: string; url?: string; poster_url?: string }[]).filter((m) => typeof m.url === "string" && /^https:\/\//.test(m.url)) : [];
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "post"}-${Date.now().toString(36)}`;
      const mode = String(b.mode ?? "review");   // review (default) | schedule | draft
      const { data: row, error } = await sb.from("posts").insert({
        title, slug, body, excerpt: p.excerpt ? String(p.excerpt) : null, type, targets, brief: p.brief ? String(p.brief) : null,
        author: "TABOR", cover_image: media[0]?.url ?? null, status: mode === "draft" ? "draft" : "review",
      }).select("id").single();
      if (error || !row) return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
      if (media.length) await sb.from("post_media").insert(media.map((m, i) => ({ post_id: row.id, kind: m.kind === "video" || m.kind === "gif" ? m.kind : "image", url: m.url, poster_url: m.poster_url ?? null, sort: i })));
      await audit("post.agent_create", row.id, { mode, type, targets });
      if (mode === "schedule") {
        const r = await schedulePostCore(sb, row.id, String(b.scheduled_for ?? ""), String(b.timezone ?? "Africa/Johannesburg"));
        if (!r.ok) return NextResponse.json({ id: row.id, status: "review", error: r.error });   // stays in review, nothing lost
        await audit("post.schedule", row.id, { scheduled_for: b.scheduled_for, by: "agent" });
        return NextResponse.json({ id: row.id, status: "scheduled" });
      }
      return NextResponse.json({ id: row.id, status: mode === "draft" ? "draft" : "review" });
    }
    case "schedule": {   // approve a review post for a time (or re-schedule)
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const r = await schedulePostCore(sb, id, String(b.scheduled_for ?? ""), String(b.timezone ?? "Africa/Johannesburg"));
      if (r.ok) await audit("post.schedule", id, { scheduled_for: b.scheduled_for, by: "agent" });
      return NextResponse.json(r, { status: r.ok ? 200 : 400 });
    }
    case "publish": {
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const r = await publishPostCore(sb, id);
      if (r.ok) await audit("post.publish", id, { by: "agent" });
      return NextResponse.json(r, { status: r.ok ? 200 : 400 });
    }
    case "pull": {   // stop it going out: cancel a schedule, or park a review post as draft
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const { data: post } = await sb.from("posts").select("status").eq("id", id).maybeSingle();
      if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
      if (post.status === "published") return NextResponse.json({ ok: false, error: "Already published, delete it on the platform." }, { status: 400 });
      if (post.status === "scheduled") { const r = await cancelScheduleCore(sb, id); if (!r.ok) return NextResponse.json(r, { status: 400 }); }
      else await sb.from("posts").update({ status: "draft", updated_at: new Date().toISOString() }).eq("id", id);
      await audit("post.pull", id, { by: "agent" });
      return NextResponse.json({ ok: true });
    }
    case "feedback": {   // Hannes's notes from the hub; the engine re-makes the post from them
      const text = String(b.text ?? "").trim();
      if (!id || !text) return NextResponse.json({ error: "id and text required" }, { status: 400 });
      await sb.from("posts").update({ feedback: text, updated_at: new Date().toISOString() }).eq("id", id);
      await audit("post.feedback", id, { length: text.length });
      return NextResponse.json({ ok: true });
    }
    case "delete": {   // the engine cleans up its own drafts; anything scheduled or posted stays
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const { data: post } = await sb.from("posts").select("status").eq("id", id).maybeSingle();
      if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
      if (post.status !== "draft" && post.status !== "review") return NextResponse.json({ ok: false, error: "Only drafts and review posts can be deleted here." }, { status: 400 });
      await sb.from("posts").delete().eq("id", id);
      await audit("post.agent_delete", id);
      return NextResponse.json({ ok: true });
    }
    case "status": {
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const { data: post } = await sb.from("posts").select("social_post_id").eq("id", id).maybeSingle();
      if (!post?.social_post_id) return NextResponse.json({ state: "none", platforms: [] });
      return NextResponse.json((await getSocialStatus(String(post.social_post_id))) ?? { state: "unknown", platforms: [] });
    }
    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
}
