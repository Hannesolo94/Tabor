// Uploads the private portfolio (HTML + deck assets + self-hosted fonts) into a
// PRIVATE Supabase Storage bucket. Nothing here is ever served from Storage
// directly: apps/web/app/w/[slug]/** is the only way in, and it checks the
// session + the grant table before streaming a byte.
//
//   node scripts/cv-upload.mjs <source-dir> [fonts-dir]
//
// <source-dir> holds presentation.html and assets/deck/*.
// [fonts-dir]  holds fonts.css + *.woff2, uploaded to assets/fonts/*.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "private-cv";

const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const src = process.argv[2];
const fontsDir = process.argv[3];
if (!src) {
  console.error("usage: node scripts/cv-upload.mjs <source-dir> [fonts-dir]");
  process.exit(1);
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1) Private bucket. If it already exists, force public:false so a past mistake
//    (or a dashboard toggle) cannot silently leave the deck world-readable.
const { data: buckets } = await sb.storage.listBuckets();
const existing = (buckets ?? []).find((b) => b.name === BUCKET);
if (!existing) {
  const { error } = await sb.storage.createBucket(BUCKET, { public: false });
  if (error) throw error;
  console.log(`created private bucket ${BUCKET}`);
} else {
  const { error } = await sb.storage.updateBucket(BUCKET, { public: false });
  if (error) throw error;
  console.log(`bucket ${BUCKET} exists — forced public=false`);
}

async function put(localPath, remotePath) {
  const body = readFileSync(localPath);
  const contentType = TYPES[extname(localPath).toLowerCase()] || "application/octet-stream";
  const { error } = await sb.storage.from(BUCKET).upload(remotePath, body, { contentType, upsert: true });
  if (error) throw new Error(`${remotePath}: ${error.message}`);
  console.log(`  ${remotePath}  ${(body.length / 1024).toFixed(0)}KB  ${contentType}`);
}

// 2) The page itself, byte-for-byte as authored. The gateway does the two
//    serve-time rewrites (<base> + local fonts); the stored file stays original.
await put(join(src, "presentation.html"), "presentation.html");

// 3) Deck assets.
const deckDir = join(src, "assets", "deck");
const deck = readdirSync(deckDir).filter((f) => statSync(join(deckDir, f)).isFile());
console.log(`uploading ${deck.length} deck files`);
for (const f of deck) await put(join(deckDir, f), `assets/deck/${f}`);

// 4) Self-hosted fonts (so the page needs no third-party request at all).
if (fontsDir) {
  const fonts = readdirSync(fontsDir).filter((f) => /\.(css|woff2?)$/i.test(f));
  console.log(`uploading ${fonts.length} font files`);
  for (const f of fonts) await put(join(fontsDir, f), `assets/fonts/${basename(f)}`);
}

// 5) Prove it is private: an anon public-URL fetch must fail.
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
const pub = anon.storage.from(BUCKET).getPublicUrl("assets/deck/" + deck[0]).data.publicUrl;
const res = await fetch(pub);
console.log(`\npublic-URL probe -> ${res.status} ${res.statusText}  (must NOT be 200)`);
console.log(pub);
if (res.ok) {
  console.error("FAIL: bucket is public. Fix before shipping.");
  process.exit(1);
}
console.log("\nOK: bucket is private.");
