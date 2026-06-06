// TABOR admin AI assistant (server-only). An agentic loop over the Anthropic
// Messages API with tool use: the model can search products, pull metrics for any
// period, see best-sellers and low stock, and list discounts, then answer or
// suggest actions. The API key is read from the integrations table (set in
// Settings) or the ANTHROPIC_API_KEY env. If neither is set, it returns a notice.
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getDashboard, type RangeKey } from "@/lib/analytics-db";

const ENDPOINT = "https://api.anthropic.com/v1/messages";

async function getConfig(): Promise<{ key: string; model: string } | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("integrations").select("secret, enabled, meta").eq("provider", "anthropic").maybeSingle();
  const key = (data?.enabled && data?.secret) || process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = ((data?.meta as { model?: string } | null)?.model) || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  return { key: String(key), model };
}

const SYSTEM = `You are the TABOR backend assistant — a sharp, practical e-commerce analyst for a Christian men's apparel/gear brand (print-on-demand, South Africa + international).
You help the store owner navigate and understand their store: find products, read sales and traffic metrics for any period, spot best-sellers and low stock, and suggest concrete marketing and merchandising moves.
Use the tools to fetch real data before answering — never invent numbers. Keep answers tight and actionable, in plain language. Use the brand voice lightly (terse, direct) but stay clear. No em dashes. When you suggest marketing, be specific and tie it to the data you pulled. If the store has no orders yet, say so and focus on traffic/conversion and setup advice.`;

interface Tool { name: string; description: string; input_schema: object }
const TOOLS: Tool[] = [
  {
    name: "search_products",
    description: "Search the catalog by product name or SKU. Returns name, price, status (live/draft), stock and persona/type.",
    input_schema: { type: "object", properties: { query: { type: "string", description: "name or sku fragment" } }, required: ["query"] },
  },
  {
    name: "get_metrics",
    description: "Get the store's metrics for a period: revenue, orders, AOV, conversion, sessions, visitors, gross margin, COGS, LTV, repeat rate, cart-abandon, best-selling products + categories, traffic sources, revenue by region, and app-link clicks.",
    input_schema: { type: "object", properties: { range: { type: "string", enum: ["today", "7d", "30d", "90d"], description: "time window" } }, required: ["range"] },
  },
  {
    name: "low_stock",
    description: "List products that track inventory and are at or below 3 units (or sold out).",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "list_discounts",
    description: "List active discount codes with their percent and usage.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  const sb = supabaseAdmin();
  if (name === "search_products") {
    const q = String(input.query ?? "");
    const { data } = await sb.from("products").select("sku,name,base_price,price_za,status,inventory,track_inventory,collection,category").or(`name.ilike.%${q}%,sku.ilike.%${q}%`).limit(15);
    return (data ?? []).map((p) => ({ name: p.name, sku: p.sku, usd: p.base_price, zar: p.price_za, status: p.status, persona: p.collection, type: p.category, stock: p.track_inventory ? p.inventory : "untracked" }));
  }
  if (name === "get_metrics") {
    const d = await getDashboard((["today", "7d", "30d", "90d"].includes(String(input.range)) ? input.range : "30d") as RangeKey);
    return {
      period: `${d.fromLabel} to ${d.toLabel}`,
      revenue: d.revenue, orders: d.orderCount, aov: d.aov, grossMarginPct: d.marginPct, cogs: d.cogs, ltv: d.ltv, repeatRatePct: d.repeatRate,
      sessions: d.sessions, visitors: d.visitors, pageviews: d.pageviews, conversionPct: d.conversion, cartAbandonPct: d.cartAbandon, appClicks: d.appClicks,
      topProducts: d.topProducts, topCategories: d.topCategories, trafficSources: d.sources, revenueByRegion: d.regions,
    };
  }
  if (name === "low_stock") {
    const { data } = await sb.from("products").select("name,inventory").eq("track_inventory", true).lte("inventory", 3);
    return data ?? [];
  }
  if (name === "list_discounts") {
    const { data } = await sb.from("discount_codes").select("code,percent,active,used_count,usage_limit").order("created_at", { ascending: false });
    return data ?? [];
  }
  return { error: "unknown tool" };
}

export interface ChatMessage { role: "user" | "assistant"; content: string }

export async function runAssistant(history: ChatMessage[]): Promise<{ reply: string; configured: boolean }> {
  const cfg = await getConfig();
  if (!cfg) return { reply: "The assistant is not configured yet. Add your Anthropic API key in Settings > Integrations (provider: anthropic) and enable it.", configured: false };

  // Anthropic message list (content can be string or block array)
  const messages: { role: string; content: unknown }[] = history.slice(-12).map((m) => ({ role: m.role, content: m.content }));

  for (let i = 0; i < 6; i++) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: { "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: cfg.model, max_tokens: 1200, system: SYSTEM, tools: TOOLS, messages }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { reply: `Assistant error (${res.status}). ${t.slice(0, 160)}`, configured: true };
    }
    const data = await res.json();
    const content = (data.content ?? []) as { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }[];

    if (data.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content });
      const results = [];
      for (const block of content) {
        if (block.type === "tool_use") {
          const out = await runTool(block.name!, block.input ?? {});
          results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(out) });
        }
      }
      messages.push({ role: "user", content: results });
      continue;
    }

    const text = content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return { reply: text || "(no response)", configured: true };
  }
  return { reply: "The assistant took too many steps. Try a more specific question.", configured: true };
}
