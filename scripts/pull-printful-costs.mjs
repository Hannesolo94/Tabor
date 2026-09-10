// Pull what Printful actually BILLS US per product and store it.
//
// The product sync only ever captured retail_price (what we charge), which is why
// products.cost was 0 everywhere and every margin in the admin read 100%. The real
// cost lives on the CATALOG variant, one call per variant.
//
//   node scripts/pull-printful-costs.mjs [--write]
//
// Without --write it only reports. Costs land in supplier_costs (the proper home,
// one row per sku+supplier) and products.cost (what the current admin margin
// display reads).
//
// Note: cost varies by size, 2XL and up cost more. We store the BASE size cost and
// report the spread, because that is the figure a margin display should anchor on.
import { readFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const pf = (p) => fetch("https://api.printful.com" + p, { headers: { Authorization: "Bearer " + env.PRINTFUL_API_KEY } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const WRITE = process.argv.includes("--write");

// Yoco: 2.95% local / 3.40% international, ex VAT, no flat fee. If you are not
// VAT registered you cannot reclaim the 15% VAT on the fee, so the real cost of
// accepting the card is fee x 1.15.
const YOCO_INTL = 0.0340, VAT = 0.15;
const feeOn = (price) => price * YOCO_INTL * (1 + VAT);

const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const { rows } = await c.query("select sku,name,base_price,printful_id,printful_variants from products where printful_id is not null order by sku");

console.log("SKU                          RETAIL   COST   FEE    NET     MARGIN   COST RANGE");
const updates = [];
for (const p of rows) {
  const variants = p.printful_variants ?? [];
  // Ask Printful for the catalog price of each sync variant.
  const detail = await pf(`/store/products/${p.printful_id}`);
  const catalogIds = [...new Set((detail.result?.sync_variants ?? []).map((v) => v.variant_id))];
  const prices = [];
  for (const vid of catalogIds.slice(0, 12)) {
    const d = await pf(`/products/variant/${vid}`);
    const price = Number(d.result?.variant?.price);
    if (Number.isFinite(price) && price > 0) prices.push(price);
    await sleep(800);
  }
  if (!prices.length) { console.log(`  ${p.sku.padEnd(28)} no catalog price returned`); continue; }

  const base = Math.min(...prices), top = Math.max(...prices);
  const retail = Number(p.base_price);
  const fee = feeOn(retail);
  const net = retail - base - fee;
  const margin = (net / retail) * 100;
  const flagLow = margin < 30 ? "  <-- THIN" : "";
  console.log(`  ${p.sku.padEnd(28)} $${retail.toFixed(2).padStart(6)} $${base.toFixed(2).padStart(6)} $${fee.toFixed(2).padStart(5)} $${net.toFixed(2).padStart(6)} ${margin.toFixed(1).padStart(6)}%   $${base.toFixed(2)}-$${top.toFixed(2)}${flagLow}`);
  updates.push({ sku: p.sku, cost: base, top });
  await sleep(400);
}

if (WRITE) {
  for (const u of updates) {
    await c.query("update products set cost=$2 where sku=$1", [u.sku, u.cost]);
    await c.query(
      `insert into supplier_costs (sku,supplier,cost,currency,ships_to,source,updated_at)
       values ($1,'printful',$2,'USD','INTL','api',now())
       on conflict (sku,supplier) do update set cost=excluded.cost, source='api', updated_at=now()`,
      [u.sku, u.cost],
    );
  }
  console.log(`\nwrote cost for ${updates.length} products (products.cost + supplier_costs)`);
} else {
  console.log(`\nreport only. re-run with --write to store these.`);
}
await c.end();
