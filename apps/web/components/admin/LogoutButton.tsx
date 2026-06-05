"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { MONO } from "@/lib/ui";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const sb = supabaseBrowser();
    await sb?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button onClick={logout} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: "#8A847A", background: "none", border: "1px solid rgba(201,169,97,0.25)", padding: "8px 12px", cursor: "pointer", textTransform: "uppercase", width: "100%" }}>
      Sign Out
    </button>
  );
}
