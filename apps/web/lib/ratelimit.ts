// Server-side rate limiting for public endpoints, backed by a Postgres counter
// (works across serverless instances, unlike in-memory). Fail-open: if the check
// itself errors we allow the request, so a DB blip never takes checkout down.
import { supabaseAdmin } from "@/lib/supabase/admin";

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  return xff.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Returns true if the request is allowed, false if it is over the limit. */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin().rpc("hit_rate_limit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
    if (error) return true; // fail open
    return data !== false;
  } catch {
    return true;
  }
}
