// The full range for a hub-designed tee (Hannes, Oct 29 2026: "add all of the other products like the
// flags, stickers, hoodies and long sleeves for the three new designs"). Every product is CLONED from
// its live Risen Knight counterpart: same Printful blank, variants, options, price, cost and sizes.
// Apparel uses the approved 3600x4800 back file (top-aligned, full 1800x2400 back area). Flag, blanket
// and sticker use files built by D:/BurgerBot/tabor/designs/_src/range_art.py. No tank tops, ever.
// Store rows are DRAFTS. Skips any SKU that already exists.
//   node scripts/pod-design-range.mjs <respawned|status-son-of-the-king|for-the-king>
import { readFileSync } from "node:fs";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function pf(p, o = {}) {   // Printful with a polite pace and one retry on its rate limit
  for (let i = 0; i < 3; i++) {
    const j = await fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(o.headers || {}) } }).then((r) => r.json());
    await sleep(1500);
    if (j.code === 429 || j.error?.reason === "TooManyRequests") { await sleep(61000); continue; }
    return j;
  }
  return { code: 429 };
}
const H = { apikey: SVC, Authorization: "Bearer " + SVC, "Content-Type": "application/json" };
const rest = (p, o = {}) => fetch(`${SB}/rest/v1/${p}`, { ...o, headers: { ...H, Prefer: "return=representation", ...(o.headers || {}) } }).then(async (r) => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => null) }));

const DESIGNS = { "respawned": "D:/BurgerBot/tabor/designs/td-0002/r3-art.png", "status-son-of-the-king": "D:/BurgerBot/tabor/designs/td-0001/r3-art.png", "for-the-king": "D:/BurgerBot/tabor/designs/td-0003/r2-art.png" };
const RANGE = [
  { type: "long-sleeve", label: "Long Sleeve", from: "the-risen-knight-long-sleeve", file: "back", mock: "back", apparel: true },
  { type: "sweater", label: "Crewneck", from: "the-risen-knight-sweater", file: "back", mock: "back", apparel: true },
  { type: "hoodie", label: "Hoodie", from: "the-risen-knight-hoodie", file: "back", mock: "back", apparel: true },
  { type: "flag", label: "Flag", from: "the-risen-knight-flag", file: "default", mock: "front", art: "flag", area: [9150, 5700] },
  { type: "blanket", label: "Blanket", from: "the-risen-knight-blanket", file: "default", mock: "default", art: "blanket", area: [12451, 9376] },
  { type: "sticker", label: "Sticker", from: "the-risen-knight-sticker", file: "default", mock: "default", art: "sticker", area: [1650, 1650] },
];

const BASE = process.argv[2];
if (!DESIGNS[BASE]) { console.log("usage: node scripts/pod-design-range.mjs <" + Object.keys(DESIGNS).join("|") + ">"); process.exit(1); }
const base = (await rest(`products?sku=eq.${BASE}&select=*`)).body?.[0];
if (!base) { console.log("base product missing:", BASE); process.exit(1); }

