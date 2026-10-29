// Content Studio publish/schedule core, shared by the admin server actions (admin session
// client) and the agent route (service-role client). Callers own revalidation + audit.
import type { SupabaseClient } from "@supabase/supabase-js";
import { publishToSocial, deleteSocialPost } from "@/lib/zernio";

export interface PostTargets { app: boolean; email: boolean; blog: boolean; instagram: boolean; tiktok: boolean }

async function socialMedia(sb: SupabaseClient, id: string) {
  const { data: media } = await sb.from("post_media").select("kind, url, sort").eq("post_id", id).order("sort", { ascending: true });
  return (media ?? []).map((m) => ({ kind: m.kind as string, url: m.url as string }));
}

function socialPlatforms(t: PostTargets): string[] {
  return [t.instagram ? "instagram" : null, t.tiktok ? "tiktok" : null].filter(Boolean) as string[];
}

/** Publish now: flips status, cross-posts to the ticked socials via Zernio. */
export async function publishPostCore(sb: SupabaseClient, id: string): Promise<{ ok: boolean; error?: string; targets?: PostTargets }> {
  const { data: post } = await sb.from("posts").select("status, published_at, app_published_at, targets, body, type, social_post_id").eq("id", id).maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  const targets = (post.targets ?? {}) as PostTargets;
  const patch: Record<string, unknown> = { status: "published", scheduled_for: null, updated_at: new Date().toISOString() };
  if (!post.published_at) patch.published_at = new Date().toISOString();
  if (targets.app && !post.app_published_at) patch.app_published_at = new Date().toISOString();

  // publishing a scheduled post NOW: pull the queued Zernio post so it does not double-fire
  if (post.status === "scheduled" && post.social_post_id) {
    await deleteSocialPost(String(post.social_post_id));
    patch.social_post_id = null;
    patch.social_status = null;
  }

  // cross-post to Instagram / TikTok via Zernio (only the platforms ticked)
  if (targets.instagram || targets.tiktok) {
    const r = await publishToSocial({ content: String(post.body ?? ""), media: await socialMedia(sb, id), platforms: socialPlatforms(targets), isReel: post.type === "reel" });
    patch.social_status = r.status || null;
    if (r.postId) patch.social_post_id = r.postId;
  }

  await sb.from("posts").update(patch).eq("id", id);
  return { ok: true, targets };
}

/** Schedule for a future moment. Social is queued inside Zernio now and fires at the time;
 *  app/blog go live via RLS + the promotion sweep. Re-scheduling replaces the queued Zernio post. */
export async function schedulePostCore(sb: SupabaseClient, id: string, whenIso: string, timezone: string): Promise<{ ok: boolean; error?: string; targets?: PostTargets }> {
  const when = new Date(whenIso);
  if (isNaN(when.getTime())) return { ok: false, error: "Pick a valid date and time." };
  if (when.getTime() < Date.now() + 60_000) return { ok: false, error: "Pick a time in the future." };

  const { data: post } = await sb.from("posts").select("status, targets, body, type, social_post_id").eq("id", id).maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  const targets = (post.targets ?? {}) as PostTargets;
  const patch: Record<string, unknown> = { status: "scheduled", scheduled_for: when.toISOString(), schedule_tz: timezone || "UTC", updated_at: new Date().toISOString() };

  if (targets.instagram || targets.tiktok) {
    if (post.status === "scheduled" && post.social_post_id) await deleteSocialPost(String(post.social_post_id));
    const r = await publishToSocial({ content: String(post.body ?? ""), media: await socialMedia(sb, id), platforms: socialPlatforms(targets), isReel: post.type === "reel", scheduledFor: when.toISOString(), timezone: timezone || "UTC" });
    if (!r.ok) return { ok: false, error: r.status };
    patch.social_status = r.status || null;
    patch.social_post_id = r.postId ?? null;
  }

  await sb.from("posts").update(patch).eq("id", id);
  return { ok: true, targets };
}

/** Cancel a schedule: back to draft, and pull the queued Zernio post if there is one. */
export async function cancelScheduleCore(sb: SupabaseClient, id: string): Promise<{ ok: boolean; error?: string }> {
  const { data: post } = await sb.from("posts").select("status, social_post_id").eq("id", id).maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  if (post.status !== "scheduled") return { ok: false, error: "Post is not scheduled." };
  if (post.social_post_id) await deleteSocialPost(String(post.social_post_id));
  await sb.from("posts").update({ status: "draft", scheduled_for: null, social_post_id: null, social_status: null, updated_at: new Date().toISOString() }).eq("id", id);
  return { ok: true };
}
