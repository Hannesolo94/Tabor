// Client-side guideline guard + reporting. The hard enforcement (bans, rate
// limits) lives in DB triggers; this is the first line + the report path.
import { supabase } from "./supabase";

// Egregious slurs / hate only — kept tight to avoid false positives. Nuanced
// cases go through reporting + human moderation, not an auto-blocklist.
const BANNED = ["nigger", "faggot", "kike", "retard", "cunt"];

export function violatesGuidelines(text: string): boolean {
  const t = text.toLowerCase().replace(/[^a-z]/g, "");
  return BANNED.some((w) => t.includes(w));
}

export async function reportContent(reporter: string, opts: { messageId?: string; targetUser?: string; reason: string; detail?: string }): Promise<void> {
  await supabase.from("reports").insert({
    reporter,
    message_id: opts.messageId ?? null,
    target_user: opts.targetUser ?? null,
    reason: opts.reason,
    detail: opts.detail ?? null,
  });
}

/** Friendly message for the DB guard errors. */
export function sendErrorMessage(err?: string): string | null {
  if (!err) return null;
  if (err.includes("rate_limited")) return "Slow down, brother. You're sending too fast.";
  if (err.includes("account_suspended")) return "Your account is suspended from posting.";
  return null;
}