async function signed(local, name) {
  const path = `${name}-${Date.now()}.png`;
  const up = await fetch(`${SB}/storage/v1/object/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/png" }, body: readFileSync(local) });
  if (!up.ok) throw new Error("upload " + up.status);
  const s = await fetch(`${SB}/storage/v1/object/sign/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
  return SB + "/storage/v1" + s.signedURL;
}

for (const R of RANGE) {
  const sku = `${BASE}-${R.type}`, name = `${base.name} (${R.label})`;
  if ((await rest(`products?sku=eq.${sku}&select=sku`)).body?.length) { console.log("skip, exists:", sku); continue; }
  const twin = (await rest(`products?sku=eq.${R.from}&select=*`)).body?.[0];
  const twinPf = await pf(`/store/products/${twin.printful_id}`);
  const tv = twinPf.result?.sync_variants ?? [];
  if (!tv.length) { console.log("FAILED to read", R.from); continue; }
  const catalog = tv[0].product?.product_id;

  const local = R.apparel ? DESIGNS[BASE] : `D:/BurgerBot/tabor/designs/range/${BASE}-${R.art}.png`;
  const url = await signed(local, `${sku}`);
  const position = R.apparel
    ? { area_width: 1800, area_height: 2400, width: 1800, height: 2400, top: 0, left: 0, limit_to_print_area: true }
    : { area_width: R.area[0], area_height: R.area[1], width: R.area[0], height: R.area[1], top: 0, left: 0, limit_to_print_area: true };

  const body = { sync_product: { name }, sync_variants: tv.map((v) => ({
    variant_id: v.variant_id, retail_price: v.retail_price,
    files: [{ type: R.file, url, ...(R.apparel ? { position } : {}) }],
    ...(v.options?.length ? { options: v.options.filter((o) => !(Array.isArray(o.value) && !o.value.length) && o.value !== false) } : {}),
  })) };
  const created = await pf("/store/products", { method: "POST", body: JSON.stringify(body) });
  if (created.code && created.code >= 300) { console.log(sku, "CREATE FAILED:", JSON.stringify(created.error || created.result).slice(0, 300)); continue; }
  const pid = created.result?.id ?? created.result?.sync_product?.id;
  const detail = await pf(`/store/products/${pid}`);
  const twinVars = typeof twin.printful_variants === "string" ? JSON.parse(twin.printful_variants) : twin.printful_variants;
  const sizeOf = Object.fromEntries(tv.map((v, i) => [v.variant_id, (twinVars?.[i]?.size) ?? v.size ?? v.name]));
  const variants = (detail.result?.sync_variants ?? []).map((v) => ({ size: sizeOf[v.variant_id] ?? v.size, color: "Black", price: Number(twin.base_price), syncVariantId: v.id }));

  // mockup, kept in our own bucket (Printful's links expire)
  let image = null;
  const task = await pf(`/mockup-generator/create-task/${catalog}`, { method: "POST", body: JSON.stringify({ variant_ids: [tv[Math.min(1, tv.length - 1)].variant_id], format: "jpg", files: [{ placement: R.mock, image_url: url, position }] }) });
  if (task.result?.task_key) for (let i = 0; i < 30; i++) {
    await sleep(3000);
    const t = await pf(`/mockup-generator/task?task_key=${task.result.task_key}`);
    if (t.result?.status === "completed") { image = t.result?.mockups?.[0]?.mockup_url ?? null; break; }
    if (t.result?.status === "failed") { console.log(sku, "mockup failed:", JSON.stringify(t.result).slice(0, 200)); break; }
  } else console.log(sku, "mockup task not created:", JSON.stringify(task).slice(0, 200));
  if (image) {
    const buf = Buffer.from(await fetch(image).then((r) => r.arrayBuffer()));
    const put = await fetch(`${SB}/storage/v1/object/product-media/${sku}.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: buf });
    image = put.ok ? `${SB}/storage/v1/object/public/product-media/${sku}.jpg?v=1` : image;
  }

  const row = {
    sku, name, collection: base.collection, category: twin.category, base_price: twin.base_price, cost: twin.cost,
    printful_id: String(pid), printful_variants: variants, status: "draft", source: "printful",
    sizes: twin.sizes, image_url: image, tone: base.tone, ink: base.ink, mark: base.mark,
    tagline: base.tagline, blurb: `${base.name}. ${R.label}.`, description: base.description,
    // note is the customer-facing product line on the store cards (Oct 29: internal build notes showed on the shop)
    note: { "long-sleeve": "Long sleeve, back print, Gildan 2400 black.", sweater: "Crewneck sweatshirt, back print.", hoodie: "Pullover hoodie, back print, Lane Seven LS14001 black.",
            flag: "All-over flag, design on black.", blanket: "Woven throw blanket, design on black.", sticker: "Black kiss-cut vinyl sticker." }[R.type],
  };
  const ins = await rest("products", { method: "POST", body: JSON.stringify(row) });
  if (!ins.ok) { console.log(sku, "INSERT FAILED", ins.status, JSON.stringify(ins.body).slice(0, 300)); continue; }
  if (image) await rest("product_media", { method: "POST", body: JSON.stringify({ sku, type: "image", url: image, visible: true, source: "printful", sort: 0 }) });
  console.log("OK", sku, "| printful", pid, "| $" + twin.base_price, "| variants", variants.length, "| mockup", !!image);
}
