// QA the real Daily Office: feast detection, tone rotation, Paschal season, season-awareness,
// and well-formed output for every tradition. Run: npx tsx qa-office.ts
import { dailyOffice } from "./lib/office";
import { orthodoxEaster, westernEaster } from "./lib/liturgical";

type Trad = "catholic" | "orthodox" | "anglican" | "pentecostal" | "protestant";
const TRADS: Trad[] = ["orthodox", "catholic", "anglican", "pentecostal", "protestant"];
const D = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (dt: Date, n: number) => new Date(dt.getTime() + n * 86400000);
const iso = (dt: Date) => dt.toISOString().slice(0, 10);

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; } else { fail++; console.log(`  ✗ FAIL: ${name}${detail ? ` — ${detail}` : ""}`); }
}

console.log("=== STRUCTURE: every tradition returns a well-formed office (today) ===");
const today = new Date();
for (const t of TRADS) {
  const o = dailyOffice(today, t);
  check(`${t}: has title`, !!o.title && o.title.length > 0);
  check(`${t}: >=4 sections`, o.sections.length >= 4, `got ${o.sections.length}`);
  check(`${t}: all sections have label+body`, o.sections.every((s) => s.label && s.body && s.body.length > 10));
  check(`${t}: eyebrow set`, !!o.eyebrow);
}

console.log("\n=== ORTHODOX: feast troparia land on the right days (2026) ===");
const p = orthodoxEaster(2026); // 2026-04-12
console.log(`  Orthodox Pascha 2026 = ${iso(p)}`);
const oFeasts: [Date, string][] = [
  [addDays(p, -7), "Entry into Jerusalem"], [addDays(p, 39), "Ascension"], [addDays(p, 49), "Pentecost"],
  [D(2026, 9, 8), "Nativity of the Theotokos"], [D(2026, 9, 14), "Exaltation of the Cross"],
  [D(2026, 11, 21), "Entrance of the Theotokos"], [D(2026, 12, 25), "Nativity of Christ"],
  [D(2026, 1, 6), "Theophany"], [D(2026, 2, 2), "Meeting of the Lord"], [D(2026, 3, 25), "Annunciation"],
  [D(2026, 8, 6), "Transfiguration"], [D(2026, 8, 15), "Dormition"],
];
for (const [dt, name] of oFeasts) {
  const o = dailyOffice(dt, "orthodox");
  check(`orthodox ${iso(dt)} → ${name}`, o.title === name, `got "${o.title}"`);
  check(`orthodox ${iso(dt)} troparion present`, o.sections[0].label.startsWith("FEAST ·") && o.sections[0].body.length > 20);
}

console.log("\n=== ORTHODOX: Paschal season + tone rotation ===");
check("Pascha+8 (ordinary paschal day) → Christ is Risen", dailyOffice(addDays(p, 8), "orthodox").title === "Christ is Risen", `got "${dailyOffice(addDays(p, 8), "orthodox").title}"`);
check("Pascha+8 troparion is PASCHAL", dailyOffice(addDays(p, 8), "orthodox").sections[0].label === "PASCHAL TROPARION");
const tones = new Set<string>();
for (let w = 0; w < 8; w++) {
  const dt = addDays(D(2026, 6, 9), w * 7); // weekly steps after Pentecost
  const lbl = dailyOffice(dt, "orthodox").sections[0].label;
  if (lbl.includes("TONE")) tones.add(lbl);
}
check("8 distinct tones across 8 weeks", tones.size === 8, `got ${tones.size}: ${[...tones].join(", ")}`);
const ord = dailyOffice(D(2026, 6, 9), "orthodox");
check("ordinary day → resurrectional troparion", ord.sections[0].label.startsWith("RESURRECTIONAL TROPARION · TONE"));

console.log("\n=== ORTHODOX: Great Lent adds St Ephrem ===");
const lentDay = addDays(p, -20); // within Great Lent
const lentO = dailyOffice(lentDay, "orthodox");
check("Lent day has St Ephrem section", lentO.sections.some((s) => s.label === "PRAYER OF ST EPHREM"));
check("non-Lent day has no St Ephrem", !dailyOffice(D(2026, 6, 9), "orthodox").sections.some((s) => s.label === "PRAYER OF ST EPHREM"));

console.log("\n=== WESTERN: feast banner on the right days (2026) ===");
const we = westernEaster(2026); // 2026-04-05
console.log(`  Western Easter 2026 = ${iso(we)}`);
const wFeasts: [Date, string][] = [
  [we, "Easter Sunday"], [addDays(we, 39), "Ascension"], [addDays(we, 49), "Pentecost"],
  [D(2026, 12, 25), "Christmas"], [D(2026, 1, 6), "Epiphany"], [D(2026, 11, 1), "All Saints"],
];
for (const [dt, name] of wFeasts) {
  const o = dailyOffice(dt, "catholic");
  check(`catholic ${iso(dt)} → ${name}`, o.title === name, `got "${o.title}"`);
  check(`catholic ${iso(dt)} feast banner first`, o.sections[0].label === "FEAST OF THE DAY");
}
check("western ordinary day → no feast banner", dailyOffice(D(2026, 6, 9), "protestant").sections[0].label !== "FEAST OF THE DAY");

console.log("\n=== CONTENT SPOT-CHECK ===");
check("orthodox has Jesus Prayer", dailyOffice(D(2026, 6, 9), "orthodox").sections.some((s) => s.label === "THE JESUS PRAYER"));
check("catholic has Hail Mary", dailyOffice(D(2026, 6, 9), "catholic").sections.some((s) => s.label === "HAIL MARY"));
check("anglican has Collect for Purity", dailyOffice(D(2026, 6, 9), "anglican").sections.some((s) => s.label === "COLLECT FOR PURITY"));
check("pentecostal has Prayer for the Spirit", dailyOffice(D(2026, 6, 9), "pentecostal").sections.some((s) => s.label === "A PRAYER FOR THE SPIRIT"));
check("all have the Lord's Prayer", TRADS.every((t) => dailyOffice(D(2026, 6, 9), t).sections.some((s) => s.label === "THE LORD'S PRAYER")));

console.log("\n=== SAMPLE OUTPUT ===");
for (const [t, dt] of [["orthodox", D(2026, 12, 25)], ["catholic", D(2026, 6, 9)], ["pentecostal", D(2026, 6, 9)]] as [Trad, Date][]) {
  const o = dailyOffice(dt, t);
  console.log(`\n  [${t} · ${iso(dt)}] ${o.eyebrow} → "${o.title}"${o.season ? ` (${o.season})` : ""}`);
  console.log(`    sections: ${o.sections.map((s) => s.label).join(" | ")}`);
}

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
