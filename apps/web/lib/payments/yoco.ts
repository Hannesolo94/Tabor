// Yoco Checkout API. https://developer.yoco.com
//
// Yoco settles EXCLUSIVELY IN ZAR. International cards are accepted (3.40% vs
// 2.95% local, ex VAT) but the charge is always in rand, so the amount we send
// here is the order total converted to ZAR, not the currency the buyer browsed in.
//
// Two rules straight from their docs, both load-bearing:
//   1. successUrl must NEVER be treated as proof of payment. Only the webhook is.
//   2. The webhook carries a PAYMENT id and no checkout id, so the order id has
//      to travel in metadata and come back that way.
import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pendingManual, type PaymentOrder, type PaymentResult, type PaymentProvider, type WebhookResult, type PaymentOutcome } from "../payments";

const API = "https://payments.yoco.com/api";
const TOLERANCE_SECONDS = 180;  // their recommended replay window
const MIN_CENTS = 200;          // Yoco rejects anything under R2.00

interface YocoCreds { secret: string; webhookSecret?: string; mode?: string }

async function creds(): Promise<YocoCreds | null> {
  const { data } = await supabaseAdmin()
    .from("integrations")
    .select("secret, enabled, meta")
    .eq("provider", "yoco")
    .maybeSingle();
  if (!data?.enabled || !data.secret) return null;
  const meta = (data.meta ?? {}) as { webhookSecret?: string; mode?: string };
  return { secret: String(data.secret), webhookSecret: meta.webhookSecret, mode: meta.mode };
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://tabor.quest").replace(/\/$/, "");
}

export const yocoProvider: PaymentProvider = {
  id: "yoco",

  async start(order: PaymentOrder): Promise<PaymentResult> {
    const c = await creds();
    if (!c) return pendingManual(order, "yoco");

    // Yoco takes cents, and only ZAR. `order.total` has already been converted
    // by the checkout route; settlementAmount is the authoritative rand figure.
    const amountZar = Number(order.settlementAmount ?? order.total);
    const cents = Math.round(amountZar * 100);
    if (!Number.isFinite(cents) || cents < MIN_CENTS) {
      return { redirectUrl: null, provider: "yoco", status: "pending_manual", message: "That total is below the minimum this gateway accepts." };
    }

    const body = {
      amount: cents,
      currency: "ZAR",
      successUrl: `${siteUrl()}/checkout/done?order=${order.id}`,
      cancelUrl: `${siteUrl()}/checkout?cancelled=1`,
      failureUrl: `${siteUrl()}/checkout?failed=1`,
      externalId: order.id,
      // The webhook has no checkout id, so this is the ONLY way back to the order.
      metadata: { orderId: order.id, email: order.email, displayCurrency: order.currency },
    };

    let res: Response;
    try {
      res = await fetch(`${API}/checkouts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${c.secret}`,
          "Content-Type": "application/json",
          "Idempotency-Key": order.id, // one checkout per order, however many retries
        },
        body: JSON.stringify(body),
      });
    } catch {
      return pendingManual(order, "yoco");
    }

    const json = (await res.json().catch(() => null)) as { id?: string; redirectUrl?: string; status?: string } | null;
    if (!res.ok || !json?.redirectUrl) {
      return {
        redirectUrl: null,
        provider: "yoco",
        status: "pending_manual",
        message: "We could not start the payment. Your order is saved and we will email you a payment link.",
      };
    }

    return {
      redirectUrl: json.redirectUrl,
      provider: "yoco",
      ref: json.id ?? order.id,
      checkoutId: json.id,
      status: "redirect",
    };
  },

  /**
   * Verify per Yoco's spec: HMAC-SHA256 over `{webhook-id}.{webhook-timestamp}.{raw body}`
   * with the secret base64-decoded after stripping its `whsec_` prefix, compared
   * in constant time, inside a 3 minute window.
   */
  async verifyWebhook(req: Request): Promise<WebhookResult | null> {
    const c = await creds();
    if (!c?.webhookSecret) return null;

    const id = req.headers.get("webhook-id");
    const timestamp = req.headers.get("webhook-timestamp");
    const signature = req.headers.get("webhook-signature");
    if (!id || !timestamp || !signature) return null;

    // Reject stale deliveries so a captured request cannot be replayed later.
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return null;

    const raw = await req.text(); // MUST be the raw body: re-serialised JSON will not match

    const secretBytes = Buffer.from(c.webhookSecret.split("_")[1] ?? "", "base64");
    if (!secretBytes.length) return null;
    const expected = createHmac("sha256", secretBytes).update(`${id}.${timestamp}.${raw}`).digest("base64");

    // Header is a space-separated list of `v1,<sig>`; any one matching is valid.
    const candidates = signature.split(" ").map((s) => s.split(",")[1] ?? s);
    const expBuf = Buffer.from(expected);
    const ok = candidates.some((cand) => {
      const buf = Buffer.from(cand);
      return buf.length === expBuf.length && timingSafeEqual(buf, expBuf);
    });
    if (!ok) return null;

    let event: { id?: string; type?: string; payload?: Record<string, unknown> };
    try { event = JSON.parse(raw); } catch { return null; }

    const payload = (event.payload ?? {}) as {
      id?: string; amount?: number; currency?: string; status?: string; metadata?: { orderId?: string };
    };
    const orderId = payload.metadata?.orderId;
    if (!orderId) return null;

    // Switch on the event TYPE only. payload.status is "succeeded" for a refund
    // too, so trusting it would mark a refunded order as paid.
    const outcome: PaymentOutcome =
      event.type === "payment.succeeded" ? "paid"
      : event.type === "payment.failed" ? "failed"
      : event.type === "refund.succeeded" ? "refunded"
      : event.type === "refund.failed" ? "refund_failed"
      : "ignored";

    return {
      orderId,
      outcome,
      ref: payload.id,
      eventId: id,            // the webhook-id HEADER: the doc's dedupe key
      bodyEventId: event.id,
      eventType: event.type,
      settlementAmount: typeof payload.amount === "number" ? payload.amount / 100 : undefined,
      settlementCurrency: payload.currency,
      raw: event as Record<string, unknown>,
    };
  },
};

