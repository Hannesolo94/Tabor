// Swap the print file on an existing hub-designed tee (Printful sync variants + mockup + store image).
// Used when Hannes asks for a placement change after the product exists, e.g. Oct 29: Respawned and
// Status sat a little too high on Printful's tee, so round 3 drops them ~3 in.
//   node scripts/pod-design-update.mjs <sku> <D:/path/to/rN-art.png>
import { readFileSync } from "node:fs";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const pf = (p, o = {}) => fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(o.headers || {}) } }).then((r) => r.json());
const H = { apikey: SVC, Authorization: "Bearer " + SVC, "Content-Type": "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const [SKU, ART] = process.argv.slice(2);
if (!SKU || !ART) { console.log("usage: node scripts/pod-design-update.mjs <sku> <art.png>"); process.exit(1); }
const prod = (await fetch(`${SB}/rest/v1/products?sku=eq.${SKU}&select=sku,printful_id,status`, { headers: H }).then((r) => r.json()))[0];
if (!prod?.printful_id) { console.log("no product / printful id for", SKU); process.exit(1); }

// 1) new print file, signed for Printful
const path = `${SKU}-${Date.now()}-3600x4800.png`;
const up = await fetch(`${SB}/storage/v1/object/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/png" }, body: readFileSync(ART) });
if (!up.ok) { console.log("UPLOAD FAILED", up.status, await up.text()); process.exit(1); }
const sign = await fetch(`${SB}/storage/v1/object/sign/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
const fileUrl = SB + "/storage/v1" + sign.signedURL;

// 2) every sync variant gets the new back file (same full-area position as creation)
const position = { area_width: 1800, area_height: 2400, width: 1800, height: 2400, top: 0, left: 0, limit_to_print_area: true };
const detail = await pf(`/store/products/${prod.printful_id}`);
let ok = 0;
for (const v of detail.result?.sync_variants ?? []) {
  const r = await pf(`/store/variants/${v.id}`, { method: "PUT", body: JSON.stringify({ files: [{ type: "back_dtf", url: fileUrl, position }] }) });
  if (r.code && r.code >= 300) console.log("variant", v.id, "FAILED", JSON.stringify(r.error || r.result).slice(0, 200)); else ok++;
  await sleep(1500);
}
console.log("variants updated:", ok, "of", (detail.result?.sync_variants ?? []).length);

// 3) fresh mockup, stored in product-media (Printful's links expire)
let mockUrl = null;
const task = await pf("/mockup-generator/create-task/438", { method: "POST", body: JSON.stringify({ variant_ids: [11548], format: "jpg", files: [{ placement: "back", image_url: fileUrl, position }] }) });
if (task.result?.task_key) for (let i = 0; i < 25; i++) { await sleep(3000); const t = await pf(`/mockup-generator/task?task_key=${task.result.task_key}`); if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url ?? null; break; } if (t.result?.status === "failed") break; }
if (mockUrl) {
  const img = await fetch(mockUrl).then((r) => r.arrayBuffer());
  const v = Date.now();
  const put = await fetch(`${SB}/storage/v1/object/product-media/${SKU}-back.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: Buffer.from(img) });
  if (put.ok) {
    const url = `${SB}/storage/v1/object/public/product-media/${SKU}-back.jpg?v=${v}`;
    await fetch(`${SB}/rest/v1/products?sku=eq.${SKU}`, { method: "PATCH", headers: H, body: JSON.stringify({ image_url: url }) });
    await fetch(`${SB}/rest/v1/product_media?sku=eq.${SKU}`, { method: "PATCH", headers: H, body: JSON.stringify({ url }) });
    console.log("mockup:", url);
  }
} else console.log("mockup: FAILED");
