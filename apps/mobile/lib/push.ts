// Expo push notifications. Registers the device token (stored in push_tokens) so
// the server can send pushes. NOTE: remote push requires a DEV BUILD (Expo Go can
// no longer receive push as of SDK 53). Local setup is safe in Expo Go (no-ops).
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }),
});

export async function registerForPush(userId: string): Promise<void> {
  try {
    if (!Device.isDevice) return; // no push on simulators
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (status !== "granted") status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== "granted") return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", { name: "TABOR", importance: Notifications.AndroidImportance.HIGH });
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    if (token) await supabase.from("push_tokens").upsert({ token, user_id: userId, platform: Platform.OS, updated_at: new Date().toISOString() }, { onConflict: "token" });
  } catch {
    // expected in Expo Go / when no projectId yet; push activates in the dev build
  }
}
