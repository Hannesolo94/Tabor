// printful-order — submits a paid order to the correct supplier.
// Called server-side after payment confirmation (Stripe webhook or Shopify).
// Geo-routing: African destinations go to the SA PoD, the rest to Printful.
// See docs/COMMERCE.md. This is a scaffold; wire real variant mapping + the SA
// PoD order API before going live.

import { corsHeaders, json } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

interface OrderBody {
  region: string;
  currency: string;
  recipient: Record<string, unknown>;
  items: Array<{ sku: string; quantity: number }>;
  userId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: OrderBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const supabase = serviceClient();
  const supplier = body.region === "ZA" ? "SA PoD" : "Printful";

  // TODO: map each sku -> supplier_variant_id via product_suppliers, then call
  // the supplier order API. For now we record the order as pending.
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: body.userId ?? null,
      supplier,
      region: body.region,
      currency: body.currency,
      status: "pending",
      items: body.items,
    })
    .select("id")
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ orderId: data.id, supplier, status: "pending" });
});
