// QA stress test: seed varied + edge-case fake orders, then run the dashboard's own
// math against them to find what breaks. All rows tagged payment_ref='QA_STRESS' for cleanup.
import { readFileSync } from "node:fs";
import pg from "pg";
import crypto from "node:crypto";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const arg = process.argv[2];

if (arg === "clean") {
  const r = await c.query("delete from orders where payment_ref='QA_STRESS'");
  console.log(`Removed ${r.rowCount} QA_STRESS orders.`);
  await c.end();
  process.exit(0);
}

// ---- introspect ----
const fk = await c.query(`select ccu.table_name as ref from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu on tc.constraint_name=kcu.constraint_name
  join information_schema.constraint_column_usage ccu on tc.constraint_name=ccu.constraint_name
  where tc.constraint_type='FOREIGN KEY' and tc.table_name='orders' and kcu.column_name='user_id'`);
const userIdFk = fk.rows.length ? fk.rows[0].ref : null;
console.log("orders.user_id FK ->", userIdFk || "NONE");
const cc = await c.query(`select pg_get_constraintdef(oid) def from pg_constraint where conrelid='public.orders'::regclass and contype='c'`);
console.log("orders CHECK:", cc.rows.map((r) => r.def).join(" | ") || "none");

const prods = (await c.query("select sku,name,base_price,cost,category,collection,price_za from products")).rows;
// real users (orders.user_id has a FK to auth.users, so we can only attach to existing accounts)
const realUsers = (await c.query("select user_id, email from profiles where user_id is not null limit 6")).rows;
console.log("real users available for attaching orders:", realUsers.length);

// ---- generate orders ----
const DAY = 86400000;
const now = Date.now();
const rint = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rint(a.length)];
const usAddr = () => ({ name: pick(["Caleb Stone","Jared Hall","Marcus Vance","Eli Webb","Noah Frost"]), address1: `${rint(9000)+100} ${pick(["Oak","Harper","Cedar","Pine"])} St`, city: pick(["Austin","Denver","Fontana","Mesa"]), state: pick(["TX","CO","CA","AZ"]), zip: String(10000+rint(89999)), country: "US", phone: `+1 ${rint(900)+100}-${rint(900)+100}-${rint(9000)+1000}` });
const zaAddr = () => ({ name: pick(["Pieter Botha","Sipho Dlamini","Johan Roux"]), address1: `${rint(200)+1} ${pick(["Kerk","Loop","Main"])} St`, city: pick(["Cape Town","Pretoria","Durban"]), state: pick(["WC","GP","KZN"]), zip: String(1000+rint(8999)), country: "ZA", phone: `+27 ${rint(90)+10} ${rint(900)+100} ${rint(9000)+1000}` });

// can only attach to real accounts (FK); rest are guests
const userPool = realUsers;

const rows = [];
function order(o) {
  rows.push({
    id: crypto.randomUUID(), user_id: o.user_id ?? null, printful_order_id: o.pf ?? null,
    supplier: o.supplier ?? "printful", region: o.region ?? "INTL", currency: o.currency ?? "USD",
    status: o.status, total: o.total, items: JSON.stringify(o.items ?? []), created_at: new Date(o.at).toISOString(),
    email: o.email ?? null, shipping: o.shipping === undefined ? "{}" : JSON.stringify(o.shipping),
    subtotal: o.subtotal ?? null, discount_code: o.discount_code ?? null, discount_amount: o.discount_amount ?? 0,
    shipping_amount: o.shipping_amount ?? 0, payment_provider: o.payment_provider ?? "manual", payment_ref: "QA_STRESS",
  });
}

// 45 normal-ish orders over 75 days
const STATUSES = ["paid","paid","paid","fulfilled","fulfilled","shipped","pending","cancelled","refunded"];
for (let i = 0; i < 45; i++) {
  const za = Math.random() < 0.3;
  const nItems = 1 + rint(4);
  const items = Array.from({ length: nItems }, () => { const p = pick(prods); const qty = 1 + rint(3); const price = za ? Math.round(Number(p.base_price) * 18.5) : Number(p.base_price); return { sku: p.sku, name: p.name, qty, price }; });
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const hasDisc = Math.random() < 0.25;
  const discount = hasDisc ? Math.round(subtotal * 0.1) : 0;
  const ship = za ? (Math.random() < 0.5 ? 60 : 0) : (subtotal > 75 ? 0 : 7.9);
  const u = Math.random() < 0.45 && userPool.length ? pick(userPool) : null;
  order({
    user_id: u?.user_id ?? null,
    region: za ? "ZA" : "INTL", currency: za ? "ZAR" : "USD",
    status: pick(STATUSES), items, subtotal, discount_amount: discount, discount_code: hasDisc ? "FIRE10" : null,
    shipping_amount: ship, total: subtotal - discount + ship,
    email: u?.email ?? `qa.guest${i}@stress.test`,
    shipping: za ? zaAddr() : usAddr(), pf: `PLD#${90000 + i}`,
    at: now - rint(75) * DAY - rint(86400000),
  });
}

