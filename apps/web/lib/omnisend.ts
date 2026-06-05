// Omnisend integration (server-only). The API key is stored in the integrations
// table (admin sets it in Settings), not in env, so the owner controls it. All
// calls are best-effort: they never throw into the signup path.
import { supabaseAdmin } from "@/lib/supabase/admin";

interface OmnisendConfig {
  key: string;
  enabled: boolean;
}

export async function getOmnisendConfig(): Promise<OmnisendConfig | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("integrations").select("secret, enabled").eq("provider", "omnisend").maybeSingle();
  if (!data?.secret) return null;
  return { key: data.secret, enabled: !!data.enabled };
}

/** Add/update a subscriber. Returns true on success; logs and returns false otherwise. */
export async function omnisendAddContact(email: string, tags: string[] = []): Promise<boolean> {
  const cfg = await getOmnisendConfig();
  if (!cfg || !cfg.enabled) return false;
  try {
    const res = await fetch("https://api.omnisend.com/v3/contacts", {
      method: "POST",
      headers: { "X-API-KEY": cfg.key, "Content-Type": "application/json" },
      body: JSON.stringify({
        identifiers: [
          {
            type: "email",
            id: email,
            channels: { email: { status: "subscribed", statusDate: new Date().toISOString() } },
          },
        ],
        tags,
      }),
    });
    // 200/201 = created, 409/400 (already exists) is fine for our purposes
    return res.ok || res.status === 409;
  } catch (e) {
    console.error("omnisend add contact failed:", e);
    return false;
  }
}
