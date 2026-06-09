// Re-crop the design SYMMETRICALLY about the knight (denoised), so it prints centered,
// then update the Printful product + mockup + product image.
import { readFileSync, writeFileSync } from "node:fs";
import zlib from "node:zlib";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
const pf = (path, opts = {}) => fetch("https://api.printful.com" + path, { ...opts, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(opts.headers || {}) } }).then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// decode original
const buf = readFileSync("/tmp/design1.png");
const W = buf.readUInt32BE(16), H = buf.readUInt32BE(20);
let p = 8; const idat = [];
while (p < buf.length) { const len = buf.readUInt32BE(p); const t = buf.toString("ascii", p + 4, p + 8); if (t === "IDAT") idat.push(buf.subarray(p + 8, p + 8 + len)); p += 12 + len; }
const rawIn = zlib.inflateSync(Buffer.concat(idat));
const stride = W * 4, src = Buffer.alloc(H * stride);
const pae = (a, b, c) => { const q = a + b - c, da = Math.abs(q - a), db = Math.abs(q - b), dc = Math.abs(q - c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
let o = 0;
for (let y = 0; y < H; y++) { const f = rawIn[o++]; for (let x = 0; x < stride; x++) { const v = rawIn[o++]; const a = x >= 4 ? src[y * stride + x - 4] : 0; const b = y > 0 ? src[(y - 1) * stride + x] : 0; const cc = (x >= 4 && y > 0) ? src[(y - 1) * stride + x - 4] : 0; let r; if (f === 0) r = v; else if (f === 1) r = v + a; else if (f === 2) r = v + b; else if (f === 3) r = v + ((a + b) >> 1); else r = v + pae(a, b, cc); src[y * stride + x] = r & 255; } }

// knight centroid (solid pixels) + DENOISED bbox: a column/row counts only if it has >=8 solid px
let sx = 0, sy = 0, n = 0;
const colCount = new Int32Array(W), rowCount = new Int32Array(H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = src[y * stride + x * 4 + 3]; if (a > 110) { colCount[x]++; rowCount[y]++; } if (a > 150) { sx += x; sy += y; n++; } }
const cx = Math.round(sx / n), cy = Math.round(sy / n);
const THRESH = 25;
let minX = 0; while (minX < W && colCount[minX] < THRESH) minX++;
let maxX = W - 1; while (maxX > 0 && colCount[maxX] < THRESH) maxX--;
let minY = 0; while (minY < H && rowCount[minY] < THRESH) minY++;
let maxY = H - 1; while (maxY > 0 && rowCount[maxY] < THRESH) maxY--;
// symmetric about the knight horizontally; vertical = content + small pad
const pad = 24;
const halfW = Math.max(cx - minX, maxX - cx) + pad;
let x0 = Math.max(0, cx - halfW), x1 = Math.min(W - 1, cx + halfW);
let y0 = Math.max(0, minY - pad), y1 = Math.min(H - 1, maxY + pad);
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
console.log(`knight centroid ${cx},${cy} | denoised bbox x[${minX}..${maxX}] | centered crop ${cw}x${ch} (knight at ${cx - x0} of ${cw} -> ${(100 * (cx - x0) / cw).toFixed(1)}%)`);

// crop + encode PNG
const crop = Buffer.alloc(ch * cw * 4);
for (let y = 0; y < ch; y++) src.copy(crop, y * cw * 4, (y0 + y) * stride + x0 * 4, (y0 + y) * stride + x0 * 4 + cw * 4);
function crc32(b) { let c = ~0; for (let i = 0; i < b.length; i++) { c ^= b[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (~c) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const tt = Buffer.from(type, "ascii"); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tt, data]))); return Buffer.concat([len, tt, data, crc]); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(cw, 0); ihdr.writeUInt32BE(ch, 4); ihdr[8] = 8; ihdr[9] = 6;
const cstride = cw * 4, raw = Buffer.alloc(ch * (cstride + 1));
for (let y = 0; y < ch; y++) { raw[y * (cstride + 1)] = 0; crop.copy(raw, y * (cstride + 1) + 1, y * cstride, y * cstride + cstride); }
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
writeFileSync("/tmp/design1-centered.png", png);

// upload + signed url
const dpath = "the-risen-knight-centered.png";
await fetch(`${SB}/storage/v1/object/design-files/${dpath}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/png", "x-upsert": "true" }, body: png });
const sign = await fetch(`${SB}/storage/v1/object/sign/design-files/${dpath}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
const url = SB + "/storage/v1" + sign.signedURL;

// position: fill back width (1800), centered
const aw = 1800, ah = 2400, w = 1800, h = Math.round(1800 * ch / cw), top = Math.round((ah - h) / 2);
const position = { area_width: aw, area_height: ah, width: w, height: h, top, left: 0, limit_to_print_area: true };
console.log("print size:", w + "x" + h, `(~${(w / 150).toFixed(1)}in x ${(h / 150).toFixed(1)}in)`);

// update product
const detail = await pf("/store/products/437500038");
const sv = detail.result?.sync_variants ?? [];
const upd = await pf("/store/products/437500038", { method: "PUT", body: JSON.stringify({ sync_variants: sv.map((v) => ({ id: v.id, variant_id: v.variant_id, retail_price: "25.00", files: [{ type: "back_dtf", url, position }] })) }) });
console.log("product update:", upd.code && upd.code >= 300 ? "FAILED " + JSON.stringify(upd.error).slice(0, 200) : "ok");

// mockup
const task = await pf("/mockup-generator/create-task/438", { method: "POST", body: JSON.stringify({ variant_ids: [11548], format: "jpg", files: [{ placement: "back", image_url: url, position }] }) });
const key = task.result?.task_key; let mockUrl = null;
for (let i = 0; i < 20; i++) { await sleep(3000); const t = await pf(`/mockup-generator/task?task_key=${key}`); if (t.result?.status === "completed") { mockUrl = t.result?.mockups?.[0]?.mockup_url; break; } if (t.result?.status === "failed") break; process.stdout.write("."); }
console.log("\nmockup:", mockUrl ? "ok" : "failed");
if (!mockUrl) process.exit(1);
const img = await fetch(mockUrl); const mbuf = Buffer.from(await img.arrayBuffer()); writeFileSync("/tmp/mock3.jpg", mbuf);
await fetch(`${SB}/storage/v1/object/product-media/the-risen-knight-back.jpg`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: mbuf });
const publicUrl = `${SB}/storage/v1/object/public/product-media/the-risen-knight-back.jpg?v=3`;
const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } }); await c.connect();
await c.query("update products set image_url=$1 where sku='the-risen-knight'", [publicUrl]);
await c.query("update product_media set url=$1 where sku='the-risen-knight'", [publicUrl]);
await c.end();
console.log("done. centered + updated.");
