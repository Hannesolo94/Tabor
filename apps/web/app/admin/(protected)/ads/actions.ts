"use server";

// Ad Studio actions: campaigns + creatives + AI ad-copy drafting. Mirrors the
// Content Studio patterns (signed direct uploads, Claude drafting via the
// integrations key). No ad-platform APIs are connected yet by design.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { anthropicConfig } from "@/lib/anthropic-config";
import { createUploadTicket } from "@/lib/storage-upload";
import { logAudit } from "@/lib/audit";

export interface AdMediaCard { kind: string; url: string; poster_url: string | null }
export interface AdCopy { title: string; hook: string; primary_text: string; headline: string; cta: string }

/** Signed upload URL so the browser uploads ad media directly to content-media (ads/ prefix). */
export async function createAdMediaUpload(name: string): Promise<{ path: string; token: string; publicUrl: string } | { error: string }> {
  return createUploadTicket(name, "content-media", "ads");
}

// ---- campaigns ----

export async function createCampaign(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const sb = await supabaseServer();
  const { data } = await sb.from("ad_campaigns").insert({ name }).select("id").single();
  await logAudit("ad_campaign.create", "ad_campaign", data?.id, { name });
  revalidatePath("/admin/ads");
  if (data?.id) redirect(`/admin/ads/${data.id}`);
}

export async function updateCampaign(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const budget = String(formData.get("budget") ?? "").trim();
  const sb = await supabaseServer();
  await sb.from("ad_campaigns").update({
    name: String(formData.get("name") ?? "").trim() || "Untitled campaign",
    objective: String(formData.get("objective") ?? "conversions"),
    platforms: { meta: formData.get("meta") === "on", tiktok: formData.get("tiktok") === "on" },
    status: String(formData.get("status") ?? "draft"),
    budget_cents: budget ? Math.round(parseFloat(budget) * 100) : null,
    currency: String(formData.get("currency") ?? "USD"),
    start_at: String(formData.get("start_at") ?? "") || null,
    end_at: String(formData.get("end_at") ?? "") || null,
    audience: String(formData.get("audience") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  await logAudit("ad_campaign.update", "ad_campaign", id);
  revalidatePath("/admin/ads");
  revalidatePath(`/admin/ads/${id}`);
}

export async function deleteCampaign(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await supabaseServer();
  await sb.from("ad_campaigns").delete().eq("id", id);
  await logAudit("ad_campaign.delete", "ad_campaign", id);
  revalidatePath("/admin/ads");
  redirect("/admin/ads");
}

// ---- creatives ----

export async function addCreative(campaignId: string): Promise<{ id: string } | { error: string }> {
  const sb = await supabaseServer();
  const { data, error } = await sb.from("ad_creatives").insert({ campaign_id: campaignId }).select("id").single();
  if (error || !data) return { error: error?.message ?? "Could not add a creative." };
  revalidatePath(`/admin/ads/${campaignId}`);
  return { id: data.id };
}

export async function saveCreative(input: {
  id: string; title: string; format: string; hook: string; primary_text: string;
  headline: string; cta: string; link_url: string; brief: string; status: string; media: AdMediaCard[];
}): Promise<void> {
  const sb = await supabaseServer();
  await sb.from("ad_creatives").update({
    title: input.title.trim() || "Untitled creative",
    format: input.format,
    hook: input.hook || null,
    primary_text: input.primary_text || null,
    headline: input.headline || null,
    cta: input.cta || null,
    link_url: input.link_url || null,
    brief: input.brief || null,
    status: input.status,
    updated_at: new Date().toISOString(),
  }).eq("id", input.id);
  await sb.from("ad_media").delete().eq("creative_id", input.id);
  if (input.media.length) {
    await sb.from("ad_media").insert(input.media.map((m, i) => ({ creative_id: input.id, kind: m.kind, url: m.url, poster_url: m.poster_url, sort: i })));
  }
  revalidatePath("/admin/ads");
}

export async function deleteCreative(id: string): Promise<void> {
  if (!id) return;
  const sb = await supabaseServer();
  await sb.from("ad_creatives").delete().eq("id", id);
  revalidatePath("/admin/ads");
}

// ---- AI ad-copy drafting (shared key/model plumbing with the Content Studio) ----
const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";

const AD_SYSTEM = `You write direct-response ad copy for TABOR ("Sons of Fire"), a gamified Christian brotherhood and apparel/gear brand for men who game, train, and follow Jesus.
Voice: bold, brotherly, conviction-first. Sell identity and brotherhood, not just product. Never corporate, never cringe, never preachy.
HARD RULES: No em-dashes, ever (use periods, commas, colons). No emoji in the hook or headline. Brand lines you may use sparingly: "Forged not bought.", "No one climbs alone.", "Sons of Fire."
Structure: hook = the scroll-stopper first line (under 12 words). primary_text = 2 to 5 short lines of body copy. headline = under 8 words. cta = 2 to 4 words.
Return ONLY a JSON object, no preamble or code fences: {"title": "internal name for this creative", "hook": "...", "primary_text": "...", "headline": "...", "cta": "..."}.`;

/** Draft (or re-draft) ad copy from a creative's brief + media via Claude. */
export async function draftAdFromBrief(creativeId: string, feedback?: string): Promise<{ ok: boolean; error?: string; copy?: AdCopy }> {
  const cfg = await anthropicConfig();
  if (!cfg) return { ok: false, error: "Add your Anthropic API key in Settings > Integrations." };
  const sb = await supabaseServer();
  const { data: cr } = await sb.from("ad_creatives").select("id, title, brief, format, hook, primary_text, headline, cta, link_url").eq("id", creativeId).maybeSingle();
  if (!cr) return { ok: false, error: "Creative not found." };
  const { data: media } = await sb.from("ad_media").select("kind, url, sort").eq("creative_id", creativeId).order("sort", { ascending: true });
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
    `Brief: ${cr.brief || cr.title || "(none)"}`,
    `Format: ${cr.format || "static"}`,
    cr.link_url ? `Landing page: ${cr.link_url}` : "",
    cr.primary_text ? `Current copy to improve:\nHook: ${cr.hook ?? ""}\nBody: ${cr.primary_text}\nHeadline: ${cr.headline ?? ""}` : "",
    feedback ? `The human reviewed it and left this feedback. Revise accordingly:\n${feedback}` : "",
    "Write the ad copy now.",
  ].filter(Boolean).join("\n\n");
  content.push({ type: "text", text: userText });

  let parsed: Partial<AdCopy> = {};
  try {
    const res = await fetch(ANTHROPIC_ENDPOINT, { method: "POST", headers: { "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: cfg.model, max_tokens: 1024, system: AD_SYSTEM, messages: [{ role: "user", content }] }) });
    const j = await res.json();
    if (j.error) return { ok: false, error: j.error?.message ?? "Claude returned an error." };
    const text = (j.content ?? []).map((b: { text?: string }) => b.text ?? "").join("");
    parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch { return { ok: false, error: "Could not reach Claude. Try again." }; }

  const copy: AdCopy = {
    title: parsed.title || cr.title,
    hook: parsed.hook || cr.hook || "",
    primary_text: parsed.primary_text || cr.primary_text || "",
    headline: parsed.headline || cr.headline || "",
    cta: parsed.cta || cr.cta || "Shop now",
  };
  await sb.from("ad_creatives").update({ ...copy, status: "review", updated_at: new Date().toISOString() }).eq("id", creativeId);
  await logAudit("ad_creative.draft", "ad_creative", creativeId, { revised: !!feedback });
  revalidatePath("/admin/ads");
  return { ok: true, copy };
}
