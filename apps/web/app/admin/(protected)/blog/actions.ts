"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { publishToSocial, deleteSocialPost } from "@/lib/zernio";
import { anthropicConfig } from "@/lib/anthropic-config";
import { createUploadTicket } from "@/lib/storage-upload";
import { slugify } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

export interface PostTargets { app: boolean; email: boolean; blog: boolean; instagram: boolean; tiktok: boolean }
export interface MediaCard { kind: string; url: string; poster_url: string | null }

/** Signed upload URL so the browser uploads media DIRECTLY to the public content-media bucket. */
export async function createMediaUpload(name: string): Promise<{ path: string; token: string; publicUrl: string } | { error: string }> {
  return createUploadTicket(name, "content-media");
}

/** Full save of a post: fields + type + brief + targets + the ordered media cards. */
export async function savePost(input: {
  id: string; title: string; slug: string; excerpt: string; body: string; cover_image: string;
  author: string; type: string; brief: string; targets: PostTargets; media: MediaCard[];
}): Promise<void> {
  const sb = await supabaseServer();
  await sb.from("posts").update({
    title: input.title.trim(),
    slug: slugify(input.slug || input.title),
    excerpt: input.excerpt || null,
    body: input.body ?? "",
    cover_image: input.cover_image || input.media[0]?.url || null,
    author: input.author || "TABOR",
    type: input.type,
    brief: input.brief || null,
    targets: input.targets,
    updated_at: new Date().toISOString(),
  }).eq("id", input.id);
  await sb.from("post_media").delete().eq("post_id", input.id);
  if (input.media.length) {
    await sb.from("post_media").insert(input.media.map((m, i) => ({ post_id: input.id, kind: m.kind, url: m.url, poster_url: m.poster_url, sort: i })));
  }
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${input.id}`);
  revalidatePath("/blog");
}

// ---- AI draft-from-brief + review workflow ----
const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";

const DRAFT_SYSTEM = `You write social and in-app feed posts for TABOR ("Sons of Fire"), a gamified Christian brotherhood and apparel/gear brand for men who game, train, and follow Jesus.
Voice: warm but strong, conversational, brotherly, honest, encouraging. Masculine and faith-filled. Never corporate, never cringe, never preachy.
HARD RULES: No em-dashes, ever (use periods, commas, colons). No emoji. Keep it tight, 3 to 7 short lines. Brand lines you may use sparingly: "Forged not bought.", "No one climbs alone.", "Sons of Fire."
If the brief names a product or link, end with a clear call-to-action line: "Shop it here: <url>".
Return ONLY a JSON object, no preamble or code fences: {"title": "short punchy title", "excerpt": "one-line summary for previews", "body": "the post caption"}.`;

/** Draft (or re-draft from feedback) a post from its brief + uploaded media via Claude, then queue it for review. */
export async function draftFromBrief(postId: string, feedback?: string): Promise<{ ok: boolean; error?: string; draft?: { title: string; excerpt: string | null; body: string } }> {
  const cfg = await anthropicConfig();
  if (!cfg) return { ok: false, error: "Add your Anthropic API key in Settings > Integrations." };
  const sb = await supabaseServer();
  const { data: post } = await sb.from("posts").select("id, title, brief, body, type").eq("id", postId).maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  const { data: media } = await sb.from("post_media").select("kind, url, sort").eq("post_id", postId).order("sort", { ascending: true });
  const imgs = (media ?? []).filter((m) => m.kind === "image" || m.kind === "gif").slice(0, 3);

  const content: unknown[] = [];
  for (const m of imgs) {
    try {
      const r = await fetch(m.url);
      const mime = r.headers.get("content-type") || "image/png";
      const b64 = Buffer.from(await r.arrayBuffer()).toString("base64");
      content.push({ type: "image", source: { type: "base64", media_type: mime, data: b64 } });
    } catch { /* skip an unreachable image */ }
  }
  const userText = [
    `Brief: ${post.brief || post.title || "(none)"}`,
    `Format: ${post.type || "static"}`,
    post.body ? `Current draft to improve:\n${post.body}` : "",
    feedback ? `The human reviewed it and left this feedback. Revise accordingly:\n${feedback}` : "",
    "Write the post now.",
  ].filter(Boolean).join("\n\n");
  content.push({ type: "text", text: userText });

  let parsed: { title?: string; excerpt?: string; body?: string } = {};
  try {
    const res = await fetch(ANTHROPIC_ENDPOINT, { method: "POST", headers: { "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: cfg.model, max_tokens: 1024, system: DRAFT_SYSTEM, messages: [{ role: "user", content }] }) });
    const j = await res.json();
    if (j.error) return { ok: false, error: j.error?.message ?? "Claude returned an error." };
    const text = (j.content ?? []).map((b: { text?: string }) => b.text ?? "").join("");
    parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch { return { ok: false, error: "Could not reach Claude. Try again." }; }

  const draft = { title: parsed.title || post.title, excerpt: parsed.excerpt || null, body: parsed.body || post.body };
  await sb.from("posts").update({ ...draft, status: "review", feedback: null, updated_at: new Date().toISOString() }).eq("id", postId);
  await logAudit("post.draft", "post", postId, { revised: !!feedback });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${postId}`);
  return { ok: true, draft };
}

/** Approve a reviewed post: publish it. */
export async function approveAndPublish(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await publishPost(id);
}

