// The Risen Knight on flag + woven blanket (composited on black, all-over print) and
// die-cut stickers (transparent). Creates drafts + mockups.
import { readFileSync, writeFileSync } from "node:fs";
import zlib from "node:zlib";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
const pf = (path, opts = {}) => fetch("https://api.printful.com" + path, { ...opts, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(opts.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- decode centered design (RGBA) ---
function decode(file) {
  const buf = readFileSync(file); const W = buf.readUInt32BE(16), H = buf.readUInt32BE(20);
  let p = 8; const idat = [];
  while (p < buf.length) { const len = buf.readUInt32BE(p); const t = buf.toString("ascii", p + 4, p + 8); if (t === "IDAT") idat.push(buf.subarray(p + 8, p + 8 + len)); p += 12 + len; }
  const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = W * 4, out = Buffer.alloc(H * stride);
  const pae = (a, b, c) => { const q = a + b - c, da = Math.abs(q - a), db = Math.abs(q - b), dc = Math.abs(q - c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
  let o = 0; for (let y = 0; y < H; y++) { const f = raw[o++]; for (let x = 0; x < stride; x++) { const v = raw[o++]; const a = x >= 4 ? out[y * stride + x - 4] : 0; const b = y > 0 ? out[(y - 1) * stride + x] : 0; const cc = (x >= 4 && y > 0) ? out[(y - 1) * stride + x - 4] : 0; let r; if (f === 0) r = v; else if (f === 1) r = v + a; else if (f === 2) r = v + b; else if (f === 3) r = v + ((a + b) >> 1); else r = v + pae(a, b, cc); out[y * stride + x] = r & 255; } }
  return { src: out, W, H };
}
function crc32(b) { let c = ~0; for (let i = 0; i < b.length; i++) { c ^= b[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (~c) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const tt = Buffer.from(type, "ascii"); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tt, data]))); return Buffer.concat([len, tt, data, crc]); }
function encodePng(rgba, w, h) { const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; const st = w * 4, raw = Buffer.alloc(h * (st + 1)); for (let y = 0; y < h; y++) { raw[y * (st + 1)] = 0; rgba.copy(raw, y * (st + 1) + 1, y * st, y * st + st); } return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 8 })), chunk("IEND", Buffer.alloc(0))]); }

const { src, W: dW, H: dH } = decode("/tmp/design1-centered.png");
function compositeOnBlack(cw, ch, fillFrac) {
  const out = Buffer.alloc(cw * ch * 4);
  for (let i = 0; i < cw * ch; i++) out[i * 4 + 3] = 255; // opaque black
  const scale = Math.min(cw * fillFrac / dW, ch * fillFrac / dH);
  const sw = Math.round(dW * scale), sh = Math.round(dH * scale);
  const ox = Math.round((cw - sw) / 2), oy = Math.round((ch - sh) / 2);
  const samp = (xx, yy, c) => { xx = xx < 0 ? 0 : xx >= dW ? dW - 1 : xx; yy = yy < 0 ? 0 : yy >= dH ? dH - 1 : yy; return src[(yy * dW + xx) * 4 + c]; };
  for (let y = 0; y < sh; y++) { const fy = (y + 0.5) / scale - 0.5, y0 = Math.floor(fy), yf = fy - y0;
    for (let x = 0; x < sw; x++) { const fx = (x + 0.5) / scale - 0.5, x0 = Math.floor(fx), xf = fx - x0;
      let r = 0, g = 0, b = 0, a = 0;
      const ws = [[x0, y0, (1 - xf) * (1 - yf)], [x0 + 1, y0, xf * (1 - yf)], [x0, y0 + 1, (1 - xf) * yf], [x0 + 1, y0 + 1, xf * yf]];
      for (const [wx, wy, wt] of ws) { r += samp(wx, wy, 0) * wt; g += samp(wx, wy, 1) * wt; b += samp(wx, wy, 2) * wt; a += samp(wx, wy, 3) * wt; }
      const af = a / 255, oi = ((oy + y) * cw + (ox + x)) * 4;
      out[oi] = Math.round(r * af); out[oi + 1] = Math.round(g * af); out[oi + 2] = Math.round(b * af); out[oi + 3] = 255;
    } }
  return encodePng(out, cw, ch);
}
async function upload(path, png, mime = "image/png") { await fetch(`${SB}/storage/v1/object/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": mime, "x-upsert": "true" }, body: png }); const s = await fetch(`${SB}/storage/v1/object/sign/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json()); return SB + "/storage/v1" + s.signedURL; }

