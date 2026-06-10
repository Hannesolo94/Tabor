// Scheduled-content sweep: flips due scheduled posts to 'published' and stamps
// their publish times. Social platforms are NOT touched here (Zernio fires those
// itself at the scheduled moment); this is for our own status + app/blog stamps.
// Called from the admin Content Studio page (auto-refreshes while open) and the
// daily cron as a backstop. Public visibility does not depend on this: RLS already
// exposes a scheduled post the second its time passes.
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function promoteDuePosts(): Promise<number> {
  const admin = supabaseAdmin();
  const nowIso = new Date().toISOString();
  const { data } = await admin
    .from("posts")
    .select("id, targets, scheduled_for, published_at, app_published_at")
    .eq("status", "scheduled")
    .lte("scheduled_for", nowIso);
  const due = data ?? [];
  for (const p of due) {
    const targets = (p.targets ?? {}) as { app?: boolean };
    const patch: Record<string, unknown> = { status: "published", updated_at: nowIso };
    if (!p.published_at) patch.published_at = p.scheduled_for;
    if (targets.app && !p.app_published_at) patch.app_published_at = p.scheduled_for;
    await admin.from("posts").update(patch).eq("id", p.id);
  }
  return due.length;
}
