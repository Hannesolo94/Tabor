"use server";

// Product media management (admin). Uploads happen browser-direct to Supabase
// Storage; these actions record/reorder/show-hide/delete the media rows and keep
// products.image_url pointed at the first visible image (the card thumbnail).
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getStoreProduct } from "@/lib/printful";

async function syncMainImage(sku: string) {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("product_media")
    .select("url, type")
    .eq("sku", sku)
    .eq("visible", true)
    .order("sort", { ascending: true });
  const firstImage = (data ?? []).find((m) => m.type === "image")?.url ?? null;
  await sb.from("products").update({ image_url: firstImage }).eq("sku", sku);
}

/** Called from the client after a browser-direct storage upload. */
export async function addMedia(sku: string, type: "image" | "video", url: string, source = "upload") {
  const sb = await supabaseServer();
  const { data: maxRow } = await sb.from("product_media").select("sort").eq("sku", sku).order("sort", { ascending: false }).limit(1).maybeSingle();
  const sort = (maxRow?.sort ?? -1) + 1;
  await sb.from("product_media").insert({ sku, type, url, source, sort, visible: true });
  await syncMainImage(sku);
  revalidatePath(`/admin/products/${sku}`);
  revalidatePath(`/product/${sku}`);
}

async function skuOf(id: string): Promise<string | null> {
  const sb = await supabaseServer();
  const { data } = await sb.from("product_media").select("sku").eq("id", id).maybeSingle();
  return data?.sku ?? null;
}

export async function deleteMedia(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sku = await skuOf(id);
  const sb = await supabaseServer();
  await sb.from("product_media").delete().eq("id", id);
  if (sku) {
    await syncMainImage(sku);
    revalidatePath(`/admin/products/${sku}`);
    revalidatePath(`/product/${sku}`);
  }
}

export async function toggleVisible(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const visible = formData.get("visible") === "true";
  const sku = await skuOf(id);
  const sb = await supabaseServer();
  await sb.from("product_media").update({ visible: !visible }).eq("id", id);
  if (sku) {
    await syncMainImage(sku);
    revalidatePath(`/admin/products/${sku}`);
    revalidatePath(`/product/${sku}`);
  }
}

export async function moveMedia(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("dir") ?? "up");
  const sku = await skuOf(id);
  if (!sku) return;
  const sb = await supabaseServer();
  const { data: all } = await sb.from("product_media").select("id, sort").eq("sku", sku).order("sort", { ascending: true });
  if (!all) return;
  const idx = all.findIndex((m) => m.id === id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return;
  const a = all[idx]!;
  const b = all[swapIdx]!;
  await sb.from("product_media").update({ sort: b.sort }).eq("id", a.id);
  await sb.from("product_media").update({ sort: a.sort }).eq("id", b.id);
  await syncMainImage(sku);
  revalidatePath(`/admin/products/${sku}`);
  revalidatePath(`/product/${sku}`);
}

export async function makeMain(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const sku = await skuOf(id);
  if (!sku) return;
  const sb = await supabaseServer();
  const { data: minRow } = await sb.from("product_media").select("sort").eq("sku", sku).order("sort", { ascending: true }).limit(1).maybeSingle();
  const newSort = (minRow?.sort ?? 0) - 1;
  await sb.from("product_media").update({ sort: newSort, visible: true }).eq("id", id);
  await syncMainImage(sku);
  revalidatePath(`/admin/products/${sku}`);
  revalidatePath(`/product/${sku}`);
}

/** Pull all of a product's mockup images from Printful into the gallery. */
export async function pullPrintfulImages(formData: FormData) {
  const sku = String(formData.get("sku") ?? "");
  const printfulId = Number(formData.get("printful_id") ?? 0);
  if (!sku || !printfulId) return;

  let detail;
  try {
    detail = await getStoreProduct(printfulId);
  } catch {
    return;
  }

  // All unique Printful mockup images for this product.
  const urls = new Set<string>(detail.images);

  const sb = await supabaseServer();
  const { data: existing } = await sb.from("product_media").select("url").eq("sku", sku);
  const have = new Set((existing ?? []).map((m) => m.url));
  const { data: maxRow } = await sb.from("product_media").select("sort").eq("sku", sku).order("sort", { ascending: false }).limit(1).maybeSingle();
  let sort = (maxRow?.sort ?? -1) + 1;

  const rows = [...urls].filter((u) => !have.has(u)).map((u) => ({ sku, type: "image" as const, url: u, source: "printful", sort: sort++, visible: true }));
  if (rows.length) await sb.from("product_media").insert(rows);

  await syncMainImage(sku);
  revalidatePath(`/admin/products/${sku}`);
  revalidatePath(`/product/${sku}`);
}
