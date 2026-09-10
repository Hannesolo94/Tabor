// Gateway-agnostic payment layer. Checkout creates the order, then calls
// startPayment() which dispatches to whichever provider is configured FOR THAT
// ORDER'S REGION. Switching gateways = set env config + add keys; checkout and
// order code never change. Manual is the safe default until a gateway is live.
import { peachProvider } from "./payments/peach";
import { paypalProvider } from "./payments/paypal";
import { yocoProvider } from "./payments/yoco";

export interface PaymentOrder {
  id: string;
  total: number;          // what the buyer agreed to, in THEIR currency
  currency: string;       // the currency they browsed and agreed in
  email: string;
  region: string;         // "ZA" | "INTL"
  /** What the gateway will actually move. Yoco settles ZAR only, so for an
   *  international buyer this is the rand equivalent of `total`. */
  settlementAmount?: number;
  settlementCurrency?: string;
}

export interface PaymentResult {
  redirectUrl: string | null;            // hosted checkout to send the buyer to (null = no redirect)
  provider: string;                      // recorded on the order
  ref?: string;                          // provider-side reference
  checkoutId?: string;                   // gateway's own checkout/session id
  status: "redirect" | "pending_manual";
  message?: string;
}

/** Explicit outcome rather than a boolean. A refund event also carries
 *  status "succeeded", so inferring "paid" from the status field marks refunded
 *  orders as paid. The event TYPE is the only safe signal. */
export type PaymentOutcome = "paid" | "failed" | "refunded" | "refund_failed" | "ignored";

export interface WebhookResult {
  orderId: string;
  outcome: PaymentOutcome;
  ref?: string;                          // gateway payment id
  eventId?: string;                      // webhook-id header: the dedupe key
  bodyEventId?: string;                  // event id inside the body, for the audit trail
  eventType?: string;
  settlementAmount?: number;             // what was actually captured
  settlementCurrency?: string;
  raw?: Record<string, unknown>;
}

export interface PaymentProvider {
  id: string;
  /** Create/initialise a payment. Returns where to send the buyer. */
  start(order: PaymentOrder): Promise<PaymentResult>;
  /** Verify a provider callback and report the order's paid state. Optional. */
  verifyWebhook?(req: Request): Promise<WebhookResult | null>;
}

// --- Manual provider (default until a gateway is connected) -----------------
export function pendingManual(order: PaymentOrder, provider = "manual"): PaymentResult {
  return {
    redirectUrl: null,
    provider,
    ref: order.id,
    status: "pending_manual",
    message: "Order received. Payment is being set up. We will email you a secure payment link shortly.",
  };
}
const manualProvider: PaymentProvider = { id: "manual", async start(order) { return pendingManual(order); } };

const PROVIDERS: Record<string, PaymentProvider> = {
  manual: manualProvider,
  peach: peachProvider,
  paypal: paypalProvider,
  yoco: yocoProvider,
};

/**
 * Region-aware provider selection. Set per-region env to route, e.g.:
 *   PAYMENT_PROVIDER_ZA=yoch      (or peach)
 *   PAYMENT_PROVIDER_INTL=paypal  (or peach)
 * Or a single PAYMENT_PROVIDER for both. Defaults to manual.
 */
export function providerForRegion(region: string): PaymentProvider {
  const za = process.env.PAYMENT_PROVIDER_ZA;
  const intl = process.env.PAYMENT_PROVIDER_INTL;
  const both = process.env.PAYMENT_PROVIDER;
  const id = (region === "ZA" ? za : intl) || both || "manual";
  return PROVIDERS[id] ?? manualProvider;
}

export function providerById(id: string): PaymentProvider | undefined {
  return PROVIDERS[id];
}

export async function startPayment(order: PaymentOrder): Promise<PaymentResult> {
  return providerForRegion(order.region).start(order);
}
