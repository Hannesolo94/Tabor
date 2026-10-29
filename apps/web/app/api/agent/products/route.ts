// Products for the BurgerBot hub's TABOR > PRODUCTS tab: every product with its live/draft status,
// image, collection and shelf price in the main currencies (the same priceFor() the storefront uses).
// POST { action: "status", sku, status: "live" | "draft" } or { action: "featured", sku, value }.
// The hub only sends POSTs from Hannes's devices. Agent key.
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { agentAuthorized } from "@/lib/agent-auth";
import { getPriceContext, priceFor } from "@/lib/pricing";

export const dynamic = "force-dynamic";
const SHOW = ["USD", "ZAR", "EUR", "GBP"];

export async function GET(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [{ data, error }, ...ctxs] = await Promise.all([
    supabaseAdmin().from("products").select("sku, name, collection, category, status, base_price, cost, image_url, featured, sizes, printful_id, created_at, sort, note").order("status", { ascending: false }).order("sort").order("sku"),
    ...SHOW.map((c) => getPriceContext(c)),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // products Hannes archived (e.g. the tank tops, Oct 29) stay hidden drafts and drop out of the hub
  const products = (data ?? []).filter((p) => !/^ARCHIVED/.test(String(p.note ?? ""))).map(({ note: _note, ...p }) => ({
    ...p,
    prices: Object.fromEntries(ctxs.map((ctx) => [ctx.currency, { symbol: ctx.symbol, price: priceFor(p.sku, p.base_price, ctx) }])),
    margin: p.base_price && p.cost ? Math.round(((Number(p.base_price) - Number(p.cost)) / Number(p.base_price)) * 100) : null,
    ready: !!(p.image_url && p.printful_id && Number(p.base_price) > 0 && (p.sizes ?? []).length),
  }));
  return NextResponse.json({ products, fxStale: ctxs.some((c) => c.fxStale) });
}

export async function POST(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const sku = String(b.sku ?? "");
  const sb = supabaseAdmin();
  const { data: p } = await sb.from("products").select("sku, image_url, printful_id, base_price, sizes").eq("sku", sku).maybeSingle();
  if (!p) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  let patch: Record<string, unknown>;
  if (b.action === "status") {
    const live = b.status === "live";
    if (live && !(p.image_url && p.printful_id && Number(p.base_price) > 0 && (p.sizes ?? []).length)) return NextResponse.json({ error: "Not ready to go live: it needs an image, a Printful product, a price and sizes." }, { status: 400 });
    patch = { status: live ? "live" : "draft" };
  } else if (b.action === "featured") patch = { featured: !!b.value };
  else return NextResponse.json({ error: "unknown action" }, { status: 400 });

  const { error } = await sb.from("products").update(patch).eq("sku", sku);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await sb.from("audit_log").insert({ actor: "agent", action: `product.${b.action}`, entity: "product", entity_id: sku, detail: { ...patch, via: "burgerbot-hub" } });
  for (const path of ["/", "/shop", `/product/${sku}`, "/admin/products"]) revalidatePath(path);
  return NextResponse.json({ ok: true, sku, ...patch });
}
