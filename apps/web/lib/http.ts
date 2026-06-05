// Basic same-origin check for public POST endpoints. Blocks cross-origin browser
// requests (which always send an Origin) while allowing same-site calls and
// beacons. Not a full CSRF defense, but stops casual cross-site abuse.
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // no Origin (some beacons/server calls) — allow
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
