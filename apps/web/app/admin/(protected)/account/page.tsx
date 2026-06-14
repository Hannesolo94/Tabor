// Your account: every staff member (admin or moderator) can change their own password.
import { supabaseServer } from "@/lib/supabase/server";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Account() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ YOUR ACCOUNT ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Account</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>Signed in as <strong style={{ color: "#E8E2D5" }}>{user?.email}</strong>. If you joined with a temporary password, set your own here.</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
