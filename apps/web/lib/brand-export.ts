// Client-side brand asset generators: SVG -> PNG, colour tokens (CSS/SCSS/JSON/.ase),
// and the full Brand Kit PDF. All run in the browser (used by the Branding client components).
import jsPDF from "jspdf";
import type { Brand, Swatch } from "@/lib/brand";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadText(text: string, filename: string, mime = "text/plain") {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

/** Render an SVG string to a transparent PNG Blob at the given pixel size. */
export function svgToPng(svg: string, size = 1024): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("no ctx")); return; }
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png fail"))), "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("svg load fail")); };
    img.src = url;
  });
}
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob); });
}

export function cssTokens(p: Swatch[]): string {
  return `:root {\n${p.map((s) => `  --tabor-${slug(s.name)}: ${s.hex}; /* ${s.role} */`).join("\n")}\n}\n`;
}
export function scssTokens(p: Swatch[]): string {
  return p.map((s) => `$tabor-${slug(s.name)}: ${s.hex}; // ${s.role}`).join("\n") + "\n";
}
export function jsonTokens(b: Brand): string {
  return JSON.stringify({ colors: Object.fromEntries(b.palette.map((s) => [slug(s.name), { value: s.hex, role: s.role }])), fonts: b.fonts, statements: b.statements }, null, 2);
}
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Adobe Swatch Exchange (.ase) binary for the palette — drop into Illustrator/Photoshop. */
export function aseSwatch(p: Swatch[]): Blob {
  const chunks: number[] = [];
  const u16 = (n: number) => chunks.push((n >> 8) & 255, n & 255);
  const u32 = (n: number) => chunks.push((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);
  const f32 = (n: number) => { const b = new Uint8Array(new Float32Array([n]).buffer).reverse(); chunks.push(...b); };
  const ascii = (s: string) => { for (const c of s) chunks.push(c.charCodeAt(0)); };
  ascii("ASEF"); u16(1); u16(0); u32(p.length);
  for (const s of p) {
    const name = s.name + "\0";
    const nameBytes = name.length * 2;
    const blockLen = 2 + nameBytes + 4 + 12 + 2; // nameLen + name + model + 3 floats + type
    u16(0x0001); u32(blockLen);
    u16(name.length);
    for (const ch of name) u16(ch.charCodeAt(0));
    ascii("RGB ");
    const r = parseInt(s.hex.slice(1, 3), 16) / 255, g = parseInt(s.hex.slice(3, 5), 16) / 255, bl = parseInt(s.hex.slice(5, 7), 16) / 255;
    f32(r); f32(g); f32(bl); u16(2);
  }
  return new Blob([new Uint8Array(chunks)], { type: "application/octet-stream" });
}

/** Multi-page Brand Kit PDF generated from the live brand data + the seal mark. */
export async function brandKitPdf(b: Brand, sealDarkSvg: string): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = 595, H = 842, M = 56;
  const GOLD = "#C9A961", IVORY = "#E8E2D5", MUTED = "#8A8378", BLACK = "#0A0A0A", SURF = "#15151A";
  const fill = (hex: string, x: number, y: number, w: number, h: number) => { doc.setFillColor(hex); doc.rect(x, y, w, h, "F"); };
  const bg = () => fill(BLACK, 0, 0, W, H);
  const eyebrow = (t: string, y: number) => { doc.setFont("courier", "normal"); doc.setFontSize(10); doc.setTextColor(GOLD); doc.text(t, M, y); };
  const head = (t: string, y: number) => { doc.setFont("times", "bold"); doc.setFontSize(26); doc.setTextColor(IVORY); doc.text(t, M, y); };

  // cover
  bg();
  try { const png = await svgToPng(sealDarkSvg, 600); doc.addImage(await blobToDataUrl(png), "PNG", W / 2 - 70, 150, 140, 140); } catch { /* skip mark */ }
  doc.setFont("times", "bold"); doc.setFontSize(56); doc.setTextColor(IVORY); doc.text("TABOR", W / 2, 360, { align: "center" });
  doc.setFont("courier", "normal"); doc.setFontSize(13); doc.setTextColor(GOLD); doc.text(b.statements.tagline.toUpperCase(), W / 2, 392, { align: "center" });
  doc.setTextColor(MUTED); doc.setFontSize(10); doc.text("BRAND KIT", W / 2, H - 56, { align: "center" });

  // colours
  doc.addPage(); bg(); eyebrow("[ PALETTE ]", M); head("Colours", M + 30);
  let y = M + 64;
  for (const s of b.palette) {
    fill(s.hex, M, y, 64, 40); doc.setDrawColor("#333"); doc.rect(M, y, 64, 40);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(IVORY); doc.text(s.name, M + 80, y + 16);
    doc.setFont("courier", "normal"); doc.setFontSize(10); doc.setTextColor(GOLD); doc.text(s.hex.toUpperCase(), M + 80, y + 30);
    doc.setTextColor(MUTED); doc.text(s.role, M + 200, y + 30);
    y += 50; if (y > H - 80) { doc.addPage(); bg(); y = M; }
  }

  // typography
  doc.addPage(); bg(); eyebrow("[ TYPOGRAPHY ]", M); head("Type", M + 30);
  y = M + 70;
  for (const f of b.fonts) {
    doc.setFont("times", "bold"); doc.setFontSize(22); doc.setTextColor(IVORY); doc.text(f.name, M, y);
    doc.setFont("courier", "normal"); doc.setFontSize(9); doc.setTextColor(GOLD); doc.text(f.role.toUpperCase(), M, y + 16);
    doc.setTextColor(MUTED); doc.setFontSize(10); doc.text(f.usage, M, y + 30);
    y += 60;
  }

  // voice
  doc.addPage(); bg(); eyebrow("[ VOICE ]", M); head("Voice & Statements", M + 30);
  y = M + 70;
  const para = (label: string, text: string) => {
    doc.setFont("courier", "normal"); doc.setFontSize(9); doc.setTextColor(GOLD); doc.text(label, M, y); y += 16;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(IVORY);
    for (const line of doc.splitTextToSize(text, W - M * 2)) { doc.text(line, M, y); y += 16; }
    y += 12;
  };
  para("TAGLINE", b.statements.tagline);
  para("MISSION", b.statements.mission);
  para("VOICE", b.statements.voice);
  para("LINES", b.statements.lines.join("   ·   "));
  para("CLASSES", b.statements.classes.join("   ·   "));
  para("RANKS", b.statements.ranks.join("  →  "));

  return doc.output("blob");
}
