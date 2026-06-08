import { AssistantChat } from "./AssistantChat";
import { supabaseServer } from "@/lib/supabase/server";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const sb = await supabaseServer();
  const { data } = await sb.from("integrations").select("secret, enabled").eq("provider", "anthropic").maybeSingle();
  const configured = !!(data?.secret && data?.enabled) || !!process.env.ANTHROPIC_API_KEY;

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ THE SYSTEM ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Assistant</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 20px" }}>Your AI analyst. It reads live store data — products, sales, traffic, stock — and answers or suggests moves.</p>

      {!configured && (
        <div style={{ border: `1px solid ${GOLD}44`, background: "linear-gradient(160deg, rgba(40,36,20,0.7), rgba(18,18,12,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "14px 18px", marginBottom: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.14em", marginBottom: 4 }}>[ SETUP NEEDED ]</div>
          <p style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", margin: 0 }}>Add your Anthropic API key in <strong>Settings → Integrations</strong> (provider <strong>anthropic</strong>) and toggle it on. The assistant works the moment a key is set.</p>
        </div>
      )}

      <AssistantChat />
    </div>
  );
}
