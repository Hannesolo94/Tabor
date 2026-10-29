// Read-only (Oct 29 2026): which worldwide crewneck blank to rebuild the 5 crewnecks on. Reads the old crewnecks' print
// files, then asks Printful for an order estimate (creates nothing) per candidate blank, black, M + biggest size,
// to US/ZA/GB/DE/AU. Old blank United Athle 5044-01 ships to East Asia only.
import { readFileSync } from "node:fs";
const env = {};
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"|"$/g, ""); }
const PF = env.PRINTFUL_API_KEY, SB = env.NEXT_PUBLIC_SUPABASE_URL, SVC = env.SUPABASE_SERVICE_ROLE_KEY;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function pf(p, o = {}) {
  for (let i = 0; i < 3; i++) {
    const j = await fetch("https://api.printful.com" + p, { ...o, headers: { Authorization: "Bearer " + PF, "Content-Type": "application/json" } }).then((r) => r.json());
    await sleep(1500);
    if (j.code === 429) { await sleep(61000); continue; }
    return j;
  }
}
const rows = await fetch(`${SB}/rest/v1/products?sku=like.*-sweater&select=sku,printful_id`, { headers: { apikey: SVC, Authorization: "Bearer " + SVC } }).then((r) => r.json());
for (const r of rows) {
  const d = await pf(`/store/products/${r.printful_id}`);
  const v = d.result.sync_variants[0];
  console.log("OLD", r.sku, JSON.stringify((v.files || []).filter((f) => f.type !== "preview").map((f) => ({ type: f.type, url: f.url, pos: f.position, w: f.width, h: f.height }))));
}
const sample = (await pf(`/store/products/${rows[0].printful_id}`)).result.sync_variants[0].files.find((f) => f.type !== "preview");
const TO = { US: { country_code: "US", state_code: "MO", city: "Kansas City", zip: "64108", address1: "1801 Main St" }, ZA: { country_code: "ZA", city: "Cape Town", zip: "8001", address1: "1 Long Street" },
  GB: { country_code: "GB", city: "London", zip: "SW1A 1AA", address1: "10 Downing Street" }, DE: { country_code: "DE", city: "Berlin", zip: "10115", address1: "Invalidenstrasse 1" },
  AU: { country_code: "AU", state_code: "NSW", city: "Sydney", zip: "2000", address1: "1 George Street" } };
for (const [id, place] of [[145, "back_dtf"], [145, "back"], [845, "back_dtf"], [845, "back"]]) {
  const cat = await pf(`/products/${id}`);
  const black = cat.result.variants.filter((v) => /^black$/i.test(v.color) && v.in_stock !== false);
  console.log(`\n${id} ${cat.result.product.title} [${place}] black sizes: ${black.map((v) => v.size).join(",")}`);
  for (const v of [black.find((x) => x.size === "M"), black[black.length - 1]]) {
    if (!v) continue;
    for (const [cc, rec] of Object.entries(TO)) {
      const r = await pf("/orders/estimate-costs", { method: "POST", body: JSON.stringify({ recipient: rec, items: [{ variant_id: v.id, quantity: 1, files: [{ type: place, url: sample.url }] }] }) });
      const c = r.result?.costs;
      console.log(`  ${v.size} ${cc}: ${c ? `item ${c.subtotal} ship ${c.shipping} tax ${(c.tax || 0) + (c.vat || 0)} total ${c.total}` : "NO: " + String(r.result || r.error?.message).slice(0, 120)}`);
    }
  }
}
