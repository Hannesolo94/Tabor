// Raise the tank print to the UPPER back (place it in the top portion of the print area),
// and look up the cost of adding a front chest print (2nd placement).
import { readFileSync, writeFileSync } from "node:fs";
import pg from "pg";
const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
const pf = (p, o = {}) => fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(o.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const s = await fetch(`${SB}/storage/v1/object/sign/design-files/the-risen-knight-centered.png`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
const url = SB + "/storage/v1" + s.signedURL;

// UPPER back: design sits in the TOP portion of the 2400-tall print area.
const h = 1180, w = Math.round(h * 1213 / 1438), top = 10, left = Math.round((1800 - w) / 2);
const position = { area_width: 1800, area_height: 2400, width: w, height: h, top, left, limit_to_print_area: true };
console.log("tank print:", w + "x" + h, "top", top, "(design bottom at y=" + (top + h) + " of 2400)");

const pid = 437523201;
const detail = await pf(`/store/products/${pid}`);
const sv = detail.result?.sync_variants ?? [];
const upd = await pf(`/store/products/${pid}`, { method: "PUT", body: JSON.stringify({ sync_variants: sv.map((v) => ({ id: v.id, variant_id: v.variant_id, retail_price: "24.00", files: [{ type: "back", url, position }] })) }) });
console.log("product update:", upd.code && upd.code >= 300 ? "FAILED " + JSON.stringify(upd.error).slice(0, 150) : "ok");

await sleep(3000);
const task = await pf("/mockup-generator/create-task/248", { method: "POST", body: JSON.stringify({ variant_ids: [8630], format: "jpg", files: [{ placement: "back", image_url: url, position }] }) });
const key = task.result?.task_key; let mockUrl = null;
if (key) for (let i = 0; i < 40; i++) { await sleep(5000); const t = await pf(`/mockup-generator/task?task_key=${key}`); if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url; break; } if (t.result?.status === "failed") break; }
console.log("mockup:", mockUrl ? "ok" : "failed");
if (mockUrl) {
  const mbuf = Buffer.from(await (await fetch(mockUrl)).arrayBuffer()); writeFileSync("/tmp/tank3.jpg", mbuf);
  await fetch(`${SB}/storage/v1/object/product-media/the-risen-knight-tank-back.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: mbuf });
  const pub = `${SB}/storage/v1/object/public/product-media/the-risen-knight-tank-back.jpg?v=3`;
  const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } }); await c.connect();
  await c.query("update products set image_url=$1 where sku='the-risen-knight-tank'", [pub]);
  await c.query("update product_media set url=$1 where sku='the-risen-knight-tank'", [pub]);
  await c.end();
  console.log("tank image updated.");
}

// --- cost of an extra placement (front chest) ---
console.log("\n--- extra placement cost (front chest) ---");
const pr = await pf("/v2/catalog-products/248/prices");
const tech = pr.data?.product?.placements || pr.data?.placements;
if (tech) console.log("placements pricing:", JSON.stringify(tech).slice(0, 400));
else console.log("v2 prices raw:", JSON.stringify(pr).slice(0, 300));
