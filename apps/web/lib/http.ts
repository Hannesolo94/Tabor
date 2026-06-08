// Same-origin check for public POST endpoints. Browser requests carry an Origin
// (always cross-origin, and for same-origin POSTs) or at least a Referer. We
// require one of them to match our host; a request with NEITHER is blocked —
// the CSRF-safe default that also stops Origin-less scripted abuse.
export function sameOrigin(req: Request): boolean {
  const host = req.headers.get("host");
  const origin = req.headers.get("origin");
  if (origin) {
    try { return new URL(origin).host === host; } catch { return false; }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try { return new URL(referer).host === host; } catch { return false; }
  }
  return false; // neither Origin nor Referer — block
}
