// Create a return/RMA request (service role). Tries to link to a real order by
// matching the ref + email.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sameOrigin } from "@/lib/http";

const REASONS = new Set(["defect", "wrong_item", "sizing", "other"]);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let b: { orderRef?: string; email?: string; reason?: string; detail?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }

  const email = String(b.email ?? "").trim().toLowerCase();
  const orderRef = String(b.orderRef ?? "").trim();
  const reason = REASONS.has(String(b.reason)) ? String(b.reason) : "other";
  if (!email || !email.includes("@")) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  if (!orderRef) return NextResponse.json({ error: "Your order reference is required." }, { status: 400 });

  const admin = supabaseAdmin();
  // best-effort link to an order (by full id or short prefix + email)
  let orderId: string | null = null;
  const { data: byEmail } = await admin.from("orders").select("id").eq("email", email).order("created_at", { ascending: false }).limit(50);
  const match = (byEmail ?? []).find((o) => o.id === orderRef || o.id.slice(0, 8).toLowerCase() === orderRef.toLowerCase());
  if (match) orderId = match.id;

  const { error } = await admin.from("return_requests").insert({ order_ref: orderRef, order_id: orderId, email, reason, detail: String(b.detail ?? "").slice(0, 2000) });
  if (error) return NextResponse.json({ error: "Could not submit your request. Please try again." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
