"use client";

// Currency picker. Replaces the old two-way ZA/INTL toggle, which stopped making
// sense once the store priced in every currency it can actually charge in: a
// visitor in Germany is shown EUR by geo, and "ZA R / INTL $" offered them
// neither. It also wrote the retired `tabor_region` cookie, so it had quietly
// stopped doing anything at all.
//
// Sets the same cookie middleware sets from geo, then reloads so the
// server-rendered prices come back in the chosen currency. The shipping address
// still locks the real price at checkout, so this is display only and cannot be
// used to claim a cheaper market's pricing.
import { GOLD, MONO } from "@/lib/ui";

const COOKIE = "tabor_currency";
const MAX_AGE = 60 * 60 * 24 * 30;

export function CurrencySwitcher({ currencies, current }: {
  currencies: { code: string; symbol: string }[];
  current: string;
}) {
  if (!currencies.length) return null;

  function set(next: string) {
    if (next === current) return;
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${MAX_AGE}`;
    location.reload();
  }

  return (
    <label style={{ display: "inline-flex", alignItems: "center" }}>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Currency</span>
      <select
        value={current}
        onChange={(e) => set(e.target.value)}
        style={{
          appearance: "none",
          background: "transparent",
          border: `1px solid ${GOLD}26`,
          borderRadius: 8,
          color: GOLD,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.08em",
          padding: "5px 8px",
          cursor: "pointer",
          colorScheme: "dark", // keeps the native dropdown dark instead of white-on-white
        }}
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol.trim()} {c.code}
          </option>
        ))}
      </select>
    </label>
  );
}
