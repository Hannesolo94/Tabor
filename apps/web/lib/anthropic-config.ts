// Resolve the Anthropic API key + model: prefer the key stored in the integrations
// table (provider 'anthropic', when enabled), else the ANTHROPIC_API_KEY env. Used
// by the Content Studio and Ad Studio AI drafting. Server-only (reads via service role).
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function anthropicConfig(): Promise<{ key: string; model: string } | null> {
  const admin = supabaseAdmin();
  const { data } = await admin.from("integrations").select("secret, enabled, meta").eq("provider", "anthropic").maybeSingle();
  const key = (data?.enabled && data?.secret) || process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = ((data?.meta as { model?: string } | null)?.model) || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  return { key: String(key), model };
}
