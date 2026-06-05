// Public signup endpoint: records the email in the waitlist and (if Omnisend is
// enabled in Settings) syncs the contact with a source tag. Used by the waitlist
// form and the promo popup.
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { omnisendAddContact } from "@/lib/omnisend";
import { sameOrigin } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const source = body.source ?? "web";
  if (!email.includes("@")) return NextResponse.json({ error: "invalid email" }, { status: 400 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { error } = await sb.from("waitlist").insert({ email, source });
  if (error && error.code !== "23505") {
    // 23505 = already on the list; treat as success
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // best-effort email-platform sync (never blocks the signup)
  await omnisendAddContact(email, [source]);

  return NextResponse.json({ ok: true });
}
