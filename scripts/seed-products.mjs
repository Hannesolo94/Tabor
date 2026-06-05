// One-time seed: push the curated Phase 1 catalog into the products table so the
// site becomes data-driven. Idempotent (upsert on sku). After this, the DB is the
// source of truth and edits happen in /admin.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
// Resolve @supabase/supabase-js from the web app's node_modules.
const require = createRequire(new URL("../apps/web/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");

const env = {};
for (const l of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TEE = ["S", "M", "L", "XL", "2XL"];
const ONE = ["One size"];
const GOLD = "#C9A961";

const P = [
  ["snt-tee-sof","Sons of Fire Tee",38,"sentinel","apparel","Back-print wordmark","240gsm heavyweight","The flagship tee. Heavyweight, back-print wordmark.","A 240gsm heavyweight cotton tee with the blackletter wordmark printed large across the back and a small seal at the chest. Muted, structured, built to outlast trends. The uniform of the man who simply shows up.","#15151A","#E8E2D5","word",TEE,true],
  ["snt-crew-tempered","Tempered Crewneck",58,"sentinel","apparel","Chest seal, nape text","Midweight loopback","Midweight loopback crew with chest seal.","A midweight loopback crewneck carrying the coin-seal at the chest and the creed printed at the nape. Clean, considered, and warm enough for the dawn watch.","#131318","#E8E2D5","seal",TEE,false],
  ["snt-cap-seal","Seal Cap",32,"sentinel","headwear","Gold-thread seal","Structured 6-panel","Structured 6-panel with gold-thread seal.","A structured six-panel cap with the seal embroidered in gold thread. Holds its shape, holds the line.","#17140E",GOLD,"seal",ONE,false],
  ["snt-flag-standard","The Standard Flag",44,"sentinel","flag","Wall standard","Single-sided, grommeted","Wall standard for the war room.","A single-sided wall flag bearing the TABOR seal and wordmark, grommeted for hanging. Fly the standard over the place you train, game, and pray.","#121216",GOLD,"seal",[],true],
  ["snt-sticker-pack","Sigil Sticker Pack",12,"sentinel","sticker","Seal + wordmark","Die-cut vinyl x6","Six die-cut vinyl decals.","Six die-cut weatherproof vinyl stickers: the seal, the wordmark, and the three lights. Mark your laptop, bottle, or rig.","#0F0F12",GOLD,"seal",[],false],
  ["snt-mug-dawn","Dawn Watch Mug",18,"sentinel","drinkware","Seal, both sides","11oz ceramic","11oz ceramic for the morning.","An 11oz ceramic mug marked with the seal on both sides. For the coffee before the climb.","#16140E",GOLD,"seal",ONE,false],

  ["crs-hoodie-ascent","Ascent Hoodie",72,"crusader","apparel","Tonal seal, gold cuff","Brushed-back fleece","Brushed-back fleece, tonal seal.","A heavyweight brushed-back fleece hoodie with a tonal seal at the chest and a gold cuff mark. Built to be trained in and punished. The Crusader's second skin.","#121216",GOLD,"seal",TEE,true],
  ["crs-joggers-forge","Forge Joggers",64,"crusader","apparel","Cuff wordmark","Tapered heavyweight","Tapered heavyweight joggers.","Tapered heavyweight joggers with the wordmark at the cuff. Cut for movement, weighted for the cold of the early session.","#14140F","#E8E2D5","word",TEE,false],
  ["crs-tee-iron","Iron Body Tee",40,"crusader","apparel","Train the temple","Performance cotton","Performance tee for the iron.","A performance-cotton training tee. The body is a temple, so train it. Built to move and to soak the work.","#15151A",GOLD,"word",TEE,false],
  ["crs-towel-gym","Forge Gym Towel",26,"crusader","towel","Seal corner","Woven cotton","Woven gym towel, seal corner.","A woven cotton gym towel with the seal at the corner. For the sweat of the climb. Sized for the bench and the bag.","#1A1410",GOLD,"seal",[],true],
  ["crs-beanie-cuff","Watch Beanie",28,"crusader","headwear","Cuff seal","Ribbed knit","Ribbed cuffed beanie.","A ribbed cuffed beanie with the seal stitched at the fold. For the cold walk to the early session.","#14140F",GOLD,"seal",ONE,false],
  ["crs-flag-banner","War Room Banner",48,"crusader","flag","Vertical banner","Single-sided","Vertical training banner.","A vertical single-sided banner for the home gym or war room. The seal and creed, large. Hang it where the work happens.","#121012",GOLD,"seal",[],false],

  ["scr-crew-theosis","Theosis Crewneck",60,"scribe","apparel","Greek inscription","Premium loopback","Premium crew with Greek inscription.","A premium loopback crewneck carrying a quiet Greek inscription and the wordmark. Considered, sacred in its detail, made for the man who leans into the Word.","#101216","#9FB8C9","word",TEE,true],
  ["scr-tee-prov","Iron Sharpens Tee",40,"scribe","apparel","Proverbs 27:17","Black, scripture back","Black tee, scripture back-print.","A black tee with Proverbs 27:17 set across the back in a quiet serif. Iron sharpeneth iron. Wear the verse you live by.","#121214","#9FB8C9","word",TEE,false],
  ["scr-journal-quest","Quest Log Journal",22,"scribe","stationery","Daily quest log","Hardcover, lined","Hardcover quest log + scripture journal.","A hardcover lined journal built as a daily quest log and scripture journal. Record the climb, the Word, and the work. Ribboned and seal-stamped.","#14140F",GOLD,"seal",[],true],
  ["scr-print-scripture","Proverbs Wall Print",30,"scribe","print","Framed scripture","Matte poster","Matte scripture wall print.","A matte wall print setting Proverbs 27:17 beneath the seal. For the study, the desk, or the wall you face when you rise.","#101216","#9FB8C9","seal",[],false],
  ["scr-candle-vigil","Vigil Candle",24,"scribe","candle","Dawn watch","Soy, printed label","Soy candle for the dawn watch.","A soy candle with a printed seal label, for the dawn watch and quiet prayer. Light it when you read.","#16140E",GOLD,"seal",ONE,false],
  ["scr-cap-scribe","Scribe Cap",32,"scribe","headwear","Tonal seal","Unstructured dad cap","Unstructured cap, tonal seal.","An unstructured low-profile cap with a tonal seal. Quiet and considered, for the student of the Word.","#101216","#9FB8C9","seal",ONE,false],

  ["pil-tee-firstlight","First Light Tee",34,"pilgrim","apparel","Small chest seal","180gsm everyday","Everyday tee, small chest seal.","A 180gsm everyday tee with a small seal at the chest. The first piece of the journey. Light, clean, and easy to live in.","#15151A",GOLD,"seal",TEE,true],
  ["pil-hoodie-pilgrim","Pilgrim Hoodie",62,"pilgrim","apparel","Small seal","Midweight fleece","Approachable midweight hoodie.","A midweight fleece hoodie with a small seal at the chest. Approachable and warm, for the man at the start of the climb.","#15151A",GOLD,"seal",TEE,false],
  ["pil-bottle-dawn","Dawn Water Bottle",30,"pilgrim","drinkware","Etched seal","Insulated steel 750ml","Insulated 750ml steel bottle.","A 750ml insulated steel water bottle with an etched seal. Keeps the cold through the session. Carry it from day one.","#16140E",GOLD,"seal",ONE,true],
  ["pil-blanket-watch","Watch Blanket",52,"pilgrim","blanket","Woven seal","Sherpa fleece","Sherpa fleece throw, woven seal.","A sherpa fleece throw with the seal woven in. Warmth for the watch, the couch, and the cold mornings of the early road.","#16140E",GOLD,"seal",[],false],
  ["pil-rug-ground","Holy Ground Rug",64,"pilgrim","rug","Centered seal","Chenille, dye-sub","Chenille rug with centered seal.","A dye-sublimated chenille rug with the seal centered. Ground for the floor you train and pray on. Take off your shoes; this is holy ground.","#14120E",GOLD,"seal",[],false],
  ["pil-sticker-firstlight","First Light Sticker",6,"pilgrim","sticker","Seal decal","Die-cut vinyl","Single die-cut seal decal.","A single die-cut weatherproof seal decal. The smallest first step. Mark something with the seal and begin.","#0F0F12",GOLD,"seal",[],false],
];

const rows = P.map((a, i) => ({
  sku: a[0], name: a[1], base_price: a[2], collection: a[3], category: a[4],
  tagline: a[5], note: a[6], blurb: a[7], description: a[8],
  tone: a[9], ink: a[10], mark: a[11], sizes: a[12], featured: a[13],
  status: "live", phase: 1, sort: i, track_inventory: false, inventory: 0,
}));

const { error } = await sb.from("products").upsert(rows, { onConflict: "sku" });
if (error) { console.error("FAILED:", error.message); process.exit(1); }
const { count } = await sb.from("products").select("sku", { count: "exact", head: true });
console.log(`seeded ${rows.length} products. products table now has ${count} rows.`);
