// Date helpers. Ported from proto-state.jsx (dstr / todayStr / addDays).
// All dates are ISO "YYYY-MM-DD" strings.
//
// NOTE: the prototype parsed dates in LOCAL time ("T00:00:00") while formatting
// in UTC (toISOString), so in any timezone east/west of UTC the day could shift
// and break streak math. We normalize the whole engine to UTC here so streaks
// are deterministic regardless of device timezone. The day boundary is UTC
// midnight; revisit if product wants a local-midnight (or per-user-tz) rollover.

/** Format a Date as a "YYYY-MM-DD" string (UTC). */
export function dstr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Today as a "YYYY-MM-DD" string (UTC). */
export function todayStr(): string {
  return dstr(new Date());
}

/** Add n days (may be negative) to a "YYYY-MM-DD" string, returning a new one. */
export function addDays(s: string, n: number): string {
  const d = new Date(s + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return dstr(d);
}
