// In-app bug / feature reports -> bug_reports table (the ticket queue).
import { Platform } from "react-native";
import Constants from "expo-constants";
import { decodeBase64 } from "tweetnacl-util";
import { supabase } from "./supabase";

export interface NewReport { kind: "bug" | "feature"; title: string; body: string; shots: { base64: string; ext: string }[] }

async function uploadShot(userId: string, base64: string, ext: string): Promise<string | null> {
  const bytes = decodeBase64(base64);
  const path = `${userId}/${Date.now()}-${Math.round(bytes.length % 99999)}.${ext}`;
  const { error } = await supabase.storage.from("reports").upload(path, bytes, { contentType: ext === "png" ? "image/png" : "image/jpeg" });
  return error ? null : path;
}

export async function submitReport(userId: string, r: NewReport): Promise<{ error?: string }> {
  const paths: string[] = [];
  for (const s of r.shots.slice(0, 4)) {
    const p = await uploadShot(userId, s.base64, s.ext);
    if (p) paths.push(p);
  }
  const device = `${Platform.OS} ${Platform.Version}`;
  const appVersion = Constants.expoConfig?.version ?? "dev";
  const { error } = await supabase.from("bug_reports").insert({
    user_id: userId, kind: r.kind, title: r.title.trim(), body: r.body.trim(),
    screenshots: paths, device, app_version: appVersion,
  });
  return { error: error?.message };
}
