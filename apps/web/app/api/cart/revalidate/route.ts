// Reconcile a stored bag against the live catalogue.
//
// A cart lives in the visitor's localStorage indefinitely, so it drifts: the
// product gets unpublished or deleted, the price changes, or the visitor's
// currency changes and the bag is still priced in the old one. Left alone, the
// first two produce a dead end at checkout ("no longer available") that the
// buyer cannot clear, and the third shows a total that is not what they will
// be charged.
//
// Returns the current truth for each SKU, priced in the CURRENT currency.
// Anything absent from the response no longer exists and should be dropped.
import { NextResponse } from "next/server";
import { getVisitorPriceContext } from "@/lib/pricing";
import { getProductBySku } from "@/lib/products-db";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await rateLimit(`cart-revalidate:${clientIp(req)}`, 60, 60))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: { skus?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }

  const skus = Array.isArray(body.skus)
    ? body.skus.filter((s): s is string => typeof s === "string").slice(0, 50)
    : [];
  if (!skus.length) return NextResponse.json({ currency: null, items: [] });

  const ctx = await getVisitorPriceContext();
  const items = [];
  for (const sku of [...new Set(skus)]) {
    const p = await getProductBySku(sku, ctx);
    if (!p) continue; // gone: caller drops the line
    items.push({
      sku: p.sku,
      name: p.name,
      price: p.price,
      symbol: p.currencySymbol,
      currency: p.currencyCode,
      sizePrices: p.sizePrices ?? null,
      inStock: p.inStock,
    });
  }

  return NextResponse.json({ currency: ctx.currency, symbol: ctx.symbol, items });
}
