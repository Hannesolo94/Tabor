"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

export async function deleteReportedMessage(formData: FormData): Promise<void> {
  const reportId = String(formData.get("report_id") ?? "");
  const messageId = String(formData.get("message_id") ?? "");
  const admin = supabaseAdmin();
  if (messageId) await admin.from("messages").delete().eq("id", messageId);
  await admin.from("reports").update({ status: "actioned" }).eq("id", reportId);
  await logAudit("moderation.delete_message", "message", messageId);
  revalidatePath("/admin/moderation");
}

export async function banUser(formData: FormData): Promise<void> {
  const reportId = String(formData.get("report_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const admin = supabaseAdmin();
  if (userId) await admin.from("profiles").update({ banned: true }).eq("user_id", userId);
  if (reportId) await admin.from("reports").update({ status: "actioned" }).eq("id", reportId);
  await logAudit("moderation.ban", "user", userId);
  revalidatePath("/admin/moderation");
}

export async function unbanUser(formData: FormData): Promise<void> {
  const userId = String(formData.get("user_id") ?? "");
  const admin = supabaseAdmin();
  await admin.from("profiles").update({ banned: false, silenced_until: null }).eq("user_id", userId);
  await logAudit("moderation.unban", "user", userId);
  revalidatePath("/admin/moderation");
}

// --- proactive moderation (no report needed) ---
export async function deleteMessage(formData: FormData): Promise<void> {
  const messageId = String(formData.get("message_id") ?? "");
  if (!messageId) return;
  await supabaseAdmin().from("messages").delete().eq("id", messageId);
  await logAudit("moderation.delete_message", "message", messageId, { proactive: true });
  revalidatePath("/admin/moderation");
}

export async function silenceUser(formData: FormData): Promise<void> {
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) return;
  await supabaseAdmin().from("profiles").update({ silenced_until: new Date(Date.now() + 24 * 3600 * 1000).toISOString() }).eq("user_id", userId);
  await logAudit("moderation.silence", "user", userId);
  revalidatePath("/admin/moderation");
}

export async function banUserById(formData: FormData): Promise<void> {
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) return;
  await supabaseAdmin().from("profiles").update({ banned: true }).eq("user_id", userId);
  await logAudit("moderation.ban", "user", userId, { proactive: true });
  revalidatePath("/admin/moderation");
}

export async function dismissReport(formData: FormData): Promise<void> {
  const reportId = String(formData.get("report_id") ?? "");
  const admin = supabaseAdmin();
  // a dismissed report = false positive: release any auto-mod silence on the target
  const { data: rep } = await admin.from("reports").select("target_user").eq("id", reportId).maybeSingle();
  await admin.from("reports").update({ status: "dismissed" }).eq("id", reportId);
  if (rep?.target_user) await admin.from("profiles").update({ silenced_until: null }).eq("user_id", rep.target_user);
  revalidatePath("/admin/moderation");
}