/** Request changes on a reviewed post: save feedback and re-draft from it (stays in review). */
export async function requestChanges(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const feedback = String(formData.get("feedback") ?? "").trim();
  if (!id || !feedback) return;
  const sb = await supabaseServer();
  await sb.from("posts").update({ feedback }).eq("id", id);
  await draftFromBrief(id, feedback);
}

/** Publish to the chosen destinations (blog + app feed here; email send is its own action). */
export async function publishPost(id: string): Promise<void> {
  const sb = await supabaseServer();
  const { data: post } = await sb.from("posts").select("status, published_at, app_published_at, targets, body, type, social_post_id").eq("id", id).maybeSingle();
  if (!post) return;
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
    const { data: media } = await sb.from("post_media").select("kind, url, sort").eq("post_id", id).order("sort", { ascending: true });
    const platforms = [targets.instagram ? "instagram" : null, targets.tiktok ? "tiktok" : null].filter(Boolean) as string[];
    const r = await publishToSocial({ content: String(post.body ?? ""), media: (media ?? []).map((m) => ({ kind: m.kind, url: m.url })), platforms, isReel: post.type === "reel" });
    patch.social_status = r.status || null;
    if (r.postId) patch.social_post_id = r.postId;
  }

  await sb.from("posts").update(patch).eq("id", id);
  await logAudit("post.publish", "post", id, { targets });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
}

/** Schedule a post for a future moment. Social (IG/TikTok) is queued inside Zernio
 *  right now with scheduledFor: Zernio fires it at the time. App/blog go live via
 *  RLS + the promotion sweep. Re-scheduling replaces any previously queued Zernio post. */
export async function schedulePost(id: string, whenIso: string, timezone: string): Promise<{ ok: boolean; error?: string }> {
  const when = new Date(whenIso);
  if (isNaN(when.getTime())) return { ok: false, error: "Pick a valid date and time." };
  if (when.getTime() < Date.now() + 60_000) return { ok: false, error: "Pick a time in the future." };

  const sb = await supabaseServer();
  const { data: post } = await sb.from("posts").select("status, targets, body, type, social_post_id").eq("id", id).maybeSingle();
  if (!post) return { ok: false, error: "Post not found." };
  const targets = (post.targets ?? {}) as PostTargets;
  const patch: Record<string, unknown> = { status: "scheduled", scheduled_for: when.toISOString(), schedule_tz: timezone || "UTC", updated_at: new Date().toISOString() };

  if (targets.instagram || targets.tiktok) {
    // re-scheduling: pull the previously queued Zernio post first so it does not double-fire
    if (post.status === "scheduled" && post.social_post_id) await deleteSocialPost(String(post.social_post_id));
    const { data: media } = await sb.from("post_media").select("kind, url, sort").eq("post_id", id).order("sort", { ascending: true });
    const platforms = [targets.instagram ? "instagram" : null, targets.tiktok ? "tiktok" : null].filter(Boolean) as string[];
    const r = await publishToSocial({ content: String(post.body ?? ""), media: (media ?? []).map((m) => ({ kind: m.kind, url: m.url })), platforms, isReel: post.type === "reel", scheduledFor: when.toISOString(), timezone: timezone || "UTC" });
    if (!r.ok) return { ok: false, error: r.status };
    patch.social_status = r.status || null;
    patch.social_post_id = r.postId ?? null;
  }

  await sb.from("posts").update(patch).eq("id", id);
  await logAudit("post.schedule", "post", id, { scheduled_for: when.toISOString(), timezone, targets });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  return { ok: true };
}

/** Cancel a schedule: back to draft, and pull the queued Zernio post if there is one. */
export async function cancelSchedule(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await supabaseServer();
  const { data: post } = await sb.from("posts").select("status, social_post_id").eq("id", id).maybeSingle();
  if (!post || post.status !== "scheduled") return;
  if (post.social_post_id) await deleteSocialPost(String(post.social_post_id));
  await sb.from("posts").update({ status: "draft", scheduled_for: null, social_post_id: null, social_status: null, updated_at: new Date().toISOString() }).eq("id", id);
  await logAudit("post.unschedule", "post", id);
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
}

/** Blank post for an extra composer block (the "+" in the multi-post composer). */
export async function createBlankPost(): Promise<{ id: string; slug: string } | { error: string }> {
  const sb = await supabaseServer();
  const slug = `post-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await sb.from("posts").insert({ title: "Untitled post", slug }).select("id, slug").single();
  if (error || !data) return { error: error?.message ?? "Could not add a post." };
  return { id: data.id, slug: data.slug };
}

/** Remove an extra composer block (deletes the row, no redirect). */
export async function discardPost(id: string): Promise<void> {
  if (!id) return;
  const sb = await supabaseServer();
  await sb.from("posts").delete().eq("id", id);
  revalidatePath("/admin/blog");
}

export async function createPost(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const sb = await supabaseServer();
  let slug = slugify(title);
  for (let i = 2; i < 50; i++) {
    const { data } = await sb.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${slugify(title)}-${i}`;
  }
  const { data } = await sb.from("posts").insert({ title, slug }).select("id").single();
  revalidatePath("/admin/blog");
  if (data?.id) redirect(`/admin/blog/${data.id}`);
}

export async function deletePost(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("posts").delete().eq("id", id);
  await logAudit("post.delete", "post", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}
