import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Same Supabase project as the web + admin. The anon (publishable) key is public
// by design — the web app already ships it. Override via EXPO_PUBLIC_* if needed.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://bceysfguycepothnwvmu.supabase.co";
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_eyDf56uTPgJM3Eex_dAbLQ_f6cCTCGG";

export const supabase = createClient(url, anon, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
