// Oct 29 2026: rebuild the 5 crewnecks on Gildan 18000 (catalog 145, ships worldwide). The old blank, United Athle
// 5044-01 (523), ships to East Asia only. Same print file each crewneck had, DTF back print, top-aligned in the
// 1800x2400 back area (back prints sit high, Hannes Oct 29). Black S-5XL, $49. Store rows stay DRAFT for Hannes.
// The old Printful products are left alone.
//   node scripts/pod-crewneck-rebuild.mjs [--dry]
import { readFileSync } from "node:fs";
const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"|"$/g, ""); }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const DRY = process.argv.includes("--dry");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function pf(p, o = {}) {
  for (let i = 0; i < 3; i++) {
    const j = await fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json" } }).then((r) => r.json());
    await sleep(1500);
    if (j.code === 429) { await sleep(61000); continue; }
    return j;
  }
  return { code: 429 };
}
const H = { apikey: SVC, Authorization: "Bearer " + SVC, "Content-Type": "application/json" };
const rest = (p, o = {}) => fetch(`${SB}/rest/v1/${p}`, { ...o, headers: { ...H, Prefer: "return=representation", ...(o.headers || {}) } }).then((r) => r.json());
const PRICE = 49, CATALOG = 145, SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

const blacks = (await pf(`/products/${CATALOG}`)).result.variants.filter((v) => /^black$/i.test(v.color));
const bySize = Object.fromEntries(blacks.map((v) => [v.size, v]));
const rows = await rest("products?sku=like.*-sweater&select=*");
for (const row of rows) {
  const old = (await pf(`/store/products/${row.printful_id}`)).result;
  const f = old.sync_variants[0].files.find((x) => x.type !== "preview");
  const path = decodeURIComponent(new URL(f.url).pathname.split("/object/sign/design-files/")[1] || "");
  if (!path) { console.log(row.sku, "no design file path, skipped"); continue; }
  const s = await fetch(`${SB}/storage/v1/object/sign/design-files/${path}`, { method: "POST", headers: H, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
  const url = SB + "/storage/v1" + s.signedURL;
  // fit the art in the 1800x2400 area, top-aligned
  const w = f.width || 1800, h = f.height || 2400, k = Math.min(1800 / w, 2400 / h);
  const pw = Math.round(w * k), ph = Math.round(h * k);
  const position = { area_width: 1800, area_height: 2400, width: pw, height: ph, top: 0, left: Math.round((1800 - pw) / 2), limit_to_print_area: true };
  console.log(row.sku, "| file", path, `${w}x${h}`, "| pos", JSON.stringify(position));
  if (DRY) continue;
  const name = row.name;
  const created = await pf("/store/products", { method: "POST", body: JSON.stringify({ sync_product: { name }, sync_variants: SIZES.filter((z) => bySize[z]).map((z) => ({
    variant_id: bySize[z].id, retail_price: String(PRICE), files: [{ type: "back_dtf", url, position }] })) }) });
  if (created.code && created.code >= 300) { console.log("  CREATE FAILED", JSON.stringify(created.result || created.error).slice(0, 300)); continue; }
  const pid = created.result?.id ?? created.result?.sync_product?.id;
  const det = (await pf(`/store/products/${pid}`)).result.sync_variants;
  const variants = det.map((v) => ({ size: v.size, color: "Black", price: PRICE, syncVariantId: v.id }));
  // mockup, copied into our bucket (Printful's links expire)
  let image = row.image_url;
  const task = await pf(`/mockup-generator/create-task/${CATALOG}`, { method: "POST", body: JSON.stringify({ variant_ids: [bySize.M.id], format: "jpg", files: [{ placement: "back_dtf", image_url: url, position }] }) });
  if (task.result?.task_key) for (let i = 0; i < 30; i++) {
    await sleep(3000);
    const t = await pf(`/mockup-generator/task?task_key=${task.result.task_key}`);
    if (t.result?.status === "completed") {
      const m = t.result.mockups.find((x) => /back/.test(x.placement)) || t.result.mockups[0];
      const buf = Buffer.from(await fetch(m.mockup_url).then((r) => r.arrayBuffer()));
      const put = await fetch(`${SB}/storage/v1/object/product-media/${row.sku}-g18000.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: buf });
      if (put.ok) image = `${SB}/storage/v1/object/public/product-media/${row.sku}-g18000.jpg?v=1`;
      break;
    }
    if (t.result?.status === "failed") { console.log("  mockup failed", JSON.stringify(t.result).slice(0, 200)); break; }
  } else console.log("  mockup task not created", JSON.stringify(task).slice(0, 200));
  const upd = await rest(`products?sku=eq.${row.sku}`, { method: "PATCH", body: JSON.stringify({ printful_id: String(pid), printful_variants: variants, sizes: variants.map((v) => v.size),
    base_price: PRICE, cost: 20.55, image_url: image, status: "draft", note: "Crewneck sweatshirt, back print, Gildan 18000 black." }) });
  await rest(`product_media?sku=eq.${row.sku}&source=eq.printful`, { method: "DELETE" });
  await rest("product_media", { method: "POST", body: JSON.stringify({ sku: row.sku, type: "image", url: image, visible: true, source: "printful", sort: 0 }) });
  console.log("  OK printful", pid, "| variants", variants.length, "| mockup", image !== row.image_url, "| row", Array.isArray(upd) ? "updated" : JSON.stringify(upd).slice(0, 120));
}
