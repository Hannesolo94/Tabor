"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Token-gated quick moderation from the auto-mod email. The unguessable token IS
// the authorization (it lives only in the staff inbox). Actions are reversible.
async function reportByToken(token: string) {
  const admin = supabaseAdmin();
  const { data } = await admin.from("reports").select("id, target_user, message_id, status").eq("action_token", token).maybeSingle();
  return data;
}

export async function quickBan(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const rep = await reportByToken(token);
  if (!rep || rep.status !== "open") redirect(`/mod-action?token=${token}&done=stale`);
  const admin = supabaseAdmin();
  if (rep!.target_user) await admin.from("profiles").update({ banned: true }).eq("user_id", rep!.target_user);
  await admin.from("reports").update({ status: "actioned" }).eq("id", rep!.id);
  redirect(`/mod-action?token=${token}&done=ban`);
}

export async function quickRelease(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const rep = await reportByToken(token);
  if (!rep || rep.status !== "open") redirect(`/mod-action?token=${token}&done=stale`);
  const admin = supabaseAdmin();
  // false alarm: clear the silence + restore the hidden message + dismiss
  if (rep!.target_user) await admin.from("profiles").update({ silenced_until: null }).eq("user_id", rep!.target_user);
  if (rep!.message_id) await admin.from("messages").update({ hidden: false }).eq("id", rep!.message_id);
  await admin.from("reports").update({ status: "dismissed" }).eq("id", rep!.id);
  redirect(`/mod-action?token=${token}&done=release`);
}
