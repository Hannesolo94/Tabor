// printful-products — pulls the Printful catalog and caches it into public.products.
// Server-side only (holds PRINTFUL_API_KEY). Call on a schedule or from /admin.

import { corsHeaders, json } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const key = Deno.env.get("PRINTFUL_API_KEY");
  if (!key) return json({ error: "PRINTFUL_API_KEY not set" }, 500);

  try {
    const res = await fetch("https://api.printful.com/store/products", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`printful ${res.status}`);
    const { result } = await res.json();

    const supabase = serviceClient();
    const rows = (result ?? []).map((p: Record<string, unknown>, i: number) => ({
      sku: String(p.external_id ?? p.id),
      printful_id: String(p.id),
      name: String(p.name ?? ""),
      image_url: (p.thumbnail_url as string) ?? null,
      status: "draft", // promote to 'live' from /admin after review + pricing
      sort: i,
    }));

    if (rows.length) {
      const { error } = await supabase.from("products").upsert(rows, { onConflict: "sku" });
      if (error) throw error;
    }
    return json({ synced: rows.length });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
});
