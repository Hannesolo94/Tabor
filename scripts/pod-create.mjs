// Create a Printful sync product from an uploaded design, then sync it into the products
// table as a draft. One-off for "The Risen Knight". Reads keys from root .env.
import { readFileSync } from "node:fs";
import pg from "pg";

const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2]; }
const PF = env.PRINTFUL_API_KEY;
const SB = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SVC = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SERVICE_ROLE_KEY;
const pf = (path, opts = {}) => fetch("https://api.printful.com" + path, { ...opts, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json", ...(opts.headers || {}) } }).then((r) => r.json());

// 1) fresh signed URL for the design (Printful fetches it during creation)
const designPath = "1781002583490-1ggntn.png";
const sign = await fetch(`${SB}/storage/v1/object/sign/design-files/${designPath}`, { method: "POST", headers: { Authorization: "Bearer " + SVC, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) }).then((r) => r.json());
const fileUrl = SB + "/storage/v1" + sign.signedURL;
console.log("design signed url ready:", !!sign.signedURL);

// 2) catalog variants for the Gildan 5000 black tee (S..5XL), back DTF placement
const SIZES = [[11546, "S"], [11547, "M"], [11548, "L"], [11549, "XL"], [11550, "2XL"], [12644, "3XL"], [12645, "4XL"], [12646, "5XL"]];
const RETAIL = "25.00";
const body = {
  sync_product: { name: "The Risen Knight" },
  sync_variants: SIZES.map(([variant_id]) => ({ variant_id, retail_price: RETAIL, files: [{ type: "back_dtf", url: fileUrl }] })),
};
const created = await pf("/store/products", { method: "POST", body: JSON.stringify(body) });
if (created.code && created.code >= 300) { console.log("PRINTFUL CREATE FAILED:", created.code, JSON.stringify(created.error || created.result).slice(0, 400)); process.exit(1); }
const productId = created.result?.id ?? created.result?.sync_product?.id;
console.log("Printful product created. id:", productId);

// 3) read back the created product to capture sync variant ids
const detail = await pf(`/store/products/${productId}`);
const sv = detail.result?.sync_variants ?? [];
const sizeByVariant = Object.fromEntries(SIZES.map(([id, s]) => [id, s]));
const variants = sv.map((v) => ({ size: sizeByVariant[v.variant_id] ?? v.size, color: "Black", price: 25, syncVariantId: v.id }));
console.log("sync variants:", variants.length, "| sample:", JSON.stringify(variants[0]));

// 4) insert into products as a draft (Crusader)
const c = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const sku = "the-risen-knight";
const exists = (await c.query("select sku from products where sku=$1", [sku])).rows[0];
const description = "The knight does not climb alone. Armored and haloed, he rises from the smoke of the fight, caught up in a shaft of light toward the cross. For the brother who keeps moving forward. Sons of Fire.";
const blurb = "Armored, haloed, rising in the light. Back-print black tee.";
const row = { sku, name: "The Risen Knight", collection: "crusader", category: "apparel", base_price: 25, printful_id: String(productId), printful_variants: JSON.stringify(variants), status: "draft", description, blurb, tagline: "He rises.", sizes: variants.map((v) => v.size), source: "printful", note: "Back DTF print, Gildan 5000 black." };
if (exists) {
  await c.query("update products set name=$2, collection=$3, category=$4, base_price=$5, printful_id=$6, printful_variants=$7, status=$8, description=$9, blurb=$10, tagline=$11, sizes=$12 where sku=$1", [sku, row.name, row.collection, row.category, row.base_price, row.printful_id, row.printful_variants, row.status, row.description, row.blurb, row.tagline, row.sizes]);
  console.log("updated existing products row:", sku);
} else {
  await c.query("insert into products (sku,name,collection,category,base_price,printful_id,printful_variants,status,description,blurb,tagline,sizes,source,note) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [sku, row.name, row.collection, row.category, row.base_price, row.printful_id, row.printful_variants, row.status, row.description, row.blurb, row.tagline, row.sizes, row.source, row.note]);
  console.log("inserted products row:", sku);
}
// mark the design file as synced (track what we have processed)
await c.query("update design_files set scope=scope, notes=coalesce(notes,'')||' [synced -> the-risen-knight]' where path=$1", [designPath]);
await c.end();
console.log("\nDONE. Product is a DRAFT. Printful id:", productId, "| store SKU:", sku);
