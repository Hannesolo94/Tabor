// Liturgical calendar engine — denomination-aware feasts + fast periods for ANY year,
// computed from the Pascha/Easter algorithms (no hardcoded dates, never needs updating).
// Orthodox fixed feasts use the revised-Julian (civil) dates common in the diaspora.
import type { Tradition } from "./disciplines";
import { orthodoxEaster, westernEaster } from "./liturgical";

export type EventKind = "feast" | "fast";
export interface LitEvent { start: string; end: string; name: string; kind: EventKind; major?: boolean }

const DAY = 86_400_000;
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (dt: Date, n: number) => new Date(dt.getTime() + n * DAY);
export const iso = (dt: Date) => dt.toISOString().slice(0, 10);
const dayNum = (dt: Date) => Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
const feast = (dt: Date, name: string, major = true): LitEvent => ({ start: iso(dt), end: iso(dt), name, kind: "feast", major });
const fast = (a: Date, b: Date, name: string): LitEvent => ({ start: iso(a), end: iso(b), name, kind: "fast", major: true });

// First Sunday of Advent: the 4th Sunday before Christmas.
function adventStart(year: number): Date {
  const christmas = utc(year, 12, 25);
  return addDays(christmas, -(((christmas.getUTCDay() + 7) % 7) + 21));
}

function orthodoxFeasts(year: number): LitEvent[] {
  const p = orthodoxEaster(year);
  return [
    feast(addDays(p, -7), "Entry into Jerusalem (Palm Sunday)"),
    feast(p, "Pascha — The Resurrection of Christ"),
    feast(addDays(p, 39), "The Ascension"),
    feast(addDays(p, 49), "Pentecost"),
    feast(utc(year, 1, 6), "Theophany (Baptism of Christ)"),
    feast(utc(year, 2, 2), "The Meeting of the Lord"),
    feast(utc(year, 3, 25), "The Annunciation"),
    feast(utc(year, 8, 6), "The Transfiguration"),
    feast(utc(year, 8, 15), "The Dormition of the Theotokos"),
    feast(utc(year, 9, 8), "The Nativity of the Theotokos"),
    feast(utc(year, 9, 14), "The Exaltation of the Cross"),
    feast(utc(year, 11, 21), "The Entrance of the Theotokos"),
    feast(utc(year, 12, 25), "The Nativity of Christ"),
  ];
}

function orthodoxFasts(year: number): LitEvent[] {
  const p = orthodoxEaster(year);
  const allSaints = addDays(p, 56);
  const out: LitEvent[] = [
    fast(addDays(p, -48), addDays(p, -1), "Great Lent"),
    fast(utc(year, 8, 1), utc(year, 8, 14), "Dormition Fast"),
    fast(utc(year, 11, 15), utc(year, 12, 24), "Nativity Fast"),
  ];
  // Apostles' Fast: Monday after All Saints to the eve of Ss Peter & Paul (Jun 29). Can be 0-length.
  const apStart = addDays(allSaints, 1), apEnd = utc(year, 6, 28);
  if (dayNum(apStart) <= dayNum(apEnd)) out.push(fast(apStart, apEnd, "Apostles' Fast"));
  return out;
}

function westernFeasts(year: number): LitEvent[] {
  const e = westernEaster(year);
  return [
    feast(utc(year, 1, 6), "Epiphany"),
    feast(addDays(e, -46), "Ash Wednesday"),
    feast(addDays(e, -7), "Palm Sunday"),
    feast(addDays(e, -3), "Maundy Thursday"),
    feast(addDays(e, -2), "Good Friday"),
    feast(e, "Easter Sunday"),
    feast(addDays(e, 39), "The Ascension"),
    feast(addDays(e, 49), "Pentecost"),
    feast(utc(year, 3, 25), "The Annunciation"),
    feast(utc(year, 11, 1), "All Saints"),
    feast(utc(year, 12, 25), "Christmas"),
  ];
}

function westernFasts(year: number): LitEvent[] {
  const e = westernEaster(year);
  return [
    fast(addDays(e, -46), addDays(e, -1), "Lent"),
    fast(adventStart(year), utc(year, 12, 24), "Advent"),
  ];
}

/** All feasts + fast periods for a calendar year, for the tradition. Pure + deterministic. */
export function yearEvents(year: number, trad: Tradition): LitEvent[] {
  const evs = trad === "orthodox"
    ? [...orthodoxFeasts(year), ...orthodoxFasts(year)]
    : [...westernFeasts(year), ...westernFasts(year)];
  return evs.sort((a, b) => a.start.localeCompare(b.start));
}

/** Events occurring on a given day (a feast that day, and/or any fast period covering it). */
export function dayEvents(date: Date, trad: Tradition): LitEvent[] {
  const key = iso(date);
  return yearEvents(date.getUTCFullYear(), trad).filter((e) => key >= e.start && key <= e.end);
}

/** Next `count` feasts/fast-starts on or after `from` (spans into next year so December still looks ahead). */
export function upcoming(from: Date, trad: Tradition, count = 10): LitEvent[] {
  const y = from.getUTCFullYear();
  const key = iso(from);
  const pool = [...yearEvents(y, trad), ...yearEvents(y + 1, trad)];
  return pool.filter((e) => e.start >= key).sort((a, b) => a.start.localeCompare(b.start)).slice(0, count);
}

/** True if the day falls in a fast period, or (Orthodox) is a weekly Wed/Fri outside fast-free weeks. */
export function isFastDay(date: Date, trad: Tradition): boolean {
  if (dayEvents(date, trad).some((e) => e.kind === "fast")) return true;
  if (trad !== "orthodox") return false;
  const wd = date.getUTCDay();
  if (wd !== 3 && wd !== 5) return false; // Wed / Fri
  // fast-free: Pascha week, Bright Week, and the week after Pentecost
  const p = orthodoxEaster(date.getUTCFullYear());
  const k = dayNum(date);
  const brightEnd = dayNum(addDays(p, 7));
  if (k >= dayNum(p) && k <= brightEnd) return false;
  const afterPentecost = dayNum(addDays(p, 49));
  if (k > afterPentecost && k <= dayNum(addDays(p, 56))) return false;
  return true;
}
