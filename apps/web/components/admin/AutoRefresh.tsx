"use client";

// Clean dashboard auto-refresh: soft-refetches server data on an interval via
// router.refresh() (keeps client state, no full page reload). Safe by design —
// a single interval, cleared on unmount; pauses when the tab is hidden; and skips
// a tick while you're typing in a field so it never interrupts editing.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      if (typeof document === "undefined") return;
      if (document.visibilityState !== "visible") return;          // don't poll a backgrounded tab
      const el = document.activeElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return; // don't interrupt typing
      router.refresh();
    };
    const id = setInterval(tick, Math.max(15, seconds) * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
