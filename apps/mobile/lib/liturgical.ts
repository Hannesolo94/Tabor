// Liturgical calendar — Western (Gregorian) + Orthodox (Julian Pascha), so fasting
// and seasonal quests land on the right day for each tradition. Pure functions.
import type { Tradition } from "./disciplines";

const DAY = 86_400_000;
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);
const onlyDate = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const between = (d: Date, a: Date, b: Date) => onlyDate(d) >= onlyDate(a) && onlyDate(d) <= onlyDate(b);

/** Western (Gregorian) Easter — Anonymous Gregorian computus. */
export function westernEaster(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
}

/** Orthodox Pascha — Meeus Julian computus, converted to the Gregorian calendar. */
export function orthodoxEaster(year: number): Date {
  const a = year % 4, b = year % 7, c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  // Julian date -> Gregorian: +13 days for 1900-2099
  return addDays(utc(year, month, day), 13);
}

export interface LiturgicalContext { season: string; fasting: boolean; note: string | null }

/** Season + fasting state for a date, by tradition. Covers the major fasts.
 *  `old` = Orthodox Old Calendar (Julian): fixed-date fasts shift +13 days. */
export function liturgicalContext(date: Date, trad: Tradition, old = false): LiturgicalContext {
  const y = date.getUTCFullYear();
  if (trad === "orthodox") {
    const pascha = orthodoxEaster(y);
    const greatLentStart = addDays(pascha, -48); // Clean Monday
    const holySat = addDays(pascha, -1);
    const pentecost = addDays(pascha, 49);
    const fx = (yy: number, m: number, d: number) => (old ? addDays(utc(yy, m, d), 13) : utc(yy, m, d));
    // a fixed-date fast, checked across the year boundary (Old Calendar Nativity Fast spills into January)
    const inFixed = (m1: number, d1: number, m2: number, d2: number) =>
      between(date, fx(y, m1, d1), fx(y, m2, d2)) || (old && between(date, fx(y - 1, m1, d1), fx(y - 1, m2, d2)));
    if (between(date, greatLentStart, holySat)) return { season: "Great Lent", fasting: true, note: "Great Lent: keep today's fast" };
    if (inFixed(11, 15, 12, 24)) return { season: "Nativity Fast", fasting: true, note: "Nativity Fast: keep today's fast" };
    if (inFixed(8, 1, 8, 14)) return { season: "Dormition Fast", fasting: true, note: "Dormition Fast: keep today's fast" };
    // Apostles' Fast: Monday after All Saints (Pascha+57) to the eve of Ss Peter & Paul. Can be 0-length.
    const apStart = addDays(pascha, 57), apEnd = fx(y, 6, 28);
    if (apStart.getTime() <= apEnd.getTime() && between(date, apStart, apEnd)) return { season: "Apostles' Fast", fasting: true, note: "Apostles' Fast: keep today's fast" };
    if (between(date, pascha, pentecost)) return { season: "Pascha", fasting: false, note: null }; // fast-free / feasting
    return { season: "Ordinary", fasting: false, note: null };
  }
  // Western (Catholic / Anglican / Protestant who observe)
  const easter = westernEaster(y);
  const ashWed = addDays(easter, -46);
  const holySatW = addDays(easter, -1);
  const pentecostW = addDays(easter, 49);
  if (between(date, ashWed, holySatW)) return { season: "Lent", fasting: true, note: "Lent: keep today's fast or penance" };
  // Advent: from the 4th Sunday before Dec 25 through Dec 24
  const christmas = utc(y, 12, 25);
  const adventStart = addDays(christmas, -(((christmas.getUTCDay() + 7) % 7) + 21));
  if (between(date, adventStart, utc(y, 12, 24))) return { season: "Advent", fasting: false, note: "Advent: a season of preparation. Fast lightly if you keep it" };
  if (between(date, easter, pentecostW)) return { season: "Eastertide", fasting: false, note: null };
  return { season: "Ordinary Time", fasting: false, note: null };
}
