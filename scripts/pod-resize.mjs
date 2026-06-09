// Resize The Risen Knight's back print to FILL the print width using the trimmed art,
// update the Printful product, regenerate the mockup, and re-host it.
import { readFileSync, writeFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
const pf = (path, opts = {}) => fetch("https://api.printful.com" + path, { ...opts, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(opts.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// fresh signed url for the trimmed design
const sign = await fetch(`${SB}/storage/v1/object/sign/design-files/the-risen-knight-trimmed.png`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
const url = SB + "/storage/v1" + sign.signedURL;

// trimmed art is 1997x1482 -> fill the 1800-wide back print area, centered vertically
const aw = 1800, ah = 2400, w = 1800, h = Math.round(1800 * 1482 / 1997), top = Math.round((ah - h) / 2);
const position = { area_width: aw, area_height: ah, width: w, height: h, top, left: 0, limit_to_print_area: true };
console.log("new print size:", w + "x" + h, `(~${(w / 150).toFixed(1)}in x ${(h / 150).toFixed(1)}in), top ${top}`);

// 1) update the sync product's print files
const detail = await pf("/store/products/437500038");
const sv = detail.result?.sync_variants ?? [];
const body = { sync_variants: sv.map((v) => ({ id: v.id, variant_id: v.variant_id, retail_price: "25.00", files: [{ type: "back_dtf", url, position }] })) };
const upd = await pf("/store/products/437500038", { method: "PUT", body: JSON.stringify(body) });
console.log("product update:", upd.code && upd.code >= 300 ? "FAILED " + JSON.stringify(upd.error).slice(0, 200) : "ok");

// 2) regenerate mockup
const task = await pf("/mockup-generator/create-task/438", { method: "POST", body: JSON.stringify({ variant_ids: [11548], format: "jpg", files: [{ placement: "back", image_url: url, position }] }) });
const key = task.result?.task_key;
if (!key) { console.log("mockup task failed:", JSON.stringify(task).slice(0, 200)); process.exit(1); }
let mockUrl = null;
for (let i = 0; i < 20; i++) { await sleep(3000); const t = await pf(`/mockup-generator/task?task_key=${key}`); if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url; break; } if (t.result?.status === "failed") break; process.stdout.write("."); }
console.log("\nmockup:", mockUrl ? "ok" : "failed");
if (!mockUrl) process.exit(1);

// 3) re-host mockup + update product image
const img = await fetch(mockUrl); const mbuf = Buffer.from(await img.arrayBuffer());
writeFileSync("/tmp/mock2.jpg", mbuf);
const mpath = "the-risen-knight-back.jpg";
await fetch(`${SB}/storage/v1/object/product-media/${mpath}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: mbuf });
const publicUrl = `${SB}/storage/v1/object/public/product-media/${mpath}?v=2`;
const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("update products set image_url=$1 where sku='the-risen-knight'", [publicUrl]);
await c.query("update product_media set url=$1 where sku='the-risen-knight'", [publicUrl]);
await c.end();
console.log("done. re-hosted mockup + updated product image.");
