// Gateway-agnostic checkout. Recomputes every price server-side from the DB
// (never trusts the client cart), validates the discount, creates the order with
// the service role, then starts payment via the configured provider.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProductBySku } from "@/lib/products-db";
import { getRegion } from "@/lib/region";
import { REGIONS } from "@/lib/region";
import { startPayment } from "@/lib/payments";
import { sendEmail, emailShell } from "@/lib/email";
import { sameOrigin } from "@/lib/http";

interface InItem { sku: string; size?: string; qty?: number }
interface Body { items?: InItem[]; email?: string; shipping?: Record<string, string>; discountCode?: string }

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: Body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  const items = (body.items ?? []).filter((i) => i && typeof i.sku === "string");
  if (!items.length) return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });

  const shipping = body.shipping ?? {};
  for (const f of ["name", "line1", "city", "postal", "country"]) {
    if (!String(shipping[f] ?? "").trim()) return NextResponse.json({ error: `Shipping ${f} is required.` }, { status: 400 });
  }

  const region = await getRegion();
  const cur = REGIONS[region];

  // recompute every line from the DB for this region
  const lines: { sku: string; name: string; size: string | null; qty: number; price: number }[] = [];
  let subtotal = 0;
  for (const it of items) {
    const p = await getProductBySku(it.sku, region);
    if (!p || !p.inStock) return NextResponse.json({ error: `"${it.sku}" is no longer available.` }, { status: 409 });
    const qty = Math.max(1, Math.min(99, Number(it.qty ?? 1) || 1));
    const price = p.price; // server price, region-correct
    subtotal += price * qty;
    lines.push({ sku: p.sku, name: p.name, size: it.size ?? null, qty, price });
  }

  // validate discount
  const admin = supabaseAdmin();
  let discountAmount = 0;
  let discountCode: string | null = null;
  let discountUsed = 0;
  const code = String(body.discountCode ?? "").trim().toUpperCase();
  if (code) {
    const { data: d } = await admin.from("discount_codes")
      .select("code, value_type, percent, amount, active, usage_limit, used_count, min_subtotal, starts_at, ends_at, once_per_email")
      .eq("code", code).maybeSingle();
    const reject = (msg: string) => NextResponse.json({ error: msg }, { status: 400 });
    const nowMs = Date.now();
    if (!d || !d.active) return reject("That discount code is not valid.");
    if (d.starts_at && new Date(d.starts_at).getTime() > nowMs) return reject("That discount code is not active yet.");
    if (d.ends_at && new Date(d.ends_at).getTime() < nowMs) return reject("That discount code has expired.");
    if (d.usage_limit && Number(d.used_count) >= Number(d.usage_limit)) return reject("That discount code has reached its limit.");
    if (d.min_subtotal && subtotal < Number(d.min_subtotal)) return reject(`This code needs a minimum subtotal of ${cur.symbol}${Number(d.min_subtotal).toFixed(2)}.`);
    if (d.once_per_email) {
      const { count } = await admin.from("orders").select("id", { count: "exact", head: true }).eq("discount_code", d.code).eq("email", email).neq("status", "cancelled");
      if ((count ?? 0) > 0) return reject("You have already used this code.");
    }
    discountAmount = d.value_type === "fixed"
      ? Math.min(subtotal, Math.max(0, Number(d.amount) || 0))
      : Math.round(subtotal * (Number(d.percent) / 100) * 100) / 100;
    discountCode = d.code;
    discountUsed = Number(d.used_count) || 0;
  }

  const shippingAmount = 0; // flat/free for now; real rates land with the gateway + shipping zones
  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  // create order (pending payment)
  const { data: order, error } = await admin.from("orders").insert({
    email,
    region,
    currency: cur.code,
    status: "pending_payment",
    items: lines,
    subtotal,
    discount_code: discountCode,
    discount_amount: discountAmount,
    shipping_amount: shippingAmount,
    total,
    shipping,
    supplier: "unassigned",
  }).select("id").single();

  if (error || !order) return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });

  // start payment via the configured provider
  const pay = await startPayment({ id: order.id, total, currency: cur.code, email, region });
  await admin.from("orders").update({ payment_provider: pay.provider, payment_ref: pay.ref ?? null }).eq("id", order.id);
  if (discountCode) await admin.from("discount_codes").update({ used_count: discountUsed + 1 }).eq("code", discountCode);

  // order confirmation email (branded, best-effort — never blocks the order)
  try {
    const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch] ?? ch));
    const itemRows = lines.map((l) => `<tr><td style="padding:6px 0;color:#C3BDB1;font-family:Georgia,serif;font-size:14px">${esc(l.name)}${l.size ? ` (${esc(l.size)})` : ""} &times; ${l.qty}</td><td align="right" style="padding:6px 0;color:#E8E2D5;font-family:Georgia,serif;font-size:14px">${cur.symbol}${(l.price * l.qty).toFixed(2)}</td></tr>`).join("");
    const summary = `<table role="presentation" width="100%" style="border-collapse:collapse;margin:6px 0">${itemRows}<tr><td style="padding-top:10px;border-top:1px solid rgba(201,169,97,0.2);color:#8A847A;font-family:Georgia,serif;font-size:13px">TOTAL</td><td align="right" style="padding-top:10px;border-top:1px solid rgba(201,169,97,0.2);color:#C9A961;font-weight:bold;font-family:Georgia,serif;font-size:15px">${cur.symbol}${total.toFixed(2)}</td></tr></table>`;
    const html = emailShell(
      "Order received",
      `Thank you, ${esc(shipping.name)}. Your order is in.<br/><br/>${summary}<br/>${pay.message ?? "We will be in touch with the next steps."}`,
      { eyebrow: "[ ORDER CONFIRMED ]", preheader: `Your TABOR order — ${cur.symbol}${total.toFixed(2)}` },
    );
    await sendEmail(email, "TABOR: order received", html);
  } catch { /* email is non-critical */ }

  return NextResponse.json({ orderId: order.id, total, currency: cur.code, symbol: cur.symbol, redirectUrl: pay.redirectUrl, status: pay.status, message: pay.message });
}
