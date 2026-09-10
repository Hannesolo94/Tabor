"use client";

// Currency picker.
//
// A native <select> cannot be styled: the option list is drawn by the OS, so it
// arrived as white-on-grey with a blue highlight in the middle of a black gold
// storefront. This is a custom listbox instead, built to the same dark-glass and
// gold language as the cart drawer and admin cards.
//
// Sets the same cookie middleware sets from geo, then reloads so server-rendered
// prices come back in the chosen currency. Display only: the shipping address
// locks the real price at checkout, so it cannot be used to claim a cheaper
// market's pricing.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { GOLD, MONO } from "@/lib/ui";

const COOKIE = "tabor_currency";
const MAX_AGE = 60 * 60 * 24 * 30;

export function CurrencySwitcher({ currencies, current }: {
  currencies: { code: string; symbol: string }[];
  current: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, currencies.findIndex((c) => c.code === current)));
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const choose = useCallback((code: string) => {
    setOpen(false);
    if (code === current) return;
    document.cookie = `${COOKIE}=${code}; path=/; max-age=${MAX_AGE}`;
    location.reload();
  }, [current]);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  // Keep the highlighted row in view when arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  if (!currencies.length) return null;
  const currentCur = currencies.find((c) => c.code === current) ?? currencies[0];

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault(); setOpen(true); return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(currencies.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(currencies.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(currencies[active]!.code); }
  }

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Currency: ${currentCur.code}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em",
          color: GOLD, background: "transparent",
          border: `1px solid ${open ? `${GOLD}66` : `${GOLD}26`}`,
          borderRadius: 999, padding: "6px 10px", cursor: "pointer",
          transition: "border-color 140ms ease",
        }}
      >
        <span>{currentCur.symbol.trim()} {currentCur.code}</span>
        <svg width="7" height="4" viewBox="0 0 7 4" aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms ease" }}>
          <path d="M0 0h7L3.5 4z" fill={GOLD} />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listId}-${active}`}
          className="tabor-glass tabor-frost tabor-scroll"
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 60,
            listStyle: "none", margin: 0, padding: 6,
            minWidth: 132, maxHeight: 268, overflowY: "auto",
            borderRadius: 14,
          }}
        >
          {currencies.map((c, i) => {
            const selected = c.code === current;
            const highlighted = i === active;
            return (
              <li
                key={c.code}
                id={`${listId}-${i}`}
                data-i={i}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(c.code)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em",
                  color: selected ? GOLD : highlighted ? "#E8E2D5" : "#9A948A",
                  background: highlighted ? "rgba(201,169,97,0.10)" : "transparent",
                  border: `1px solid ${highlighted ? `${GOLD}2E` : "transparent"}`,
                  borderRadius: 9, padding: "7px 9px", cursor: "pointer",
                  transition: "background 120ms ease, color 120ms ease",
                }}
              >
                <span style={{ display: "inline-flex", gap: 7 }}>
                  <span style={{ width: 22, color: selected ? GOLD : "#7A746A" }}>{c.symbol.trim()}</span>
                  <span>{c.code}</span>
                </span>
                {selected && <span aria-hidden="true" style={{ color: GOLD, fontSize: 9 }}>●</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
