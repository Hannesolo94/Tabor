// Generate a garment mockup for The Risen Knight via Printful's mockup generator,
// then set it as the product image + add to the gallery.
import { readFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
const pf = (path, opts = {}) => fetch("https://api.printful.com" + path, { ...opts, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(opts.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sign = await fetch(`${SB}/storage/v1/object/sign/design-files/1781002583490-1ggntn.png`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
const fileUrl = SB + "/storage/v1" + sign.signedURL;

// catalog product 438 (Gildan 5000), one black variant (L = 11548), back placement
// back print area = 1800x2400; fit the wide design (2752x1482) to full width, centered
const fitW = 1800, fitH = Math.round(1800 * 1482 / 2752), top = Math.round((2400 - fitH) / 2);
const position = { area_width: 1800, area_height: 2400, width: fitW, height: fitH, top, left: 0, limit_to_print_area: true };
const task = await pf("/mockup-generator/create-task/438", { method: "POST", body: JSON.stringify({ variant_ids: [11548], format: "jpg", files: [{ placement: "back", image_url: fileUrl, position }] }) });
const key = task.result?.task_key;
if (!key) { console.log("task create failed:", JSON.stringify(task).slice(0, 300)); process.exit(1); }
console.log("mockup task:", key, "- polling…");

let mockUrl = null;
for (let i = 0; i < 20; i++) {
  await sleep(3000);
  const t = await pf(`/mockup-generator/task?task_key=${key}`);
  const st = t.result?.status;
  if (st === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url ?? null; break; }
  if (st === "failed") { console.log("task failed:", JSON.stringify(t.result).slice(0, 200)); break; }
  process.stdout.write(`.${st || "?"} `);
}
console.log("\nmockup url:", mockUrl);
if (!mockUrl) process.exit(1);

const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("update products set image_url=$1 where sku='the-risen-knight'", [mockUrl]);
// add to the gallery if a product_media row isn't already there
const has = (await c.query("select id from product_media where sku='the-risen-knight'")).rows[0];
if (!has) await c.query("insert into product_media (sku, type, url, visible, source, sort) values ('the-risen-knight','image',$1,true,'printful',0)", [mockUrl]);
await c.end();
console.log("set as product image + gallery. Done.");
