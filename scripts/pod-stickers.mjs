// Stickers for both designs.
//
// Kiss-Cut [358], not Die-Cut [957]: die-cut costs $3.86-$6.08 and cannot clear
// 40% at any sellable price, while kiss-cut runs $2.34-$2.74.
//
// The 15"x3.75" bumper variant is deliberately excluded: it costs $5.47, which
// is 5% margin at $5.99. It breaks the 40-70% rule on its own.
//
// The artwork is white line work on transparency. On white vinyl that vanishes,
// exactly like the flag and blanket, so it is composited onto opaque black
// first: the sticker is a black square with the knight on it, and the kiss-cut
// follows that square rather than trying to trace invisible lines.
//
//   node scripts/pod-stickers.mjs [--composite-only]
import { readFileSync } from "node:fs";
import sharp from "sharp";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const pf = (p, o = {}) => fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(o.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CATALOG = 358;
const AREA = { w: 900, h: 900 };   // kiss-cut printfile, square
const FILL = 0.86;                 // leave a margin so the cut does not clip the art

// A size ladder rather than one price: the small size lands on the $4.99 the
// market anchors at, and each size stays inside 40-70%.
const VARIANTS = [
  [10163, '3"x3"', 4.99],
  [10164, '4"x4"', 5.99],
  [10165, '5.5"x5.5"', 6.99],
];

const DESIGNS = [
  { sku: "the-risen-knight-sticker", name: "The Risen Knight (Sticker)", file: "the-risen-knight-centered.png",
    description: "The knight does not climb alone. Armored and haloed, he rises from the smoke of the fight, caught up in a shaft of light toward the cross. Sons of Fire.",
    tagline: "He rises." },
  { sku: "the-faceless-sticker", name: "The Faceless (Sticker)", file: "1789027257058-faceless-knight.png",
    description: "No face. No name. No crowd to answer to. Only the hammer, the fire, and the cross standing over it. Sons of Fire.",
    tagline: "No face. No name." },
];

const TMP = "C:/Users/Hannes/AppData/Local/Temp/claude/c--Users-Hannes-Downloads-Holy-App--1-/2d2eca13-3cb0-4fb1-b239-e30e67cc895e/scratchpad/art/";

async function signed(path) {
  const s = await fetch(`${SB}/storage/v1/object/sign/design-files/${path}`, {
    method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 3600 }),
  }).then((r) => r.json());
  if (!s.signedURL) throw new Error("could not sign " + path);
  return SB + "/storage/v1" + s.signedURL;
}

async function download(path, to) {
  const url = await signed(path);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const { writeFileSync } = await import("node:fs");
  writeFileSync(to, buf);
  return to;
}

