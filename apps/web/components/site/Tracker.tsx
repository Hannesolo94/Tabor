"use client";

// Fires a pageview on every route change. Mounted once in the site layout.
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/track";

export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    track("pageview", { path: pathname });
  }, [pathname]);
  return null;
}
