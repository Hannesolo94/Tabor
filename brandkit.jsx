// brandkit.jsx — TABOR downloadable brand kit (logos SVG/PNG + fonts)
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Pirata+One&family=Cinzel:wght@500;600;700&display=swap";

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function serializeSVG(svgEl) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  // embed font import so the SVG renders blackletter when opened in a browser
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `@import url('${FONT_CSS}');`;
  clone.insertBefore(style, clone.firstChild);
  return new XMLSerializer().serializeToString(clone);
}

function downloadSVG(svgId, name) {
  const el = document.getElementById(svgId);
  if (!el) return;
  downloadBlob(new Blob([serializeSVG(el)], { type: "image/svg+xml" }), name);
}

async function downloadPNG(svgId, size, name) {
  const el = document.getElementById(svgId);
  if (!el) return;
  const vb = el.viewBox.baseVal;
  const ratio = vb.height / vb.width;
  const clone = el.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", vb.width);
  clone.setAttribute("height", vb.height);
  const data = new XMLSerializer().serializeToString(clone);
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = Math.round(size * ratio);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(b => downloadBlob(b, name), "image/png");
}

function Btn({ onClick, children, primary }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
      padding: "8px 12px", cursor: "pointer", color: primary ? "#0A0A0A" : "var(--holy-gold)",
      background: primary ? "var(--holy-gold)" : "transparent",
      border: "1px solid rgba(201,169,97,0.5)", borderRadius: 2,
    }}>{children}</button>
  );
}

Object.assign(window, { downloadBlob, downloadSVG, downloadPNG, Btn, FONT_CSS });
