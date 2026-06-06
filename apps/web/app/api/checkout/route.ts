// Gateway-agnostic checkout. Recomputes every price server-side from the DB
// (never trusts the client cart), validates the discount, creates the order with
// the service role, then starts payment via the configured provider.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProductBySku } from "@/lib/products-db";
import { getRegion } from "@/lib/region";
import { REGIONS } from "@/lib/region";
import { startPayment } from "@/lib/payments";
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
    const { data: d } = await admin.from("discount_codes").select("code, percent, active, usage_limit, used_count").eq("code", code).maybeSingle();
    if (d && d.active && (!d.usage_limit || d.used_count < d.usage_limit)) {
      discountAmount = Math.round(subtotal * (Number(d.percent) / 100) * 100) / 100;
      discountCode = d.code;
      discountUsed = Number(d.used_count) || 0;
    } else {
      return NextResponse.json({ error: "That discount code is not valid." }, { status: 400 });
    }
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

  return NextResponse.json({ orderId: order.id, total, currency: cur.code, symbol: cur.symbol, redirectUrl: pay.redirectUrl, status: pay.status, message: pay.message });
}
