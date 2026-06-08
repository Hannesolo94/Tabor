// Chat media (images / videos / gifs). Uploaded files -> public chat-media bucket
// with unguessable paths; a media message carries {__media:{t,url}} as its body
// (encrypted for DMs, so only participants learn the URL).
import { supabase } from "./supabase";

export interface MediaRef { t: "image" | "video" | "gif"; url: string }

export async function uploadChatMedia(userId: string, uri: string, ext: string, contentType: string): Promise<string | null> {
  try {
    const resp = await fetch(uri);
    const buf = await resp.arrayBuffer();
    const path = `${userId}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
    const { error } = await supabase.storage.from("chat-media").upload(path, buf, { contentType, upsert: false });
    if (error) return null;
    return supabase.storage.from("chat-media").getPublicUrl(path).data.publicUrl;
  } catch { return null; }
}

// ---- GIFs via Giphy (in-app picker) ----
let _giphyKey: string | null = null;
async function giphyKey(): Promise<string | null> {
  if (_giphyKey) return _giphyKey;
  const { data } = await supabase.rpc("giphy_key");
  _giphyKey = (data as string) ?? null;
  return _giphyKey;
}
export interface Gif { id: string; preview: string; url: string }
export async function searchGifs(q: string): Promise<Gif[]> {
  const key = await giphyKey();
  if (!key) return [];
  const path = q.trim() ? `search?q=${encodeURIComponent(q.trim())}&` : "trending?";
  try {
    const res = await fetch(`https://api.giphy.com/v1/gifs/${path}api_key=${key}&limit=24&rating=pg-13&bundle=messaging_non_clips`);
    const j = await res.json();
    return (j.data ?? []).map((g: { id: string; images: Record<string, { url: string }> }) => ({
      id: g.id,
      preview: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url,
      url: g.images?.downsized?.url || g.images?.fixed_width?.url || g.images?.original?.url,
    })).filter((x: Gif) => x.url);
  } catch { return []; }
}

export function mediaBody(m: MediaRef): string { return JSON.stringify({ __media: m }); }
export function parseMedia(content: string | null | undefined): MediaRef | null {
  if (!content || content[0] !== "{") return null;
  try { const j = JSON.parse(content); return j && j.__media && j.__media.url ? (j.__media as MediaRef) : null; } catch { return null; }
}
