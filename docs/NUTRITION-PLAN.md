# TABOR — Barcode Nutrition (food scanning) build plan

Adds a MyFitnessPal-style food diary with barcode scanning to the Body pillar, free.
This is the feature that lets a free app rival the paid giants.

## Data source: Open Food Facts (primary)
- Free, open, ~3M+ products with barcodes + nutrition. License **ODbL** — commercial OK,
  but requires **attribution** ("Product data from Open Food Facts, licensed under ODbL")
  and **share-alike only if we redistribute a derived database** (we don't — we display
  + cache, and keep user-created foods in a SEPARATE table to stay clean).
- Endpoint: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json?fields=product_name,brands,serving_size,nutriments,image_front_small_url`
- **Must** send a custom User-Agent: `TABOR/1.0 (support@tabor.quest)`. Rate limit ~15 req/min/IP (per-user, fine).
- Gaps (esp. South Africa) handled by: (1) our own cache, (2) live OFF lookup, (3) user "Add product" flow. USDA FoodData Central (free, public domain) covers generic/whole foods by name.
- Fallback option: FatSecret "Premier Free" (if we qualify) for deeper US branded coverage.

## Scanning: expo-camera (SDK 54)
- Use `CameraView` + `barcodeScannerSettings={{ barcodeTypes: ['ean13','ean8','upc_a','upc_e'] }}`. (`expo-barcode-scanner` is removed in SDK 51+.)
- Normalize UPC-A (12) to 13 digits. Debounce/lock after first scan. Works in Expo Go.

## Schema (new migration) — two food tables on purpose
- `foods_off_cache` (ODbL-derived, regenerable): barcode PK, name, brand, serving, per-100g kcal/protein/carb/fat/sugar/fiber/salt, micros jsonb, image_url.
- `foods_custom` (TABOR-owned, NOT ODbL-entangled): user-added foods.
- `food_log`: user_id, log_date, meal, source_kind, ref, qty_g, + denormalized snapshot (name/kcal/macros) so history is immutable.
- `nutrition_goals`: kcal/protein/carb/fat targets + inputs (weight/height/age/sex/activity).
- RLS: food_log/nutrition_goals/foods_custom own-rows; cache read-all, writes via Edge Function (User-Agent + rate limit server-side). `on delete cascade` so account-delete wipes the diary.

## Goal math (Mifflin-St Jeor)
- BMR (men) = 10*kg + 6.25*cm - 5*age + 5; TDEE = BMR * activity (1.2-1.725).
- fat_loss = TDEE*0.80, maintain = TDEE, muscle = TDEE*1.10.
- protein 1.8-2.0 g/kg; fat 25% kcal; carbs = remainder. Onboarding captures weight/height/age/sex/activity.

## UX (ties into the quest loop)
- Diary by date: kcal ring + P/C/F bars vs target; 4 meal sections; big [SCAN] button.
- Scan -> product card -> pick qty + meal -> [LOG] -> totals animate. Logging a day feeds the Fitness Guild streak/XP.
- "Add product" when OFF misses (optionally contribute back to OFF). ODbL attribution on the product card + About.

## Legal note
Nutrition + body metrics are **GDPR special-category health data (Art. 9)** -> needs a
**separate explicit consent toggle** (distinct from general T&Cs), data minimization, and
a "not medical advice" disclaimer for store review. Our instant account-delete already
cascades the diary.

## Build order
1. Migration (tables + RLS). 2. `resolve-barcode` Edge Function (cache -> OFF live -> upsert).
3. Scan screen (expo-camera). 4. Product card -> log. 5. Diary screen + totals.
6. Onboarding nutrition inputs -> nutrition_goals. 7. Add-product fallback + attribution.
8. Explicit health-data consent + tie logged days into quests.
