// Where a visit came from: utm tags first (bio and post links), then the referrer.
// Shared by the agent traffic and feed routes.
export function channel(referrer: string | null, meta: Record<string, unknown> | null): string {
  const src = String(meta?.utm_source ?? "").toLowerCase();
  const r = String(referrer ?? "").toLowerCase();
  if (/instagram|^ig$/.test(src) || /instagram\.com|l\.instagram/.test(r)) return "instagram";
  if (/tiktok/.test(src) || /tiktok\.com/.test(r)) return "tiktok";
  if (/facebook|^fb$/.test(src) || /facebook\.com|fb\.com|l\.facebook/.test(r)) return "facebook";
  if (/youtube/.test(src) || /youtube\.com|youtu\.be/.test(r)) return "youtube";
  if (src) return src;
  if (/google\./.test(r)) return "google";
  if (!r || /tabor\.quest/.test(r)) return "direct";
  return r.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
}
