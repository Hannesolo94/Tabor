// "The Faceless" on flag + woven blanket, matching The Risen Knight's line.
//
// These are ALL-OVER prints on WHITE fabric, so the white-on-transparent artwork
// would simply vanish. The design has to be composited onto an opaque black
// canvas at the product's own aspect ratio first. Same recipe as
// pod-batch-special.mjs, but using sharp rather than the hand-rolled PNG codec
// that script needed before sharp was installed.
//
//   node scripts/pod-faceless-special.mjs [--composite-only]
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const pf = (p, o = {}) => fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(o.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DESIGN = "C:/Users/Hannes/AppData/Local/Temp/claude/c--Users-Hannes-Downloads-Holy-App--1-/2d2eca13-3cb0-4fb1-b239-e30e67cc895e/scratchpad/art/faceless-print.png";

/** Design centred on an opaque black canvas at the product's aspect ratio. */
async function compositeOnBlack(cw, ch, fillFrac, outPath) {
  const scaled = await sharp(DESIGN)
    .resize({ width: Math.round(cw * fillFrac), height: Math.round(ch * fillFrac), fit: "inside", withoutEnlargement: false })
    .toBuffer();
  await sharp({ create: { width: cw, height: ch, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } })
    .composite([{ input: scaled, gravity: "center" }])
    .flatten({ background: "#000000" })   // white ink must sit on black, not on white fabric
    .removeAlpha()                        // no alpha channel at all: an all-over print must not
                                          // leave Printful any transparency to interpret as fabric
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  const m = await sharp(outPath).metadata();
  console.log(`  ${outPath.split("/").pop()}  ${m.width}x${m.height}  alpha=${m.hasAlpha}`);
  return outPath;
}

async function upload(path, file) {
  const body = readFileSync(file);
  await fetch(`${SB}/storage/v1/object/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/png", "x-upsert": "true" }, body });
  const s = await fetch(`${SB}/storage/v1/object/sign/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
  return SB + "/storage/v1" + s.signedURL;
}

const TMP = DESIGN.replace(/[^/]+$/, "");
console.log("compositing on black...");
// Exact printfile sizes from GET /mockup-generator/printfiles/<catalog>. Building
// at half size and letting Printful upscale costs real quality on a $90 blanket.
const FLAG = { w: 9150, h: 5700 };      // catalog 490, placement front, printfile 245
const BLANKET = { w: 12451, h: 9376 };  // catalog 395, placement default, printfile 271
const flagFile = await compositeOnBlack(FLAG.w, FLAG.h, 0.82, TMP + "faceless-flag.png");
const blanketFile = await compositeOnBlack(BLANKET.w, BLANKET.h, 0.78, TMP + "faceless-blanket.png");

if (process.argv.includes("--composite-only")) {
  console.log("\ncomposite-only: files written, nothing uploaded or created.");
  process.exit(0);
}

const flagUrl = await upload("the-faceless-flag.png", flagFile);
const blanketUrl = await upload("the-faceless-blanket.png", blanketFile);
console.log("composites uploaded.");

const description =
  "No face. No name. No crowd to answer to. Only the hammer, the fire, and the cross standing over it. " +
  "The armour is scarred because the work was real, and the work was done where nobody was watching. " +
  "For the brother who does not need to be seen to keep swinging. Sons of Fire.";

// Prices follow the LIVE Risen Knight values, not the older script's numbers.
const PRODUCTS = [
  { sku: "the-faceless-flag", name: "The Faceless (Flag)", catalog: 490, category: "flag", price: 29.99, placement: "front", url: flagUrl, area: FLAG, variants: [[12584, "One size"]], note: "All-over flag, knight composited on black." },
  { sku: "the-faceless-blanket", name: "The Faceless (Blanket)", catalog: 395, category: "blanket", price: 90, placement: "default", url: blanketUrl, area: BLANKET, variants: [[13222, "60x80"], [10986, "50x60"], [22609, "30x40"]], note: "Woven throw blanket, knight composited on black." },
];

const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const existingPf = await pf("/store/products?limit=100");
const byName = new Map((existingPf.result ?? []).map((p) => [p.name, p.id]));

const mockJobs = [];
for (const P of PRODUCTS) {
  console.log("\n=== " + P.name + " ===");
  let pid = byName.get(P.name);
  if (pid) console.log("  printful id:", pid, "(already existed, reusing)");
  else {
    const body = { sync_product: { name: P.name }, sync_variants: P.variants.map(([variant_id]) => ({ variant_id, retail_price: P.price.toFixed(2), files: [{ type: P.placement, url: P.url }] })) };
    const created = await pf("/store/products", { method: "POST", body: JSON.stringify(body) });
    if (created.code && created.code >= 300) { console.log("  CREATE FAILED:", JSON.stringify(created.error ?? created).slice(0, 300)); continue; }
    pid = created.result?.id ?? created.result?.sync_product?.id;
    console.log("  printful id:", pid, "(created)");
  }
  const detail = await pf(`/store/products/${pid}`);
  const sizeBy = Object.fromEntries(P.variants.map(([id, s]) => [id, s]));
  const variants = (detail.result?.sync_variants ?? []).map((v) => ({ size: sizeBy[v.variant_id] ?? v.size, color: null, price: P.price, syncVariantId: v.id }));
  const sizes = variants.map((v) => v.size);
  console.log("  variants:", variants.length, "|", sizes.join(" "));

  const exists = (await c.query("select sku from products where sku=$1", [P.sku])).rows[0];
  const cols = [P.name, "crusader", P.category, P.price, String(pid), JSON.stringify(variants), "draft", description, "No face. No name.", sizes, "printful", P.note];
  if (exists) await c.query("update products set name=$2,collection=$3,category=$4,base_price=$5,printful_id=$6,printful_variants=$7,status=$8,description=$9,tagline=$10,sizes=$11,source=$12,note=$13 where sku=$1", [P.sku, ...cols]);
  else await c.query("insert into products (sku,name,collection,category,base_price,printful_id,printful_variants,status,description,tagline,sizes,source,note) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)", [P.sku, ...cols]);
  console.log("  store draft:", exists ? "updated" : "inserted");
  mockJobs.push({ sku: P.sku, catalog: P.catalog, variant: P.variants[0][0], placement: P.placement, url: P.url, area: P.area });
}

// Mockups last and spaced out: this generator rate-limits hard.
for (const j of mockJobs) {
  console.log("\nmockup:", j.sku);
  let key = null;
  for (let a = 0; a < 4 && !key; a++) {
    // MG-4 "Position field is missing": the generator requires an explicit
    // position even for an all-over print that fills the whole area.
    const position = { area_width: j.area.w, area_height: j.area.h, width: j.area.w, height: j.area.h, top: 0, left: 0 };
    const t = await pf(`/mockup-generator/create-task/${j.catalog}`, { method: "POST", body: JSON.stringify({ variant_ids: [j.variant], format: "jpg", files: [{ placement: j.placement, image_url: j.url, position }] }) });
    if (t.result?.task_key) key = t.result.task_key;
    else { console.log("  retrying:", JSON.stringify(t.error ?? t).slice(0, 110)); await sleep(20000); }
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
    await fetch(`${SB}/storage/v1/object/product-media/${j.sku}-main.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: b });
    const pub = `${SB}/storage/v1/object/public/product-media/${j.sku}-main.jpg`;
    await c.query("update products set image_url=$1 where sku=$2", [pub, j.sku]);
    const hm = (await c.query("select id from product_media where sku=$1", [j.sku])).rows[0];
    if (hm) await c.query("update product_media set url=$1 where sku=$2", [pub, j.sku]);
    else await c.query("insert into product_media (sku,type,url,visible,source,sort) values ($1,'image',$2,true,'printful',0)", [j.sku, pub]);
    console.log("  ok");
  } else console.log("  FAILED (image left blank)");
  await sleep(20000);
}

await c.end();
console.log("\nFlag + blanket done.");
