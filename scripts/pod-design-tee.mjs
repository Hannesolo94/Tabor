// Back-print tees from designs Hannes approved in the BurgerBot hub (TABOR > DESIGNS), Oct 29 2026.
// Same recipe as The Risen Knight tee: Gildan 5000 black, S-5XL, back DTF, $33 (the tee market price).
// The print file is 3600x4800 (12x16 in at 300 DPI) and TOP-ALIGNED, so the design sits high on the
// upper back. Creates the Printful sync product + a Printful mockup, and the store row as a DRAFT.
// Uses the Supabase REST API (no pg needed). Reads keys from root .env.
//   node scripts/pod-design-tee.mjs <respawned|status-son-of-the-king|for-the-king>
import { readFileSync } from "node:fs";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const pf = (p, o = {}) => fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(o.headers || {}) } }).then((r) => r.json());
const rest = (p, o = {}) => fetch(`${SB}/rest/v1/${p}`, { ...o, headers: { apikey: SVC, Authorization: "Bearer " + SVC, "Content-Type": "application/json", Prefer: "return=representation", ...(o.headers || {}) } }).then(async (r) => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => null) }));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DESIGNS = {
  "respawned": { td: "td-0002", name: "Respawned", collection: "pilgrim", tagline: "You died. You were raised.",
    blurb: "Respawned. Born again, John 3:3. Back-print black tee.",
    description: "Every gamer knows the word. You fall, you come back, you go again. But this one is not a checkpoint. \"Except a man be born again, he cannot see the kingdom of God.\" John 3:3. A back print that starts the conversation. Sons of Fire." },
  "status-son-of-the-king": { td: "td-0001", name: "Status: Son of the King", collection: "crusader", tagline: "Know who you are.",
    blurb: "Your status in Christ, read like a game screen. 1 John 3:1. Back-print black tee.",
    description: "Name: Son of the King. Class: Crusader. Health: restored. Debt: paid in full. Armor: Ephesians 6. The world tells you who you are. The Father already did. \"Behold, what manner of love the Father hath bestowed upon us, that we should be called the sons of God.\" 1 John 3:1. Sons of Fire." },
  "for-the-king": { td: "td-0003", name: "For the King", collection: "sentinel", tagline: "King of kings.",
    blurb: "A crowned, winged cross and the battle cry turned to Christ. Revelation 19:16. Back-print black tee.",
    description: "Every war needs a king worth fighting for. Ours already won. A crowned, winged cross over the one line that matters. \"KING OF KINGS, AND LORD OF LORDS.\" Revelation 19:16. Sons of Fire." },
};
const SKU = process.argv[2];
const D = DESIGNS[SKU];
if (!D) { console.log("usage: node scripts/pod-design-tee.mjs <" + Object.keys(DESIGNS).join("|") + ">"); process.exit(1); }
const ART = `D:/BurgerBot/tabor/designs/${D.td}/r2-art.png`;
const DESIGN_PATH = `${SKU}-r2-3600x4800.png`;
const SIZES = [[11546, "S"], [11547, "M"], [11548, "L"], [11549, "XL"], [11550, "2XL"], [12644, "3XL"], [12645, "4XL"], [12646, "5XL"]];
const PRICE = 35;   // Oct 29 pricing pass: one price per product, tees $35

const existing = await rest(`products?sku=eq.${SKU}&select=sku,status,printful_id`);
if (existing.body?.length) { console.log("Already exists:", JSON.stringify(existing.body[0]), "- stopping so nothing is duplicated."); process.exit(0); }

// 1) upload the print file to the private design-files bucket and sign it for Printful
const up = await fetch(`${SB}/storage/v1/object/design-files/${DESIGN_PATH}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/png", "x-upsert": "true" }, body: readFileSync(ART) });
if (!up.ok) { console.log("UPLOAD FAILED", up.status, await up.text()); process.exit(1); }
const sign = await fetch(`${SB}/storage/v1/object/sign/design-files/${DESIGN_PATH}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
const fileUrl = SB + "/storage/v1" + sign.signedURL;
console.log("print file uploaded + signed:", !!sign.signedURL);

// 2) Printful sync product. The file has the same 3:4 shape as the 1800x2400 back area, so it fills the
//    area edge to edge and the top-aligned artwork lands on the upper back.
const position = { area_width: 1800, area_height: 2400, width: 1800, height: 2400, top: 0, left: 0, limit_to_print_area: true };
const created = await pf("/store/products", { method: "POST", body: JSON.stringify({
  sync_product: { name: D.name },
  sync_variants: SIZES.map(([variant_id]) => ({ variant_id, retail_price: PRICE.toFixed(2), files: [{ type: "back_dtf", url: fileUrl, position }] })),
}) });
if (created.code && created.code >= 300) { console.log("PRINTFUL CREATE FAILED:", created.code, JSON.stringify(created.error || created.result).slice(0, 400)); process.exit(1); }
const productId = created.result?.id ?? created.result?.sync_product?.id;
const detail = await pf(`/store/products/${productId}`);
const bySize = Object.fromEntries(SIZES.map(([id, s]) => [id, s]));
const variants = (detail.result?.sync_variants ?? []).map((v) => ({ size: bySize[v.variant_id] ?? v.size, color: "Black", price: PRICE, syncVariantId: v.id }));
console.log("Printful product:", productId, "| variants:", variants.length);

// 3) mockup from Printful's generator (back, size L)
let mockUrl = null;
const task = await pf("/mockup-generator/create-task/438", { method: "POST", body: JSON.stringify({ variant_ids: [11548], format: "jpg", files: [{ placement: "back", image_url: fileUrl, position }] }) });
if (task.result?.task_key) for (let i = 0; i < 25; i++) { await sleep(3000); const t = await pf(`/mockup-generator/task?task_key=${task.result.task_key}`); if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url ?? null; break; } if (t.result?.status === "failed") break; }
console.log("mockup:", mockUrl || "FAILED");

// 3b) Printful mockup links are temporary: keep our own copy in the public product-media bucket
if (mockUrl) {
  const img = await fetch(mockUrl).then((r) => r.arrayBuffer());
  const put = await fetch(`${SB}/storage/v1/object/product-media/${SKU}-back.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: Buffer.from(img) });
  mockUrl = put.ok ? `${SB}/storage/v1/object/public/product-media/${SKU}-back.jpg?v=1` : mockUrl;
  console.log("mockup stored:", put.ok);
}

// 4) store row as a DRAFT (Hannes flips it live), same blank cost as The Risen Knight tee
const row = {
  sku: SKU, name: D.name, collection: D.collection, category: "apparel", base_price: PRICE, cost: 9.44,
  printful_id: String(productId), printful_variants: variants, status: "draft", source: "printful",
  sizes: variants.map((v) => v.size), image_url: mockUrl, tone: "#15151A", ink: "#C9A961", mark: "seal",
  tagline: D.tagline, blurb: D.blurb, description: D.description,
  note: "Back print tee, Gildan 5000 black.",   // customer-facing product line on the store cards (Oct 29)
};
const ins = await rest("products", { method: "POST", body: JSON.stringify(row) });
if (!ins.ok) { console.log("PRODUCT INSERT FAILED", ins.status, JSON.stringify(ins.body).slice(0, 400)); process.exit(1); }
if (mockUrl) await rest("product_media", { method: "POST", body: JSON.stringify({ sku: SKU, type: "image", url: mockUrl, visible: true, source: "printful", sort: 0 }) });
console.log(`\nDONE. ${D.name} is a DRAFT. Printful id:`, productId, "| sku:", SKU);
