// Gateway-agnostic payment layer. The checkout creates the order, then calls
// startPayment() which dispatches to whichever provider is configured. Adding a
// real gateway later (Peach, Stripe, Paystack, Yoco...) means implementing one
// PaymentProvider and registering it — checkout/orders code does not change.

export interface PaymentOrder {
  id: string;
  total: number;
  currency: string;
  email: string;
  region: string;
}

export interface PaymentResult {
  // where to send the buyer to pay (hosted checkout). Null = no redirect.
  redirectUrl: string | null;
  // provider identifier recorded on the order
  provider: string;
  // provider-side reference, if any
  ref?: string;
  // human status for the confirmation screen
  status: "redirect" | "pending_manual";
  message?: string;
}

export interface PaymentProvider {
  id: string;
  /** Create/initialise a payment for an order. Returns where to send the buyer. */
  start(order: PaymentOrder): Promise<PaymentResult>;
}

// --- Manual provider (default until a gateway is connected) -----------------
// Records the order as pending and tells the buyer we will reach out / they can
// pay on delivery or by EFT. Lets the whole flow work end-to-end with no gateway.
const manualProvider: PaymentProvider = {
  id: "manual",
  async start(order) {
    return {
      redirectUrl: null,
      provider: "manual",
      ref: order.id,
      status: "pending_manual",
      message: "Order received. Payment is being set up. We will email you a secure payment link shortly.",
    };
  },
};

// Register future gateways here, e.g.:
//   import { peachProvider } from "./payments/peach";
//   const PROVIDERS = { manual: manualProvider, peach: peachProvider };
const PROVIDERS: Record<string, PaymentProvider> = {
  manual: manualProvider,
};

/** Which provider to use. Set PAYMENT_PROVIDER env when a gateway is live. */
export function activeProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER || "manual";
  return PROVIDERS[id] ?? manualProvider;
}

export async function startPayment(order: PaymentOrder): Promise<PaymentResult> {
  return activeProvider().start(order);
}
