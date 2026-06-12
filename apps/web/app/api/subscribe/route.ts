// Public signup endpoint: records the email in the waitlist and (if Omnisend is
// enabled in Settings) syncs the contact with a source tag. Used by the waitlist
// form and the promo popup.
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { omnisendAddContact } from "@/lib/omnisend";
import { sendEmail, emailShell } from "@/lib/email";
import { sameOrigin } from "@/lib/http";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!(await rateLimit(`subscribe:${clientIp(req)}`, 10, 60))) return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
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
  const isNew = !error; // 23505 = already subscribed -> don't re-welcome

  // best-effort email-platform sync (never blocks the signup)
  await omnisendAddContact(email, [source]);

  // welcome email with the 10% code (only on a fresh signup)
  if (isNew) {
    try {
      const html = emailShell(
        "Welcome to the brotherhood",
        `You're on the list, brother. When the gear drops, you'll be first to know.<br/><br/>Here's <strong>10% off</strong> your first order:<br/><br/><span style="display:inline-block;border:1px dashed #C9A961;color:#C9A961;font-family:'Courier New',monospace;letter-spacing:3px;font-size:18px;padding:10px 18px">FIRE10</span><br/><br/>Sons of Fire. Forged not bought.`,
        { eyebrow: "[ WELCOME ]", cta: { label: "Shop the gear", url: "https://tabor.quest/shop" }, footnote: "You're receiving this because you signed up at tabor.quest." },
      );
      await sendEmail(email, "Welcome to TABOR — 10% off inside", html);
    } catch { /* welcome email is non-critical */ }
  }

  return NextResponse.json({ ok: true });
}
