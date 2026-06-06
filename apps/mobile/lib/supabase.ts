// Supabase client for the Expo app. Same project as web + admin. Session is
// persisted with AsyncStorage. (Scaffold bone — install deps via `npx expo install`.)
//
// import { createClient } from "@supabase/supabase-js";
// import AsyncStorage from "@react-native-async-storage/async-storage";
//
// export const supabase = createClient(
//   process.env.EXPO_PUBLIC_SUPABASE_URL!,
//   process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
//   {
//     auth: {
//       storage: AsyncStorage,
//       autoRefreshToken: true,
//       persistSession: true,
//       detectSessionInUrl: false,
//     },
//   },
// );
//
// Game logic is shared — never reimplement it:
//   import { completeQuest, reconcile, deriveRank } from "@tabor/shared";
//
// The app reads/writes the SAME tables the web admin manages (profiles, quests,
// day_history, guilds, messages, ...), all protected by the existing RLS.

export {};
