"use client";

// Lets the visitor switch region/currency (overrides geo). Sets the cookie and
// reloads so server-rendered prices update. The shipping address still locks the
// real price at checkout.
import { useEffect, useState } from "react";
import { GOLD, MONO } from "@/lib/ui";

function readCookie(name: string) {
  return document.cookie.split("; ").find((c) => c.startsWith(name + "="))?.split("=")[1];
}

export function RegionSwitcher() {
  const [region, setRegion] = useState<"ZA" | "INTL">("INTL");
  useEffect(() => {
    setRegion(readCookie("tabor_region") === "ZA" ? "ZA" : "INTL");
  }, []);

  function set(next: "ZA" | "INTL") {
    document.cookie = `tabor_region=${next}; path=/; max-age=${60 * 60 * 24 * 180}`;
    location.reload();
  }

  const opt = (r: "ZA" | "INTL", label: string) => (
    <button
      onClick={() => r !== region && set(r)}
      style={{ background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: region === r ? GOLD : "#6E6A60", padding: "0 2px" }}
    >
      {label}
    </button>
  );

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontFamily: MONO, fontSize: 10, color: "#4E4A44" }}>
      {opt("ZA", "ZA R")}
      <span>/</span>
      {opt("INTL", "INTL $")}
    </span>
  );
}
