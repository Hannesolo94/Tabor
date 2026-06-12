import { useEffect, useState } from "react";
import { AppState } from "react-native";
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

  // Every profile column except `email` (which is column-revoked from the client for
  // privacy). The user's own email comes from the auth session, not this table.
  const COLS = "user_id, name, avatar_url, believer, cls, denomination, journey, fitness_level, equipment, goals, xp, stats, streak, best_streak, freezes, last_active, ai_opt_in, notif_prefs, settings, onboarded, role, created_at, updated_at, faith, char_class, handle, banned, public_key, days_per_week, dob, tos_accepted_at, consent, silenced_until, baseline_reps, limitations, baseline, difficulty, disciplines, bio, last_read, recent_emojis";

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("profiles").select(COLS).eq("user_id", user.id).maybeSingle();
    setProfile(data ? ({ ...(data as Record<string, unknown>), email: user.email ?? null } as Profile) : { user_id: user.id, name: null, email: user.email ?? null, streak: 0, xp: 0, role: null });
    setLoading(false);
  }

  useEffect(() => {
    load();
    // re-fetch when the app returns to the foreground so the XP/streak shown (e.g. the
    // persistent rank bar) reflects progress made elsewhere and survives a day rollover.
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") load(); });
    return () => sub.remove();
    /* eslint-disable-next-line */
  }, []);

  return { profile, loading, refresh: load };
}
