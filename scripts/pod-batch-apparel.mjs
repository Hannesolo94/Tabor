// Put The Risen Knight (centered design) on tank / long sleeve / sweater / hoodie.
// Same recipe as the tee: back print on black, fill-width centered. Creates drafts + mockups.
import { readFileSync, writeFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
const pf = (path, opts = {}) => fetch("https://api.printful.com" + path, { ...opts, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(opts.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// fresh signed url for the centered design (1213x1438)
async function designUrl() {
  const s = await fetch(`${SB}/storage/v1/object/sign/design-files/the-risen-knight-centered.png`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
  return SB + "/storage/v1" + s.signedURL;
}
const CW = 1213, CH = 1438;
const aw = 1800, ah = 2400, w = 1800, h = Math.round(1800 * CH / CW), top = Math.round((ah - h) / 2);
const position = { area_width: aw, area_height: ah, width: w, height: h, top, left: 0, limit_to_print_area: true };
const description = "The knight does not climb alone. Armored and haloed, he rises from the smoke of the fight, caught up in a shaft of light toward the cross. For the brother who keeps moving forward. Sons of Fire.";

const PRODUCTS = [
  { sku: "the-risen-knight-tank", name: "The Risen Knight (Tank)", catalog: 248, price: 24, variants: [[8628, "XS"], [8629, "S"], [8630, "M"], [8631, "L"], [8632, "XL"], [8633, "2XL"]], note: "Tank, back print, Bella+Canvas 3480 black." },
  { sku: "the-risen-knight-long-sleeve", name: "The Risen Knight (Long Sleeve)", catalog: 356, price: 32, variants: [[10093, "XS"], [10094, "S"], [10095, "M"], [10096, "L"], [10097, "XL"], [10098, "2XL"]], note: "Long sleeve, back print, Bella+Canvas 3501 black." },
  { sku: "the-risen-knight-sweater", name: "The Risen Knight (Crewneck)", catalog: 1389, price: 45, variants: [[25625, "S"], [25626, "M"], [25627, "L"], [25628, "XL"], [25629, "2XL"], [25630, "3XL"]], note: "Crewneck sweatshirt, back print, AS Colour 5160 black." },
  { sku: "the-risen-knight-hoodie", name: "The Risen Knight (Hoodie)", catalog: 294, price: 50, variants: [[9227, "S"], [9228, "M"], [9229, "L"], [9230, "XL"], [9231, "2XL"]], note: "Pullover hoodie, back print, Bella+Canvas 3719 black." },
];

const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

for (const P of PRODUCTS) {
  console.log("\n=== " + P.name + " ===");
  const url = await designUrl();
  // 1) create
  const body = { sync_product: { name: P.name }, sync_variants: P.variants.map(([variant_id]) => ({ variant_id, retail_price: P.price.toFixed(2), files: [{ type: "back", url, position }] })) };
  const created = await pf("/store/products", { method: "POST", body: JSON.stringify(body) });
  if (created.code && created.code >= 300) { console.log("  CREATE FAILED:", JSON.stringify(created.error).slice(0, 200)); continue; }
  const pid = created.result?.id ?? created.result?.sync_product?.id;
  console.log("  printful id:", pid);
  // 2) sync variant ids
  const detail = await pf(`/store/products/${pid}`);
  const sizeBy = Object.fromEntries(P.variants.map(([id, s]) => [id, s]));
  const variants = (detail.result?.sync_variants ?? []).map((v) => ({ size: sizeBy[v.variant_id] ?? v.size, color: "Black", price: P.price, syncVariantId: v.id }));
  // 3) DB upsert (draft)
  const sizes = variants.map((v) => v.size);
  const exists = (await c.query("select sku from products where sku=$1", [P.sku])).rows[0];
  const cols = [P.name, "crusader", "apparel", P.price, String(pid), JSON.stringify(variants), "draft", description, sizes, "printful", P.note];
  if (exists) await c.query("update products set name=$2,collection=$3,category=$4,base_price=$5,printful_id=$6,printful_variants=$7,status=$8,description=$9,sizes=$10,source=$11,note=$12 where sku=$1", [P.sku, ...cols]);
  else await c.query("insert into products (sku,name,collection,category,base_price,printful_id,printful_variants,status,description,sizes,source,note) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [P.sku, ...cols]);
  console.log("  DB row:", exists ? "updated" : "inserted");
  // 4) mockup
  const task = await pf(`/mockup-generator/create-task/${P.catalog}`, { method: "POST", body: JSON.stringify({ variant_ids: [P.variants[1][0]], format: "jpg", files: [{ placement: "back", image_url: url, position }] }) });
  const key = task.result?.task_key; let mockUrl = null;
  if (key) for (let i = 0; i < 20; i++) { await sleep(3000); const t = await pf(`/mockup-generator/task?task_key=${key}`); if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url; break; } if (t.result?.status === "failed") break; }
  if (mockUrl) {
    const mbuf = Buffer.from(await (await fetch(mockUrl)).arrayBuffer());
    writeFileSync(`/tmp/${P.sku}.jpg`, mbuf);
    await fetch(`${SB}/storage/v1/object/product-media/${P.sku}-back.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: mbuf });
    const pub = `${SB}/storage/v1/object/public/product-media/${P.sku}-back.jpg`;
    await c.query("update products set image_url=$1 where sku=$2", [pub, P.sku]);
    const hm = (await c.query("select id from product_media where sku=$1", [P.sku])).rows[0];
    if (hm) await c.query("update product_media set url=$1 where sku=$2", [pub, P.sku]);
    else await c.query("insert into product_media (sku,type,url,visible,source,sort) values ($1,'image',$2,true,'printful',0)", [P.sku, pub]);
    console.log("  mockup: ok");
  } else console.log("  mockup: FAILED (image left blank)");
}
await c.end();
console.log("\nApparel batch done.");
