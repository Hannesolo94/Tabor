// Local (on-device) reminders for the next feasts + fast starts. Works in Expo Go (no
// remote push / dev build needed). Rolling schedule: refreshed on each app open.
import * as Notifications from "expo-notifications";
import { traditionOf, type Tradition } from "./disciplines";
import { upcoming } from "./calendar";
import { supabase } from "./supabase";

const KIND = "liturgical";

export async function cancelLiturgicalReminders(): Promise<void> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all.filter((n) => (n.content.data as { kind?: string })?.kind === KIND)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch { /* notifications optional */ }
}

/** Schedule (or clear) reminders for the next feasts/fast-starts, the evening before at 6pm. */
export async function syncLiturgicalReminders(enabled: boolean, trad: Tradition): Promise<void> {
  try {
    await cancelLiturgicalReminders();
    if (!enabled) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return; // permission is requested by registerForPush, not here
    for (const e of upcoming(new Date(), trad, 8)) {
      const eve = new Date(e.start + "T00:00:00"); // local midnight of the event day
      eve.setDate(eve.getDate() - 1);
      eve.setHours(18, 0, 0, 0); // the evening before
      if (eve.getTime() <= Date.now() + 60_000) continue; // skip past / too-soon
      const isFast = e.kind === "fast";
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isFast ? `${e.name} begins tomorrow` : `Tomorrow: ${e.name}`,
          body: isFast ? "Prepare your heart and your table. The fast begins." : "A feast of the Church. Prepare to celebrate.",
          data: { kind: KIND },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: eve },
      });
    }
  } catch { /* notifications optional */ }
}

/** Load the user's preference + tradition and refresh the rolling schedule. Safe to call on every app open. */
export async function refreshLiturgicalReminders(userId: string): Promise<void> {
  try {
    const { data } = await supabase.from("profiles").select("notif_prefs, denomination").eq("user_id", userId).maybeSingle();
    const enabled = ((data?.notif_prefs as { push?: { feasts?: boolean } })?.push?.feasts) ?? true;
    await syncLiturgicalReminders(enabled, traditionOf(data?.denomination ?? null));
  } catch { /* notifications optional */ }
}
