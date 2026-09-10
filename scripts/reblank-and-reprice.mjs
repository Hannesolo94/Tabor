// Move the hoodie and crewneck onto better-priced blanks, and reprice the line
// to the 40-70% margin rule.
//
// Both were on the most expensive blank Printful sells in their category, which
// is what put them under 40%. Swapping the blank fixes the margin without
// charging more; the price moves are separate and driven by market comparison
// against the brands Hannes actually works on.
//
//   node scripts/reblank-and-reprice.mjs --prices     (price changes only)
//   node scripts/reblank-and-reprice.mjs --blanks     (recreate on new blanks)
//   node scripts/reblank-and-reprice.mjs --all
import { readFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const pf = (p, o = {}) => fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(o.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const doPrices = process.argv.includes("--prices") || process.argv.includes("--all");
const doBlanks = process.argv.includes("--blanks") || process.argv.includes("--all");

// Market medians from the public storefronts of CTF, ATP, Threat Llama,
// Operational Industries and Goons Up.
const PRICES = [
  ["the-risen-knight",              33,    "tee: was $30, market ~$33"],
  ["the-faceless-tee",              33,    "tee: was $30, market ~$33"],
  ["the-risen-knight-tank",         32,    "tank: was $28, market ~$32"],
  ["the-faceless-tank",             32,    "tank: was $28, market ~$32"],
  ["the-risen-knight-long-sleeve",  39,    "long sleeve: was $36, market ~$35"],
  ["the-faceless-long-sleeve",      39,    "long sleeve: was $36, market ~$35"],
  ["the-risen-knight-blanket",      99,    "blanket: was $90, Threat Llama is $119.99"],
  ["the-faceless-blanket",          99,    "blanket: was $90, Threat Llama is $119.99"],
  ["the-risen-knight-hoodie",       50,    "hoodie: was $58 (above market), market ~$50, on the new blank"],
  ["the-faceless-hoodie",           50,    "hoodie: was $58 (above market), market ~$50, on the new blank"],
  // Flag: the ONLY product with no cheaper blank at a comparable size. The
  // cheap rod-pocket option is a 12x18 desk flag; at wall-flag size it costs
  // $53.04 against the current $23.25. So the price has to carry it.
  // Operational Industries sells flags at $40, so $42 is inside the market.
  ["the-risen-knight-flag",         42,    "flag: was $29.99, no cheaper blank exists at this size; OI sells at $40"],
  ["the-faceless-flag",             42,    "flag: was $29.99, no cheaper blank exists at this size; OI sells at $40"],
];

// Same print area (1800x2400) and back placement as the blanks they replace, so
// the existing artwork and positioning carry over unchanged.
const SWAPS = [
  {
    sku: "the-risen-knight-hoodie", design: "the-risen-knight-centered.png", cw: 1213, ch: 1438,
    name: "The Risen Knight (Hoodie)", catalog: 521, price: 50,
    variants: [[13116, "S"], [13117, "M"], [13118, "L"], [13119, "XL"], [13120, "2XL"]],
    note: "Pullover hoodie, back print, United Athle 5214-01 black.",
  },
  {
    sku: "the-faceless-hoodie", design: "1789027257058-faceless-knight.png", cw: 2056, ch: 2640,
    name: "The Faceless (Hoodie)", catalog: 521, price: 50,
    variants: [[13116, "S"], [13117, "M"], [13118, "L"], [13119, "XL"], [13120, "2XL"]],
    note: "Pullover hoodie, back print, United Athle 5214-01 black.",
  },
  {
    sku: "the-risen-knight-sweater", design: "the-risen-knight-centered.png", cw: 1213, ch: 1438,
    name: "The Risen Knight (Crewneck)", catalog: 523, price: 49,
    variants: [[13173, "S"], [13174, "M"], [13175, "L"], [13176, "XL"], [13177, "2XL"]],
    note: "Crewneck sweatshirt, back print, United Athle 5044-01 black.",
  },
  {
    sku: "the-faceless-sweater", design: "1789027257058-faceless-knight.png", cw: 2056, ch: 2640,
    name: "The Faceless (Crewneck)", catalog: 523, price: 49,
    variants: [[13173, "S"], [13174, "M"], [13175, "L"], [13176, "XL"], [13177, "2XL"]],
    note: "Crewneck sweatshirt, back print, United Athle 5044-01 black.",
  },
];

async function designUrl(path) {
  const s = await fetch(`${SB}/storage/v1/object/sign/design-files/${path}`, {
    method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 3600 }),
  }).then((r) => r.json());
  if (!s.signedURL) throw new Error("could not sign " + path);
  return SB + "/storage/v1" + s.signedURL;
}

