// Agent key check shared by the /api/agent/* routes (Hannes's content engine + BurgerBot hub).
// Key: integrations row 'agent' (or the AGENT_API_KEY env). Fail closed: no key configured, no access.
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function agentAuthorized(req: Request): Promise<boolean> {
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!got) return false;
  const { data } = await supabaseAdmin().from("integrations").select("secret, enabled").eq("provider", "agent").maybeSingle();
  const want = (data?.enabled && data?.secret) || process.env.AGENT_API_KEY;
  if (!want) return false;
  const a = Buffer.from(String(got)), b = Buffer.from(String(want));
  return a.length === b.length && timingSafeEqual(a, b);
}
