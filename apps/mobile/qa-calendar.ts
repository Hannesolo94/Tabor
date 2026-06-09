// QA the calendar engine: feast/fast dates, fast-day logic, upcoming, multi-year. npx tsx qa-calendar.ts
import { yearEvents, dayEvents, upcoming, isFastDay, iso } from "./lib/calendar";
import { orthodoxEaster, westernEaster } from "./lib/liturgical";

const D = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (dt: Date, n: number) => new Date(dt.getTime() + n * 86400000);
let pass = 0, fail = 0;
const check = (n: string, c: boolean, d = "") => { if (c) pass++; else { fail++; console.log(`  ✗ ${n}${d ? ` — ${d}` : ""}`); } };
const has = (evs: { name: string }[], name: string) => evs.some((e) => e.name.includes(name));

console.log("=== multi-year: never crashes, always returns events ===");
for (const y of [2024, 2026, 2027, 2030, 2050, 2099]) {
  for (const t of ["orthodox", "catholic"] as const) {
    const evs = yearEvents(y, t);
    check(`${t} ${y}: >=10 events`, evs.length >= 10, `got ${evs.length}`);
    check(`${t} ${y}: sorted`, evs.every((e, i) => i === 0 || evs[i - 1].start <= e.start));
    check(`${t} ${y}: all have start<=end`, evs.every((e) => e.start <= e.end));
  }
}

console.log("\n=== ORTHODOX feast/fast dates (2026, Pascha Apr 12) ===");
const p = orthodoxEaster(2026);
check("Pascha = 2026-04-12", iso(p) === "2026-04-12", iso(p));
const oy = yearEvents(2026, "orthodox");
check("has Pascha feast", has(dayEvents(p, "orthodox"), "Pascha"));
check("has Nativity Dec 25", oy.some((e) => e.start === "2026-12-25" && e.name.includes("Nativity of Christ")));
check("has Theophany Jan 6", oy.some((e) => e.start === "2026-01-06"));
check("has Dormition Aug 15", oy.some((e) => e.start === "2026-08-15"));
check("Great Lent starts Pascha-48", oy.some((e) => e.name === "Great Lent" && e.start === iso(addDays(p, -48))));
check("Great Lent ends Pascha-1", oy.some((e) => e.name === "Great Lent" && e.end === iso(addDays(p, -1))));
check("Nativity Fast Nov15-Dec24", oy.some((e) => e.name === "Nativity Fast" && e.start === "2026-11-15" && e.end === "2026-12-24"));
check("Dormition Fast Aug1-14", oy.some((e) => e.name === "Dormition Fast" && e.start === "2026-08-01" && e.end === "2026-08-14"));

console.log("\n=== ORTHODOX fast-day logic ===");
check("Pascha is NOT a fast day", !isFastDay(p, "orthodox"));
check("Bright Week Wed is NOT a fast", !isFastDay(addDays(p, 3), "orthodox"));
check("a Great Lent weekday IS a fast", isFastDay(addDays(p, -20), "orthodox"));
// find an ordinary-time Wednesday (mid-July, away from feasts/fasts)
let ordWed = D(2026, 7, 8); while (ordWed.getUTCDay() !== 3) ordWed = addDays(ordWed, 1);
check("ordinary Wednesday IS a fast (Orthodox)", isFastDay(ordWed, "orthodox"));
let ordTue = D(2026, 7, 7); while (ordTue.getUTCDay() !== 2) ordTue = addDays(ordTue, 1);
check("ordinary Tuesday is NOT a fast (Orthodox)", !isFastDay(ordTue, "orthodox"));

console.log("\n=== WESTERN (2026, Easter Apr 5) ===");
const we = westernEaster(2026);
check("Western Easter = 2026-04-05", iso(we) === "2026-04-05", iso(we));
const wy = yearEvents(2026, "catholic");
check("has Christmas", wy.some((e) => e.start === "2026-12-25"));
check("has Ash Wednesday", wy.some((e) => e.name === "Ash Wednesday" && e.start === iso(addDays(we, -46))));
check("has Lent fast", wy.some((e) => e.name === "Lent"));
check("has Advent fast", wy.some((e) => e.name === "Advent"));
check("ordinary Wednesday is NOT a fast (Western)", !isFastDay(ordWed, "catholic"));
check("a Lent weekday IS a fast (Western)", isFastDay(addDays(we, -20), "catholic"));

console.log("\n=== upcoming() spans the year boundary ===");
const dec = upcoming(D(2026, 12, 20), "orthodox", 5);
check("upcoming from Dec returns events", dec.length === 5);
check("upcoming is sorted + future", dec.every((e, i) => e.start >= "2026-12-20" && (i === 0 || dec[i - 1].start <= e.start)));
check("upcoming reaches into next year", dec.some((e) => e.start.startsWith("2027")));

console.log("\n=== SAMPLE: next 6 Orthodox events from today ===");
upcoming(new Date(), "orthodox", 6).forEach((e) => console.log(`  ${e.start}${e.end !== e.start ? `…${e.end}` : ""}  [${e.kind}] ${e.name}`));

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