/**
 * Refund a checkout. Yoco refunds by CHECKOUT id, not payment id, which is why
 * orders.gateway_checkout_id is stored. Returns 202 and confirms asynchronously
 * via a refund.succeeded webhook. Live keys only: refunds cannot be tested.
 */
export async function refundYocoCheckout(checkoutId: string, amountZar?: number, idempotencyKey?: string): Promise<{ ok: boolean; error?: string }> {
  const c = await creds();
  if (!c) return { ok: false, error: "Yoco credentials are not set." };
  const headers: Record<string, string> = { Authorization: `Bearer ${c.secret}`, "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  let res: Response;
  try {
    res = await fetch(`${API}/checkouts/${encodeURIComponent(checkoutId)}/refund`, {
      method: "POST",
      headers,
      // Omit amount for a full refund; cents for a partial one.
      body: JSON.stringify(amountZar != null ? { amount: Math.round(amountZar * 100) } : {}),
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "could not reach Yoco" };
  }
  if (res.status === 202 || res.ok) return { ok: true };

  // Yoco puts the reason in `description`, not `message`. Reading the wrong
  // field turned "The specified transaction could not be found" into the
  // useless "Yoco returned 400".
  const j = (await res.json().catch(() => null)) as { description?: string; message?: string } | null;
  let error = j?.description ?? j?.message ?? `Yoco returned ${res.status}`;

  // The most likely cause by far, and invisible otherwise: the checkout was
  // created under one key and is being refunded under the other.
  if (/could not be found/i.test(error)) {
    const mode = c.secret.startsWith("sk_live_") ? "live" : "test";
    error += ` (refunding with the ${mode} key; a checkout created with the other key is invisible to it)`;
  }
  return { ok: false, error };
}

/** One-off: register the webhook and return the secret (shown only once). */
export async function registerYocoWebhook(url: string, name = "tabor"): Promise<{ ok: boolean; secret?: string; error?: string }> {
  const c = await creds();
  if (!c) return { ok: false, error: "Yoco credentials are not set in Settings > Integrations." };
  const res = await fetch(`${API}/webhooks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, url }),
  });
  const json = (await res.json().catch(() => null)) as { secret?: string; message?: string } | null;
  if (!res.ok || !json?.secret) return { ok: false, error: json?.message ?? `Yoco returned ${res.status}` };
  return { ok: true, secret: json.secret };
}

/** Read-only call used by the admin "Test connection" button. */
export async function yocoPing(): Promise<{ ok: boolean; mode?: string; error?: string }> {
  const c = await creds();
  if (!c) return { ok: false, error: "No credentials saved." };
  try {
    // Creating nothing: list webhooks is the cheapest authenticated read.
    const res = await fetch(`${API}/webhooks`, { headers: { Authorization: `Bearer ${c.secret}` } });
    if (res.status === 401 || res.status === 403) return { ok: false, error: "Key rejected. It may have been rotated." };
    if (!res.ok) return { ok: false, error: `Yoco returned ${res.status}` };
    return { ok: true, mode: c.secret.includes("test") ? "test" : "live" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}
