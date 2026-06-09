// Editable brand content (stored in app_settings 'brand') + the brand mark as a standalone
// SVG for export. Edit the brand in /admin/branding and every download regenerates from it.
import { supabaseServer } from "@/lib/supabase/server";

export interface Swatch { name: string; hex: string; role: string }
export interface BrandFont { name: string; role: string; usage: string; google: string }
export interface BrandStatements { tagline: string; mission: string; voice: string; lines: string[]; classes: string[]; ranks: string[] }
export interface Brand { palette: Swatch[]; fonts: BrandFont[]; statements: BrandStatements }

export const DEFAULT_BRAND: Brand = {
  palette: [
    { name: "Byzantine Gold", hex: "#C9A961", role: "Primary · sacred · accents" },
    { name: "Gold Light", hex: "#E8D08C", role: "Gold gradient top" },
    { name: "Gold Deep", hex: "#A8843E", role: "Gold gradient base" },
    { name: "Aged Bronze", hex: "#8B5A2B", role: "Secondary accent" },
    { name: "Matte Black", hex: "#0A0A0A", role: "Base · backgrounds" },
    { name: "Surface", hex: "#15151A", role: "Cards · panels" },
    { name: "Parchment Ivory", hex: "#E8E2D5", role: "Primary text on dark" },
    { name: "Aged Ivory", hex: "#8A8378", role: "Muted text" },
    { name: "Martyr Crimson", hex: "#7A1F1F", role: "Crisis · alerts only" },
  ],
  fonts: [
    { name: "Pirata One", role: "Wordmark", usage: "The TABOR logotype only", google: "Pirata+One" },
    { name: "Cinzel", role: "Display / Headings", usage: "Section titles, ceremony (700)", google: "Cinzel:wght@600;700" },
    { name: "Inter", role: "Body", usage: "Paragraphs, UI copy", google: "Inter:wght@400;600;700" },
    { name: "JetBrains Mono", role: "System / Stats", usage: "HUD, stats, bracketed labels", google: "JetBrains+Mono" },
    { name: "Cormorant Garamond", role: "Scripture", usage: "Verses, liturgical quotes (italic)", google: "Cormorant+Garamond:ital@1" },
  ],
  statements: {
    tagline: "Sons of Fire.",
    mission: "A free-for-life, gamified brotherhood for Christian men who game, train, and want daily scripture and real accountability.",
    voice: "Terse, ceremonial, commanding, brotherly. Bracketed declarations: [STATUS], [QUEST COMPLETE], [RANK ATTAINED]. No emoji. No slang. No corporate cheer. No em-dashes.",
    lines: ["Sons of Fire.", "Forged not bought.", "No one climbs alone."],
    classes: ["Sentinel (guardian)", "Scribe (student)", "Crusader (fighter)", "Pilgrim (seeker)"],
    ranks: ["Recruit", "Initiate", "Tempered", "Forged", "Crucible", "Ascended", "Supersonic Fit"],
  },
};

export async function getBrand(): Promise<Brand> {
  const sb = await supabaseServer();
  const { data } = await sb.from("app_settings").select("value").eq("key", "brand").maybeSingle();
  const v = data?.value as Partial<Brand> | undefined;
  if (!v) return DEFAULT_BRAND;
  return {
    palette: Array.isArray(v.palette) && v.palette.length ? v.palette : DEFAULT_BRAND.palette,
    fonts: Array.isArray(v.fonts) && v.fonts.length ? v.fonts : DEFAULT_BRAND.fonts,
    statements: { ...DEFAULT_BRAND.statements, ...(v.statements ?? {}) },
  };
}

/** The TABOR seal as a standalone, font-free SVG (gold mark on transparent) — exportable as-is. */
export const SEAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="ts-au" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F6EAC2"/><stop offset="30%" stop-color="#DCC07A"/><stop offset="48%" stop-color="#BE9A45"/><stop offset="50%" stop-color="#8E6A24"/><stop offset="53%" stop-color="#B08A37"/><stop offset="72%" stop-color="#E8D08C"/><stop offset="100%" stop-color="#9C7A30"/>
    </linearGradient>
    <radialGradient id="ts-seal" cx="42%" cy="36%" r="66%">
      <stop offset="0%" stop-color="#F6EAC2"/><stop offset="58%" stop-color="#C9A961"/><stop offset="100%" stop-color="#7E5A1E"/>
    </radialGradient>
  </defs>
  <circle cx="120" cy="120" r="116" fill="none" stroke="url(#ts-au)" stroke-width="2" opacity="0.85"/>
  <circle cx="120" cy="120" r="108" fill="none" stroke="#9AA3AF" stroke-width="0.8" opacity="0.3"/>
  <circle cx="120" cy="120" r="100" fill="none" stroke="url(#ts-au)" stroke-width="1.2" opacity="0.6"/>
  <g stroke="url(#ts-au)" stroke-width="3.4" stroke-linecap="round"><path d="M120,44 L120,72 M108,56 L132,56 M112,50 L128,50"/></g>
  <circle cx="104" cy="92" r="2.6" fill="#F6EAC2"/><circle cx="120" cy="84" r="3.2" fill="#F6EAC2"/><circle cx="136" cy="92" r="2.6" fill="#F6EAC2"/>
  <path d="M70,176 L104,116 L120,140 L140,108 L172,176 Z" fill="url(#ts-seal)" stroke="#3A2A0A" stroke-width="1"/>
  <path d="M104,116 L114,132 L107,140 L98,128 Z" fill="#FBF1CF" opacity="0.7"/>
  <path d="M140,108 L152,128 L145,136 L134,120 Z" fill="#FBF1CF" opacity="0.7"/>
  <line x1="70" y1="176" x2="172" y2="176" stroke="url(#ts-au)" stroke-width="2"/>
</svg>`;

/** Seal on the matte-black coin background (badge variant). */
export const SEAL_SVG_DARK = SEAL_SVG.replace('height="240">', 'height="240">\n  <circle cx="120" cy="120" r="120" fill="#0A0A0A"/>');
