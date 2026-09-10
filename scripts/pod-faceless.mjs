// "The Faceless" — Hannes's own drawing, converted from faceless.tiff.
// Same recipe as The Risen Knight: back print, fill-width centered, BLACK ONLY.
// Creates the Printful products, pulls the sync variant ids back, inserts store
// drafts, then generates and re-hosts a mockup per product.
//
//   node scripts/pod-faceless.mjs
//
// Safe to re-run: products upsert by sku and Printful products are matched by
// name so a second run reuses rather than duplicating.
import { readFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const pf = (path, opts = {}) => fetch("https://api.printful.com" + path, { ...opts, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(opts.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DESIGN = "1789027257058-faceless-knight.png";
async function designUrl() {
  const s = await fetch(`${SB}/storage/v1/object/sign/design-files/${DESIGN}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 3600 }),
  }).then((r) => r.json());
  if (!s.signedURL) throw new Error("could not sign the design file");
  return SB + "/storage/v1" + s.signedURL;
}

// Artwork is 2056x2640. Apparel back print area is 1800x2400: fill the width and
// centre vertically, which leaves a small margin top and bottom.
const CW = 2056, CH = 2640;
const aw = 1800, ah = 2400;
const w = aw, h = Math.round(aw * CH / CW), top = Math.round((ah - h) / 2);
const position = { area_width: aw, area_height: ah, width: w, height: h, top: Math.max(0, top), left: 0, limit_to_print_area: true };

// Brand voice: terse, ceremonial. No em dashes anywhere in customer copy.
const description =
  "No face. No name. No crowd to answer to. Only the hammer, the fire, and the cross standing over it. " +
  "The armour is scarred because the work was real, and the work was done where nobody was watching. " +
  "For the brother who does not need to be seen to keep swinging. Sons of Fire.";
const tagline = "No face. No name.";
const blurb = "White line work on black. Back print.";

const PRODUCTS = [
  { sku: "the-faceless-tee",         name: "The Faceless",               catalog: 438,  price: 30, variants: [[11546, "S"], [11547, "M"], [11548, "L"], [11549, "XL"], [11550, "2XL"], [12644, "3XL"], [12645, "4XL"], [12646, "5XL"]], note: "Tee, back print, Gildan 5000 black." },
  { sku: "the-faceless-tank",        name: "The Faceless (Tank)",        catalog: 248,  price: 28, variants: [[8628, "XS"], [8629, "S"], [8630, "M"], [8631, "L"], [8632, "XL"], [8633, "2XL"]], note: "Tank, back print, Bella+Canvas 3480 black." },
  { sku: "the-faceless-long-sleeve", name: "The Faceless (Long Sleeve)", catalog: 356,  price: 36, variants: [[10093, "XS"], [10094, "S"], [10095, "M"], [10096, "L"], [10097, "XL"], [10098, "2XL"]], note: "Long sleeve, back print, Bella+Canvas 3501 black." },
  { sku: "the-faceless-sweater",     name: "The Faceless (Crewneck)",    catalog: 1389, price: 49, variants: [[25625, "S"], [25626, "M"], [25627, "L"], [25628, "XL"], [25629, "2XL"], [25630, "3XL"]], note: "Crewneck sweatshirt, back print, AS Colour 5160 black." },
  { sku: "the-faceless-hoodie",      name: "The Faceless (Hoodie)",      catalog: 294,  price: 58, variants: [[9227, "S"], [9228, "M"], [9229, "L"], [9230, "XL"], [9231, "2XL"]], note: "Pullover hoodie, back print, Bella+Canvas 3719 black." },
];

const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

// Don't create a duplicate Printful product if this is a re-run.
const existing = await pf("/store/products?limit=100");
const byName = new Map((existing.result ?? []).map((p) => [p.name, p.id]));

let made = 0, failed = 0;
for (const P of PRODUCTS) {
  console.log("\n=== " + P.name + " ===");
  const url = await designUrl();

  let pid = byName.get(P.name);
  if (pid) {
    console.log("  printful id:", pid, "(already existed, reusing)");
  } else {
    const body = { sync_product: { name: P.name }, sync_variants: P.variants.map(([variant_id]) => ({ variant_id, retail_price: P.price.toFixed(2), files: [{ type: "back", url, position }] })) };
    const created = await pf("/store/products", { method: "POST", body: JSON.stringify(body) });
    if (created.code && created.code >= 300) {
      console.log("  CREATE FAILED:", JSON.stringify(created.error ?? created).slice(0, 300));
      failed++; continue;
    }
    pid = created.result?.id ?? created.result?.sync_product?.id;
    console.log("  printful id:", pid, "(created)");
  }

  const detail = await pf(`/store/products/${pid}`);
  const sizeBy = Object.fromEntries(P.variants.map(([id, s]) => [id, s]));
  const variants = (detail.result?.sync_variants ?? []).map((v) => ({ size: sizeBy[v.variant_id] ?? v.size, color: "Black", price: P.price, syncVariantId: v.id }));
  const sizes = variants.map((v) => v.size);
  console.log("  variants:", variants.length, "|", sizes.join(" "));

  const exists = (await c.query("select sku from products where sku=$1", [P.sku])).rows[0];
  const cols = [P.name, "crusader", "apparel", P.price, String(pid), JSON.stringify(variants), "draft", description, blurb, tagline, sizes, "printful", P.note];
  if (exists) {
    await c.query("update products set name=$2,collection=$3,category=$4,base_price=$5,printful_id=$6,printful_variants=$7,status=$8,description=$9,blurb=$10,tagline=$11,sizes=$12,source=$13,note=$14 where sku=$1", [P.sku, ...cols]);
  } else {
    await c.query("insert into products (sku,name,collection,category,base_price,printful_id,printful_variants,status,description,blurb,tagline,sizes,source,note) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [P.sku, ...cols]);
  }
  console.log("  store draft:", exists ? "updated" : "inserted");

  // Mockup. Rate limited hard, so this is spaced and tolerant of failure: a
  // missing image is a blank card, not a broken product.
  const task = await pf(`/mockup-generator/create-task/${P.catalog}`, { method: "POST", body: JSON.stringify({ variant_ids: [P.variants[1][0]], format: "jpg", files: [{ placement: "back", image_url: url, position }] }) });
  const key = task.result?.task_key;
  let mockUrl = null;
  if (!key) console.log("  mockup task rejected:", JSON.stringify(task.error ?? task).slice(0, 160));
  else for (let i = 0; i < 20; i++) {
    await sleep(3000);
    const t = await pf(`/mockup-generator/task?task_key=${key}`);
    if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url; break; }
    if (t.result?.status === "failed") { console.log("  mockup failed:", JSON.stringify(t.result?.error ?? "").slice(0, 160)); break; }
  }
  if (mockUrl) {
    const mbuf = Buffer.from(await (await fetch(mockUrl)).arrayBuffer());
    await fetch(`${SB}/storage/v1/object/product-media/${P.sku}-back.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: mbuf });
    const pub = `${SB}/storage/v1/object/public/product-media/${P.sku}-back.jpg`;
    await c.query("update products set image_url=$1 where sku=$2", [pub, P.sku]);
    const hm = (await c.query("select id from product_media where sku=$1", [P.sku])).rows[0];
    if (hm) await c.query("update product_media set url=$1 where sku=$2", [pub, P.sku]);
    else await c.query("insert into product_media (sku,type,url,visible,source,sort) values ($1,'image',$2,true,'printful',0)", [P.sku, pub]);
    console.log("  mockup: ok");
  } else {
    console.log("  mockup: none (product still fine, image left blank)");
  }
  made++;
  await sleep(20000); // respect the mockup generator's rate limit
}

await c.end();
console.log(`\nDone. ${made} products, ${failed} failed. All drafts, all black, back print.`);