const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

if (doPrices) {
  console.log("PRICE CHANGES\n");
  for (const [sku, price, why] of PRICES) {
    const r = await c.query("update products set base_price=$2 where sku=$1 returning name, base_price", [sku, price]);
    if (!r.rows.length) { console.log(`  ${sku}: not found`); continue; }
    console.log(`  ${r.rows[0].name.padEnd(32)} -> $${price}   ${why}`);
  }
}

if (doBlanks) {
  console.log("\nBLANK SWAPS\n");
  const existing = await pf("/store/products?limit=100");
  const byName = new Map((existing.result ?? []).map((p) => [p.name, p.id]));

  for (const S of SWAPS) {
    console.log(`\n=== ${S.name} ===`);
    const old = (await c.query("select printful_id from products where sku=$1", [S.sku])).rows[0]?.printful_id;
    const url = await designUrl(S.design);

    // fill the width of the 1800x2400 back area, centred, same as before
    const aw = 1800, ah = 2400, w = aw, h = Math.round(aw * S.ch / S.cw);
    const position = { area_width: aw, area_height: ah, width: w, height: Math.min(h, ah), top: Math.max(0, Math.round((ah - h) / 2)), left: 0, limit_to_print_area: true };

    const tempName = `${S.name} `; // avoid colliding with the old product's name
    const body = { sync_product: { name: tempName.trim() === S.name ? S.name : S.name }, sync_variants: S.variants.map(([variant_id]) => ({ variant_id, retail_price: S.price.toFixed(2), files: [{ type: "back", url, position }] })) };

    // Remove the old one FIRST so the name is free and no duplicate lingers.
    if (old && byName.get(S.name) === Number(old)) {
      const del = await pf(`/store/products/${old}`, { method: "DELETE" });
      console.log(`  removed old printful product ${old}:`, del.code === 200 || del.code === undefined ? "ok" : JSON.stringify(del).slice(0, 80));
      await sleep(1500);
    }

    const created = await pf("/store/products", { method: "POST", body: JSON.stringify(body) });
    if (created.code && created.code >= 300) { console.log("  CREATE FAILED:", JSON.stringify(created.error ?? created).slice(0, 240)); continue; }
    const pid = created.result?.id ?? created.result?.sync_product?.id;
    console.log(`  new printful product: ${pid}`);

    const detail = await pf(`/store/products/${pid}`);
    const sizeBy = Object.fromEntries(S.variants.map(([id, s]) => [id, s]));
    const variants = (detail.result?.sync_variants ?? []).map((v) => ({ size: sizeBy[v.variant_id] ?? v.size, color: "Black", price: S.price, syncVariantId: v.id }));
    const sizes = variants.map((v) => v.size);
    await c.query("update products set printful_id=$2, printful_variants=$3, sizes=$4, base_price=$5, note=$6 where sku=$1",
      [S.sku, String(pid), JSON.stringify(variants), sizes, S.price, S.note]);
    console.log(`  db updated: ${variants.length} variants (${sizes.join(" ")}) at $${S.price}`);

    // mockup
    const task = await pf(`/mockup-generator/create-task/${S.catalog}`, { method: "POST", body: JSON.stringify({ variant_ids: [S.variants[1][0]], format: "jpg", files: [{ placement: "back", image_url: url, position }] }) });
    let mockUrl = null;
    if (task.result?.task_key) {
      for (let i = 0; i < 22; i++) {
        await sleep(3000);
        const t = await pf(`/mockup-generator/task?task_key=${task.result.task_key}`);
        if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url; break; }
        if (t.result?.status === "failed") break;
      }
    } else console.log("  mockup task rejected:", JSON.stringify(task.error ?? task).slice(0, 120));
    if (mockUrl) {
      const b = Buffer.from(await (await fetch(mockUrl)).arrayBuffer());
      await fetch(`${SB}/storage/v1/object/product-media/${S.sku}-back.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: b });
      const pub = `${SB}/storage/v1/object/public/product-media/${S.sku}-back.jpg`;
      await c.query("update products set image_url=$1 where sku=$2", [pub, S.sku]);
      await c.query("update product_media set url=$1 where sku=$2", [pub, S.sku]);
      console.log("  mockup: ok");
    } else console.log("  mockup: FAILED (old image left in place)");
    await sleep(20000);
  }
}

await c.end();
console.log("\nDone. Re-run scripts/pull-printful-costs.mjs --write to refresh costs and margins.");
