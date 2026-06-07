// Record a donation pledge. Real card capture lands with the payment gateway;
// until then this records the intent (status 'pending') so the team can track it.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sameOrigin } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let b: { name?: string; email?: string; amount?: number; charity_id?: string; goal_id?: string; message?: string; anonymous?: boolean };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }

  const amount = Number(b.amount);
  if (!amount || amount <= 0) return NextResponse.json({ error: "Enter an amount." }, { status: 400 });
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });

  const admin = supabaseAdmin();
  const { error } = await admin.from("donations").insert({
    name: String(b.name ?? "").trim() || null,
    email,
    amount,
    currency: "ZAR",
    charity_id: b.charity_id || null,
    goal_id: b.goal_id || null,
    message: String(b.message ?? "").slice(0, 300) || null,
    anonymous: !!b.anonymous,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: "Could not record your pledge. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