async function compositeOnBlack(srcFile, outPath) {
  const scaled = await sharp(srcFile)
    .resize({ width: Math.round(AREA.w * FILL), height: Math.round(AREA.h * FILL), fit: "inside" })
    .toBuffer();
  await sharp({ create: { width: AREA.w, height: AREA.h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
    .composite([{ input: scaled, gravity: "center" }])
    .flatten({ background: "#000000" })
    .removeAlpha()                 // no transparency for the cutter to interpret
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  const m = await sharp(outPath).metadata();
  console.log(`  ${outPath.split("/").pop()}  ${m.width}x${m.height}  alpha=${m.hasAlpha}`);
  return outPath;
}

async function upload(path, file) {
  const body = readFileSync(file);
  await fetch(`${SB}/storage/v1/object/design-files/${path}`, {
    method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/png", "x-upsert": "true" }, body,
  });
  return signed(path);
}

console.log("compositing stickers on black...");
for (const D of DESIGNS) {
  const src = await download(D.file, TMP + "st-src-" + D.sku + ".png");
  D.local = await compositeOnBlack(src, TMP + D.sku + ".png");
}

if (process.argv.includes("--composite-only")) {
  console.log("\ncomposite-only: nothing uploaded or created.");
  process.exit(0);
}

const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const existing = await pf("/store/products?limit=100");
const byName = new Map((existing.result ?? []).map((p) => [p.name, p.id]));

for (const D of DESIGNS) {
  console.log(`\n=== ${D.name} ===`);
  const url = await upload(`${D.sku}.png`, D.local);

  let pid = byName.get(D.name);
  if (pid) console.log("  printful id:", pid, "(reusing)");
  else {
    const body = {
      sync_product: { name: D.name },
      sync_variants: VARIANTS.map(([variant_id, , price]) => ({
        variant_id, retail_price: price.toFixed(2),
        files: [{ type: "default", url }],
      })),
    };
    const created = await pf("/store/products", { method: "POST", body: JSON.stringify(body) });
    if (created.code && created.code >= 300) { console.log("  CREATE FAILED:", JSON.stringify(created.error ?? created).slice(0, 250)); continue; }
    pid = created.result?.id ?? created.result?.sync_product?.id;
    console.log("  printful id:", pid, "(created)");
  }

  const detail = await pf(`/store/products/${pid}`);
  const meta = Object.fromEntries(VARIANTS.map(([id, size, price]) => [id, { size, price }]));
  const variants = (detail.result?.sync_variants ?? []).map((v) => ({
    size: meta[v.variant_id]?.size ?? v.size, color: null,
    price: meta[v.variant_id]?.price ?? 5.99, syncVariantId: v.id,
  }));
  const sizes = variants.map((v) => v.size);
  // base_price is the LARGEST size, so anything reading a single price never undercharges
  const base = Math.max(...variants.map((v) => v.price));

  const exists = (await c.query("select sku from products where sku=$1", [D.sku])).rows[0];
  const cols = [D.name, "crusader", "sticker", base, String(pid), JSON.stringify(variants), "draft",
    D.description, D.tagline, "Black and white kiss-cut vinyl. Knight composited on black.", sizes, "printful"];
  if (exists) {
    await c.query("update products set name=$2,collection=$3,category=$4,base_price=$5,printful_id=$6,printful_variants=$7,status=$8,description=$9,tagline=$10,note=$11,sizes=$12,source=$13 where sku=$1", [D.sku, ...cols]);
  } else {
    await c.query("insert into products (sku,name,collection,category,base_price,printful_id,printful_variants,status,description,tagline,note,sizes,source) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)", [D.sku, ...cols]);
  }
  console.log(`  store draft: ${exists ? "updated" : "inserted"} — ${sizes.join(" ")} at $${VARIANTS.map((v) => v[2]).join("/$")}`);

  // mockup
  const position = { area_width: AREA.w, area_height: AREA.h, width: AREA.w, height: AREA.h, top: 0, left: 0 };
  let key = null;
  for (let a = 0; a < 4 && !key; a++) {
    const t = await pf(`/mockup-generator/create-task/${CATALOG}`, { method: "POST", body: JSON.stringify({ variant_ids: [VARIANTS[1][0]], format: "jpg", files: [{ placement: "default", image_url: url, position }] }) });
    if (t.result?.task_key) key = t.result.task_key;
    else { console.log("  retrying mockup:", JSON.stringify(t.error ?? t).slice(0, 110)); await sleep(20000); }
  }
  let mockUrl = null;
  if (key) for (let i = 0; i < 25; i++) {
    await sleep(3000);
    const t = await pf(`/mockup-generator/task?task_key=${key}`);
    if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url; break; }
    if (t.result?.status === "failed") break;
  }
  if (mockUrl) {
    const b = Buffer.from(await (await fetch(mockUrl)).arrayBuffer());
    await fetch(`${SB}/storage/v1/object/product-media/${D.sku}-main.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: b });
    const pub = `${SB}/storage/v1/object/public/product-media/${D.sku}-main.jpg`;
    await c.query("update products set image_url=$1 where sku=$2", [pub, D.sku]);
    const hm = (await c.query("select id from product_media where sku=$1", [D.sku])).rows[0];
    if (hm) await c.query("update product_media set url=$1 where sku=$2", [pub, D.sku]);
    else await c.query("insert into product_media (sku,type,url,visible,source,sort) values ($1,'image',$2,true,'printful',0)", [D.sku, pub]);
    console.log("  mockup: ok ->", pub);
  } else console.log("  mockup: FAILED");
  await sleep(20000);
}

await c.end();
console.log("\nStickers done. VISUAL QA STILL REQUIRED: open each mockup and check the knight is centred, upright and not clipped by the cut.");
