// The living Brand Kit. Edit the brand as it evolves; every download regenerates from here.
import { getBrand, SEAL_SVG, SEAL_SVG_DARK } from "@/lib/brand";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BrandStudio } from "./BrandStudio";
import { LogoManager } from "./LogoManager";
import { DesignFiles, type DesignFile } from "./DesignFiles";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const brand = await getBrand();
  const admin = supabaseAdmin();
  const [{ data: files }, { data: products }] = await Promise.all([
    admin.from("design_files").select("*").order("created_at", { ascending: false }),
    (await supabaseServer()).from("products").select("sku, name").order("name"),
  ]);
  const withUrls: DesignFile[] = await Promise.all(
    (files ?? []).map(async (f) => {
      const { data } = await admin.storage.from("design-files").createSignedUrl(f.path, 3600);
      return { ...f, url: data?.signedUrl ?? null };
    }),
  );

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ IDENTITY ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Branding</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>The living brand kit. Edit it as the brand evolves; every download regenerates from what is here.</p>
      </div>
      <LogoManager logos={brand.logos} />
      <BrandStudio brand={brand} sealSvg={SEAL_SVG} sealDark={SEAL_SVG_DARK} />
      <DesignFiles files={withUrls} products={products ?? []} />
    </div>
  );
}
