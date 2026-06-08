import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthCtx {
  session: Session | null;
  loading: boolean;
  onboarded: boolean | null; // null = unknown/not-yet-loaded
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  resendConfirmation: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  const loadOnboarded = useCallback(async (s: Session | null) => {
    if (!s) { setOnboarded(null); return; }
    const { data } = await supabase.from("profiles").select("onboarded").eq("user_id", s.user.id).maybeSingle();
    setOnboarded(!!data?.onboarded);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadOnboarded(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      loadOnboarded(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadOnboarded]);

  const refresh = useCallback(async () => { await loadOnboarded(session); }, [loadOnboarded, session]);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error?.message };
  };

  const signUp: AuthCtx["signUp"] = async (email, password, name) => {
    const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name }, emailRedirectTo: "https://tabor.quest/auth/confirmed" } });
    return { error: error?.message };
  };

  const resendConfirmation: AuthCtx["resendConfirmation"] = async (email) => {
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: "https://tabor.quest/auth/confirmed" } });
    return { error: error?.message };
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ session, loading, onboarded, refresh, signIn, signUp, resendConfirmation, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
