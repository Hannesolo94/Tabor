// Zernio social publishing (server-only). One API posts to Instagram + TikTok (+ more).
// Key lives in the integrations table (provider 'zernio') or the ZERNIO_API_KEY env.
import { supabaseAdmin } from "@/lib/supabase/admin";

const BASE = "https://zernio.com/api/v1";

async function zernioKey(): Promise<string | null> {
  const admin = supabaseAdmin();
  const { data } = await admin.from("integrations").select("secret, enabled").eq("provider", "zernio").maybeSingle();
  const key = (data?.enabled && data?.secret) || process.env.ZERNIO_API_KEY;
  return key ? String(key) : null;
}

interface ZAccount { id: string; platform: string; name?: string }
async function zernioAccounts(key: string): Promise<ZAccount[]> {
  const j = await fetch(`${BASE}/accounts`, { headers: { Authorization: `Bearer ${key}` } }).then((r) => r.json()).catch(() => null);
  const list = j?.accounts ?? j?.data ?? (Array.isArray(j) ? j : []);
  return (Array.isArray(list) ? list : []).map((a: { _id?: string; id?: string; platform: string; name?: string; username?: string }) => ({ id: a._id ?? a.id ?? "", platform: a.platform, name: a.name ?? a.username }));
}

export interface SocialMedia { kind: string; url: string }

/** Publish a post to the connected accounts for the given platforms. Returns a human-readable status. */
export async function publishToSocial(opts: { content: string; media: SocialMedia[]; platforms: string[]; isReel?: boolean }): Promise<{ ok: boolean; status: string; postId?: string }> {
  const want = opts.platforms.filter((p) => p === "instagram" || p === "tiktok");
  if (!want.length) return { ok: true, status: "" };
  const key = await zernioKey();
  if (!key) return { ok: false, status: "Social: Zernio key not set." };

  const accounts = await zernioAccounts(key);
  const targets = want.map((p) => accounts.find((a) => a.platform === p)).filter((a): a is ZAccount => !!a);
  if (!targets.length) return { ok: false, status: `Social: no connected account for ${want.join(", ")}.` };

  const mediaItems = opts.media.map((m) => ({ type: m.kind === "video" ? "video" : "image", url: m.url }));
  if (!mediaItems.length) return { ok: false, status: "Social: Instagram/TikTok need at least one image or video." };

  const singleVideo = mediaItems.length === 1 && mediaItems[0].type === "video";
  const platforms = targets.map((t) => {
    const platformSpecificData: Record<string, string> = {};
    if (t.platform === "instagram" && (opts.isReel || singleVideo)) platformSpecificData.contentType = "reels";
    return { platform: t.platform, accountId: t.id, platformSpecificData };
  });

  try {
    const res = await fetch(`${BASE}/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: opts.content, mediaItems, platforms, publishNow: true }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.status >= 300 || j.error) return { ok: false, status: `Social: ${j.error?.message ?? j.message ?? `Zernio ${res.status}`}` };
    const postId = j.post?._id ?? j.post?.id ?? j._id ?? j.id ?? j.data?._id;
    return { ok: true, status: `Posted to ${targets.map((t) => t.platform).join(" + ")}.`, postId: postId ? String(postId) : undefined };
  } catch {
    return { ok: false, status: "Social: could not reach Zernio." };
  }
}

export interface SocialStatus { state: string; platforms: { platform: string; status: string; url?: string }[] }

/** Live status of a Zernio post (publishing / published / failed, per platform). */
export async function getSocialStatus(zernioPostId: string): Promise<SocialStatus | null> {
  const key = await zernioKey();
  if (!key) return null;
  try {
    let po: Record<string, unknown> | undefined;
    const single = await fetch(`${BASE}/posts/${zernioPostId}`, { headers: { Authorization: `Bearer ${key}` } }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    po = single?.post ?? single?.data ?? (single && !single.error ? single : undefined);
    if (!po) {
      const list = await fetch(`${BASE}/posts?limit=10`, { headers: { Authorization: `Bearer ${key}` } }).then((r) => r.json()).catch(() => null);
      const arr = list?.posts ?? list?.data ?? (Array.isArray(list) ? list : []);
      po = (arr as Record<string, unknown>[]).find((p) => String(p._id ?? p.id) === zernioPostId);
    }
    if (!po) return null;
    const rawPlat = (po.platforms ?? po.results ?? []) as Record<string, unknown>[];
    return {
      state: String(po.status ?? po.state ?? "unknown"),
      platforms: rawPlat.map((pl) => ({ platform: String(pl.platform ?? pl.network ?? "?"), status: String(pl.status ?? pl.state ?? "?"), url: (pl.url ?? pl.permalink ?? pl.postUrl) as string | undefined })),
    };
  } catch { return null; }
}
