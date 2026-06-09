// Calorie tracker. Open Food Facts is the primary barcode source (ODbL — attribution
// shown in the Fuel tab). We cache every hit so coverage compounds over time.
import { supabase } from "./supabase";

const OFF_UA = "TABOR/1.0 (support@tabor.quest)";

export interface Food {
  source: "off" | "custom";
  barcode?: string; id?: string;
  name: string; brand?: string | null;
  kcal_100g: number; protein_100g?: number | null; carb_100g?: number | null; fat_100g?: number | null;
  serving_size_g?: number | null; serving_label?: string | null; image_url?: string | null;
}
export interface LogRow { id: string; meal: string; name: string; qty_g: number; kcal: number; protein: number | null; carb: number | null; fat: number | null }
export interface Goals { kcal_target: number; protein_target: number; carb_target: number; fat_target: number; goal_type: string }

export function normalizeBarcode(code: string): string {
  const d = code.replace(/\D/g, "");
  return d.length === 12 ? "0" + d : d; // UPC-A -> EAN-13
}

/** barcode -> Food. cache -> Open Food Facts live (then cache) -> custom -> null. */
export async function resolveBarcode(raw: string): Promise<Food | null> {
  const code = normalizeBarcode(raw);
  const { data: cached } = await supabase.from("foods_off_cache").select("*").eq("barcode", code).maybeSingle();
  if (cached) return { source: "off", ...cached };

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,serving_size,serving_quantity,nutriments,image_front_small_url`, { headers: { "User-Agent": OFF_UA } });
    const data = await res.json();
    if (data?.status === 1 && data.product) {
      const p = data.product, n = p.nutriments ?? {};
      const row = {
        barcode: code,
        name: p.product_name || "Unknown product",
        brand: p.brands || null,
        serving_size_g: typeof p.serving_quantity === "number" ? p.serving_quantity : Number(p.serving_quantity) || null,
        serving_label: p.serving_size || null,
        kcal_100g: Number(n["energy-kcal_100g"]) || 0,
        protein_100g: Number(n["proteins_100g"]) || null,
        carb_100g: Number(n["carbohydrates_100g"]) || null,
        fat_100g: Number(n["fat_100g"]) || null,
        sugar_100g: Number(n["sugars_100g"]) || null,
        fiber_100g: Number(n["fiber_100g"]) || null,
        salt_100g: Number(n["salt_100g"]) || null,
        image_url: p.image_front_small_url || null,
      };
      supabase.from("foods_off_cache").upsert(row).then(() => {}, () => {}); // fire-and-forget cache
      return { source: "off", ...row };
    }
  } catch { /* offline / OFF down */ }

  const { data: custom } = await supabase.from("foods_custom").select("*").eq("barcode", code).limit(1).maybeSingle();
  if (custom) return { source: "custom", ...custom };
  return null;
}

interface OffProduct { code?: string; product_name?: string; brands?: string; serving_size?: string; serving_quantity?: number | string; image_front_small_url?: string; nutriments?: Record<string, number | string | undefined> }

/** Search by name: instant local hits (custom + cached) PLUS a live Open Food Facts search,
 *  merged + deduped. Remote hits are cached so coverage compounds and works offline next time. */
export async function searchFoods(q: string): Promise<Food[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const [off, custom] = await Promise.all([
    supabase.from("foods_off_cache").select("*").ilike("name", `%${term}%`).limit(15),
    supabase.from("foods_custom").select("*").ilike("name", `%${term}%`).limit(15),
  ]);
  const local: Food[] = [
    ...(custom.data ?? []).map((c) => ({ source: "custom" as const, ...c })),
    ...(off.data ?? []).map((o) => ({ source: "off" as const, ...o })),
  ];

  let remote: Food[] = [];
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(term)}&search_simple=1&action=process&json=1&page_size=20&lc=en&fields=code,product_name,brands,serving_size,serving_quantity,nutriments,image_front_small_url`;
    const res = await fetch(url, { headers: { "User-Agent": OFF_UA }, signal: ctrl.signal });
    clearTimeout(t);
    const data = (await res.json()) as { products?: OffProduct[] };
    remote = (data.products ?? [])
      .filter((p) => p.product_name && p.code && Number(p.nutriments?.["energy-kcal_100g"]) > 0)
      .map((p) => {
        const n = p.nutriments ?? {};
        return {
          source: "off" as const,
          barcode: normalizeBarcode(String(p.code)),
          name: String(p.product_name),
          brand: p.brands || null,
          kcal_100g: Number(n["energy-kcal_100g"]) || 0,
          protein_100g: Number(n["proteins_100g"]) || null,
          carb_100g: Number(n["carbohydrates_100g"]) || null,
          fat_100g: Number(n["fat_100g"]) || null,
          serving_size_g: typeof p.serving_quantity === "number" ? p.serving_quantity : Number(p.serving_quantity) || null,
          serving_label: p.serving_size || null,
          image_url: p.image_front_small_url || null,
        } as Food;
      });
    if (remote.length) {
      const rows = remote.map(({ source, ...r }) => r); // eslint-disable-line @typescript-eslint/no-unused-vars
      supabase.from("foods_off_cache").upsert(rows, { onConflict: "barcode" }).then(() => {}, () => {});
    }
  } catch { /* offline / OFF slow — fall back to local only */ }

  const seen = new Set<string>();
  const out: Food[] = [];
  for (const f of [...local, ...remote]) {
    const key = (f.barcode || f.name).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out.slice(0, 30);
}