// ---- deliberate EDGE CASES ----
const P = prods[0];
order({ label: "null total", status: "paid", total: null, subtotal: 40, items: [{ sku: P.sku, name: P.name, qty: 1, price: 40 }], email: "edge.nulltotal@stress.test", shipping: usAddr(), at: now - 2 * DAY });
order({ label: "empty items", status: "paid", total: 35, subtotal: 35, items: [], email: "edge.noitems@stress.test", shipping: usAddr(), at: now - 3 * DAY });
order({ label: "item null price", status: "paid", total: 0, subtotal: 0, items: [{ sku: P.sku, name: P.name, qty: 2, price: null }], email: "edge.nullprice@stress.test", shipping: usAddr(), at: now - 4 * DAY });
order({ label: "huge qty/value", status: "paid", total: 50000, subtotal: 50000, items: [{ sku: P.sku, name: P.name, qty: 999, price: 50 }], email: "edge.whale@stress.test", shipping: usAddr(), at: now - 1 * DAY });
order({ label: "unknown SKU", status: "fulfilled", total: 99, subtotal: 99, items: [{ sku: "ZZZ-NOPE", name: "Ghost Item", qty: 1, price: 99 }], email: "edge.ghostsku@stress.test", shipping: usAddr(), at: now - 5 * DAY });
order({ label: "no shipping", status: "paid", total: 22, subtotal: 22, items: [{ sku: P.sku, name: P.name, qty: 1, price: 22 }], email: "edge.noship@stress.test", shipping: undefined, at: now - 6 * DAY });
order({ label: "discount>subtotal (neg total)", status: "paid", total: -10, subtotal: 20, discount_amount: 30, discount_code: "OVER", items: [{ sku: P.sku, name: P.name, qty: 1, price: 20 }], email: "edge.negtotal@stress.test", shipping: usAddr(), at: now - 7 * DAY });
order({ label: "no email no user", status: "paid", total: 18, subtotal: 18, items: [{ sku: P.sku, name: P.name, qty: 1, price: 18 }], email: null, shipping: usAddr(), at: now - 8 * DAY });
order({ label: "future-dated", status: "pending", total: 45, subtotal: 45, items: [{ sku: P.sku, name: P.name, qty: 1, price: 45 }], email: "edge.future@stress.test", shipping: usAddr(), at: now + 2 * DAY });

// ---- insert ----
let ok = 0, fail = 0; const errors = [];
for (const r of rows) {
  try {
    await c.query(
      `insert into orders (id,user_id,printful_order_id,supplier,region,currency,status,total,items,created_at,email,shipping,subtotal,discount_code,discount_amount,shipping_amount,payment_provider,payment_ref)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [r.id, r.user_id, r.printful_order_id, r.supplier, r.region, r.currency, r.status, r.total, r.items, r.created_at, r.email, r.shipping, r.subtotal, r.discount_code, r.discount_amount, r.shipping_amount, r.payment_provider, r.payment_ref]
    );
    ok++;
  } catch (e) { fail++; errors.push(e.message); }
}
console.log(`\nInserted ${ok} orders, ${fail} failed.`);
if (errors.length) console.log("INSERT ERRORS:", [...new Set(errors)]);

// ---- verify: replicate the dashboard's core math (last 30d) ----
const fromIso = new Date(now - 29 * DAY).toISOString();
const live = (await c.query(`select total,items,status,region,currency,created_at,user_id from orders where payment_ref='QA_STRESS' and created_at >= $1 and created_at < now()`, [fromIso])).rows;
const active = live.filter((o) => o.status !== "cancelled");
const revenue = active.reduce((s, o) => s + Number(o.total || 0), 0);
const orderCount = active.length;
const aov = orderCount ? revenue / orderCount : 0;
const prodMap = new Map(prods.map((p) => [p.sku, p]));
let cogs = 0; const best = new Map();
for (const o of active) {
  for (const it of (Array.isArray(o.items) ? o.items : [])) {
    const qty = Number(it.qty ?? it.quantity ?? 1) || 1; const price = Number(it.price ?? 0) || 0;
    const p = it.sku ? prodMap.get(it.sku) : null;
    cogs += (Number(p?.cost) || 0) * qty;
    if (it.sku) { const b = best.get(it.sku) ?? { qty: 0, rev: 0, known: !!p }; b.qty += qty; b.rev += price * qty; b.known = !!p; best.set(it.sku, b); }
  }
}
const margin = revenue - cogs; const marginPct = revenue ? (margin / revenue) * 100 : 0;
console.log("\n=== DASHBOARD MATH (last 30d, QA orders only) ===");
console.log({ orders: orderCount, revenue: +revenue.toFixed(2), aov: +aov.toFixed(2), cogs, margin: +margin.toFixed(2), marginPct: +marginPct.toFixed(1) });
const regions = {}; for (const o of active) { const r = o.region || "INTL"; regions[r] = (regions[r] || 0) + Number(o.total || 0); }
console.log("by region (NOTE: sums mixed currencies!):", regions);
const unknownSkus = [...best.entries()].filter(([, b]) => !b.known).map(([s]) => s);
console.log("best-seller SKUs not in products (COGS=0, name from item):", unknownSkus);

// anomaly flags
const flags = [];
if (live.some((o) => o.total === null)) flags.push("orders with NULL total exist (counted as 0 in revenue)");
if (Object.keys(regions).length > 1 && new Set(active.map(o=>o.currency)).size > 1) flags.push("region revenue mixes USD+ZAR into one number (no currency split)");
if (active.some((o) => Number(o.total) < 0)) flags.push("negative-total order exists (discount>subtotal) -> lowers revenue");
if (live.some((o) => new Date(o.created_at).getTime() > now)) flags.push("future-dated order present");
const guests = active.filter((o) => !o.user_id).length;
if (guests) flags.push(`${guests}/${orderCount} orders have no user_id -> all bucket as one 'guest' customer in LTV/repeat`);
console.log("\n=== ANOMALY FLAGS ===");
flags.forEach((f) => console.log(" -", f));

await c.end();
