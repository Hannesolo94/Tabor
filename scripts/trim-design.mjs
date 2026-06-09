// Trim the transparent margins off the design so the artwork fills the print area
// (makes the back print much larger). Decodes, finds the alpha bounding box, crops,
// re-encodes a PNG, uploads it, and prints a signed URL for Printful.
import { readFileSync, writeFileSync } from "node:fs";
import zlib from "node:zlib";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const SB = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

// --- decode source PNG to RGBA ---
const buf = readFileSync("/tmp/design1.png");
const W = buf.readUInt32BE(16), H = buf.readUInt32BE(20);
let p = 8; const idat = [];
while (p < buf.length) { const len = buf.readUInt32BE(p); const type = buf.toString("ascii", p + 4, p + 8); if (type === "IDAT") idat.push(buf.subarray(p + 8, p + 8 + len)); p += 12 + len; }
const rawIn = zlib.inflateSync(Buffer.concat(idat));
const stride = W * 4, src = Buffer.alloc(H * stride);
const pae = (a, b, c) => { const q = a + b - c, da = Math.abs(q - a), db = Math.abs(q - b), dc = Math.abs(q - c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
let off = 0;
for (let y = 0; y < H; y++) { const f = rawIn[off++]; for (let x = 0; x < stride; x++) { const v = rawIn[off++]; const a = x >= 4 ? src[y * stride + x - 4] : 0; const b = y > 0 ? src[(y - 1) * stride + x] : 0; const c = (x >= 4 && y > 0) ? src[(y - 1) * stride + x - 4] : 0; let r; if (f === 0) r = v; else if (f === 1) r = v + a; else if (f === 2) r = v + b; else if (f === 3) r = v + ((a + b) >> 1); else r = v + pae(a, b, c); src[y * stride + x] = r & 255; } }

// --- alpha bounding box (alpha > 10) ---
let minX = W, minY = H, maxX = -1, maxY = -1;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (src[y * stride + x * 4 + 3] > 10) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; } }
const pad = 24;
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
const cw = maxX - minX + 1, ch = maxY - minY + 1;
console.log(`source ${W}x${H} -> artwork bbox ${cw}x${ch} (was ${(100 * cw * ch / (W * H)).toFixed(0)}% of canvas) | aspect ${(cw / ch).toFixed(2)}`);

// --- crop ---
const crop = Buffer.alloc(ch * cw * 4);
for (let y = 0; y < ch; y++) src.copy(crop, y * cw * 4, (minY + y) * stride + minX * 4, (minY + y) * stride + minX * 4 + cw * 4);

// --- encode PNG (RGBA, filter 0) ---
function crc32(b) { let c = ~0; for (let i = 0; i < b.length; i++) { c ^= b[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return (~c) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const t = Buffer.from(type, "ascii"); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, crc]); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(cw, 0); ihdr.writeUInt32BE(ch, 4); ihdr[8] = 8; ihdr[9] = 6;
const cstride = cw * 4, raw = Buffer.alloc(ch * (cstride + 1));
for (let y = 0; y < ch; y++) { raw[y * (cstride + 1)] = 0; crop.copy(raw, y * (cstride + 1) + 1, y * cstride, y * cstride + cstride); }
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
writeFileSync("/tmp/design1-trimmed.png", png);
console.log("trimmed png:", png.length, "bytes");

// --- upload to design-files + signed url ---
const path = "the-risen-knight-trimmed.png";
const up = await fetch(`${SB}/storage/v1/object/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "image/png", "x-upsert": "true" }, body: png });
console.log("upload status", up.status);
const sign = await fetch(`${SB}/storage/v1/object/sign/design-files/${path}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
console.log("SIGNED_URL=" + SB + "/storage/v1" + sign.signedURL);
console.log("TRIMMED_DIMS=" + cw + "x" + ch);