export async function addCustomFood(userId: string, f: { name: string; brand?: string; kcal_100g: number; protein_100g?: number; carb_100g?: number; fat_100g?: number; barcode?: string }) {
  const { data } = await supabase.from("foods_custom").insert({ created_by: userId, ...f }).select("*").maybeSingle();
  return data ? ({ source: "custom", ...data } as Food) : null;
}

export const FUEL_XP = 15;
/** Logs food, and the FIRST log of each day grants XP (rewards the discipline of tracking,
 *  not spammable). Returns { error } (callers check it) + the first-of-day flag. */
export async function logFood(userId: string, meal: string, food: Food, qtyG: number, date: string): Promise<{ error: { message?: string } | null; firstToday: boolean; xp: number }> {
  const f = qtyG / 100;
  const { error } = await supabase.from("food_log").insert({
    user_id: userId, log_date: date, meal, qty_g: qtyG, name: food.name,
    kcal: Math.round((food.kcal_100g || 0) * f),
    protein: food.protein_100g != null ? +(food.protein_100g * f).toFixed(1) : null,
    carb: food.carb_100g != null ? +(food.carb_100g * f).toFixed(1) : null,
    fat: food.fat_100g != null ? +(food.fat_100g * f).toFixed(1) : null,
  });
  if (error) return { error, firstToday: false, xp: 0 };
  const { count } = await supabase.from("food_log").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("log_date", date);
  const firstToday = (count ?? 0) === 1;
  if (firstToday) await supabase.rpc("apply_quest_delta", { p_xp: FUEL_XP, p_stat: "STR", p_stat_delta: 1 });
  return { error: null, firstToday, xp: FUEL_XP };
}

export async function getDiary(userId: string, date: string): Promise<LogRow[]> {
  const { data } = await supabase.from("food_log").select("id, meal, name, qty_g, kcal, protein, carb, fat").eq("user_id", userId).eq("log_date", date).order("created_at");
  return data ?? [];
}
export async function deleteLog(id: string) { return supabase.from("food_log").delete().eq("id", id); }

export async function getGoals(userId: string): Promise<Goals | null> {
  const { data } = await supabase.from("nutrition_goals").select("*").eq("user_id", userId).maybeSingle();
  return data as Goals | null;
}

export function computeTargets(i: { weight_kg: number; height_cm: number; age: number; sex: string; activity: number; goal_type: string }) {
  const bmr = 10 * i.weight_kg + 6.25 * i.height_cm - 5 * i.age + (i.sex === "female" ? -161 : 5);
  const tdee = bmr * i.activity;
  const kcal = Math.round(tdee * (i.goal_type === "fat_loss" ? 0.8 : i.goal_type === "muscle_gain" ? 1.1 : 1));
  const protein = Math.round((i.goal_type === "muscle_gain" ? 2.0 : 1.8) * i.weight_kg);
  const fat = Math.round((kcal * 0.25) / 9);
  const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal_target: kcal, protein_target: protein, carb_target: carb, fat_target: fat };
}

export async function saveGoals(userId: string, i: { weight_kg: number; height_cm: number; age: number; sex: string; activity: number; goal_type: string }) {
  const t = computeTargets(i);
  return supabase.from("nutrition_goals").upsert({ user_id: userId, goal_type: i.goal_type, ...t, weight_kg: i.weight_kg, height_cm: i.height_cm, age: i.age, sex: i.sex, activity: i.activity, updated_at: new Date().toISOString() });
}
