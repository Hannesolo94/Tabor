"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

/** Compose a community announcement and fan it out to every user's inbox. */
export async function sendBroadcast(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const deepLink = String(formData.get("deep_link") ?? "").trim() || null;
  if (!title) return;

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  const admin = supabaseAdmin();
  // every registered user gets it
  const { data: profs } = await admin.from("profiles").select("user_id");
  const ids = (profs ?? []).map((p) => p.user_id);

  // fan out in chunks
  for (let i = 0; i < ids.length; i += 500) {
    const rows = ids.slice(i, i + 500).map((uid) => ({ user_id: uid, kind: "broadcast", title, body, deep_link: deepLink, read: false }));
    if (rows.length) await admin.from("notifications").insert(rows);
  }

  await admin.from("broadcasts").insert({ title, body, deep_link: deepLink, sent_by: user?.email ?? "admin", audience: ids.length });
  await logAudit("broadcast.send", "broadcast", undefined, { title, audience: ids.length });
  revalidatePath("/admin/community");
}
