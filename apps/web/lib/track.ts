"use client";

// Client-side analytics helper. Maintains a persistent visitor id and a 30-min
// rolling session id in localStorage, and sends events to /api/track via the
// keepalive fetch / sendBeacon so they survive navigation.

const VKEY = "tabor_vid";
const SKEY = "tabor_sid";
const SESSION_MS = 30 * 60 * 1000;

function rid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ids(): { visitor_id: string; session_id: string } {
  let visitor_id = "";
  try {
    visitor_id = localStorage.getItem(VKEY) || "";
    if (!visitor_id) {
      visitor_id = rid();
      localStorage.setItem(VKEY, visitor_id);
    }
    const now = Date.now();
    const raw = localStorage.getItem(SKEY);
    let session = raw ? (JSON.parse(raw) as { id: string; t: number }) : null;
    if (!session || now - session.t > SESSION_MS) session = { id: rid(), t: now };
    else session = { id: session.id, t: now };
    localStorage.setItem(SKEY, JSON.stringify(session));
    return { visitor_id, session_id: session.id };
  } catch {
    return { visitor_id: visitor_id || "anon", session_id: "anon" };
  }
}

export function track(type: string, data: { path?: string; sku?: string; value?: number; meta?: object } = {}) {
  try {
    const body = JSON.stringify({
      type,
      path: data.path ?? (typeof location !== "undefined" ? location.pathname : ""),
      referrer: typeof document !== "undefined" ? document.referrer : "",
      sku: data.sku,
      value: data.value,
      meta: data.meta,
      ...ids(),
    });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {
    /* analytics must never break the page */
  }
}