console.log("compositing flag + blanket on black...");
const flagUrl = await upload("the-risen-knight-flag.png", compositeOnBlack(4575, 2850, 0.82));   // flag aspect 1.605
const blanketUrl = await upload("the-risen-knight-blanket.png", compositeOnBlack(4150, 3125, 0.78)); // blanket aspect 1.328
const stickerS = await fetch(`${SB}/storage/v1/object/sign/design-files/the-risen-knight-centered.png`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
const stickerUrl = SB + "/storage/v1" + stickerS.signedURL;
console.log("composites uploaded.");

const description = "The knight does not climb alone. Armored and haloed, he rises from the smoke of the fight, caught up in a shaft of light toward the cross. Sons of Fire.";
const PRODUCTS = [
  { sku: "the-risen-knight-flag", name: "The Risen Knight (Flag)", catalog: 490, category: "flag", price: 32, placement: "front", url: flagUrl, variants: [[12584, "One size"]], note: "All-over flag, knight on black." },
  { sku: "the-risen-knight-blanket", name: "The Risen Knight (Blanket)", catalog: 395, category: "blanket", price: 50, placement: "default", url: blanketUrl, variants: [[13222, "60x80"], [10986, "50x60"], [22609, "30x40"]], note: "Woven throw blanket, knight on black." },
  { sku: "the-risen-knight-sticker", name: "The Risen Knight (Sticker)", catalog: 957, category: "sticker", price: 5, placement: "front", url: stickerUrl, variants: [[24964, "2in"], [24965, "3in"], [24966, "4in"], [24967, "5in"], [24968, "6in"]], note: "Die-cut sticker, transparent." },
];

const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const mockJobs = [];
for (const P of PRODUCTS) {
  console.log("\n=== " + P.name + " ===");
  const body = { sync_product: { name: P.name }, sync_variants: P.variants.map(([variant_id]) => ({ variant_id, retail_price: P.price.toFixed(2), files: [{ type: P.placement, url: P.url }] })) };
  const created = await pf("/store/products", { method: "POST", body: JSON.stringify(body) });
  if (created.code && created.code >= 300) { console.log("  CREATE FAILED:", JSON.stringify(created.error).slice(0, 250)); continue; }
  const pid = created.result?.id ?? created.result?.sync_product?.id;
  const detail = await pf(`/store/products/${pid}`);
  const sizeBy = Object.fromEntries(P.variants.map(([id, s]) => [id, s]));
  const variants = (detail.result?.sync_variants ?? []).map((v) => ({ size: sizeBy[v.variant_id] ?? v.size, color: null, price: P.price, syncVariantId: v.id }));
  const exists = (await c.query("select sku from products where sku=$1", [P.sku])).rows[0];
  const cols = [P.name, "crusader", P.category, P.price, String(pid), JSON.stringify(variants), "draft", description, variants.map((v) => v.size), "printful", P.note];
  if (exists) await c.query("update products set name=$2,collection=$3,category=$4,base_price=$5,printful_id=$6,printful_variants=$7,status=$8,description=$9,sizes=$10,source=$11,note=$12 where sku=$1", [P.sku, ...cols]);
  else await c.query("insert into products (sku,name,collection,category,base_price,printful_id,printful_variants,status,description,sizes,source,note) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [P.sku, ...cols]);
  console.log("  printful id:", pid, "| DB:", exists ? "updated" : "inserted");
  mockJobs.push({ sku: P.sku, catalog: P.catalog, variant: P.variants[0][0], placement: P.placement, url: P.url });
}

// mockups, spaced out to respect the mockup-generator rate limit
console.log("\ngenerating mockups (spaced)...");
for (const j of mockJobs) {
  await sleep(20000);
  let key = null;
  for (let a = 0; a < 4 && !key; a++) { const t = await pf(`/mockup-generator/create-task/${j.catalog}`, { method: "POST", body: JSON.stringify({ variant_ids: [j.variant], format: "jpg", files: [{ placement: j.placement, image_url: j.url }] }) }); if (t.result?.task_key) key = t.result.task_key; else await sleep(15000); }
  if (!key) { console.log("  " + j.sku + ": no task"); continue; }
  let mockUrl = null;
  for (let i = 0; i < 40; i++) { await sleep(5000); const t = await pf(`/mockup-generator/task?task_key=${key}`); if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url; break; } if (t.result?.status === "failed") break; }
  if (mockUrl) { const mbuf = Buffer.from(await (await fetch(mockUrl)).arrayBuffer()); writeFileSync(`/tmp/${j.sku}.jpg`, mbuf);
    await fetch(`${SB}/storage/v1/object/product-media/${j.sku}.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: mbuf });
    const pub = `${SB}/storage/v1/object/public/product-media/${j.sku}.jpg`;
    await c.query("update products set image_url=$1 where sku=$2", [pub, j.sku]);
    const hm = (await c.query("select id from product_media where sku=$1", [j.sku])).rows[0];
    if (hm) await c.query("update product_media set url=$1 where sku=$2", [pub, j.sku]); else await c.query("insert into product_media (sku,type,url,visible,source,sort) values ($1,'image',$2,true,'printful',0)", [j.sku, pub]);
    console.log("  " + j.sku + ": mockup ok");
  } else console.log("  " + j.sku + ": mockup failed");
}
await c.end();
console.log("\nSpecial batch done.");
