"use server";

// Customer CRM actions. Notes use the admin RLS session; the destructive
// delete uses the service role (waitlist has no admin-delete RLS policy, and we
// may need to remove an auth user). POPIA/GDPR right-to-erasure: wipe everything
// we hold for that email.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isCallerOwner } from "@/lib/admin-guard";
import { omnisendAddContact } from "@/lib/omnisend";
import { logAudit } from "@/lib/audit";

/** Push all existing waitlist contacts to the email platform (if enabled). */
export async function syncAllToEmailPlatform(): Promise<void> {
  const admin = supabaseAdmin();
  const { data } = await admin.from("waitlist").select("email, source");
  for (const r of data ?? []) {
    await omnisendAddContact(r.email, [r.source || "web"]);
  }
  revalidatePath("/admin/customers");
}

export async function addTag(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const tag = String(formData.get("tag") ?? "").trim().toLowerCase();
  if (!email || !tag) return;
  const sb = await supabaseServer();
  await sb.from("customer_tags").upsert({ email, tag });
  revalidatePath(`/admin/customers/${encodeURIComponent(email)}`);
}

export async function removeTag(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const tag = String(formData.get("tag") ?? "");
  const sb = await supabaseServer();
  await sb.from("customer_tags").delete().eq("email", email).eq("tag", tag);
  revalidatePath(`/admin/customers/${encodeURIComponent(email)}`);
}

export async function addNote(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!email || !body) return;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  await sb.from("customer_notes").insert({ email, body, author: user?.email ?? "admin" });
  revalidatePath(`/admin/customers/${encodeURIComponent(email)}`);
}

export async function deleteNote(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const email = String(formData.get("email") ?? "");
  const sb = await supabaseServer();
  await sb.from("customer_notes").delete().eq("id", id);
  revalidatePath(`/admin/customers/${encodeURIComponent(email)}`);
}

/** Hard delete: remove all data we hold for this email. OWNER ONLY (irreversible). */
export async function deleteCustomer(formData: FormData): Promise<void> {
  if (!(await isCallerOwner())) return; // wiping an account is owner-only
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;

  const admin = supabaseAdmin();
  // waitlist + notes
  await admin.from("waitlist").delete().eq("email", email);
  await admin.from("customer_notes").delete().eq("email", email);
  // if a registered auth user exists for this email, deleting them cascades
  // their owned rows (orders/votes/etc).
  const { data: prof } = await admin.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (prof?.user_id) {
    await admin.from("profiles").delete().eq("user_id", prof.user_id);
    await admin.auth.admin.deleteUser(prof.user_id);
  }

  await logAudit("customer.erase", "customer", email, { hadAccount: !!prof?.user_id });
  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}
