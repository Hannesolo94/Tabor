import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export interface Profile {
  user_id: string;
  name: string | null;
  email: string | null;
  streak: number | null;
  xp: number | null;
  role: string | null;
  [k: string]: unknown;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    setProfile((data as Profile) ?? { user_id: user.id, name: null, email: user.email ?? null, streak: 0, xp: 0, role: null });
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return { profile, loading, refresh: load };
}
