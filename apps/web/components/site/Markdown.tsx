// Tiny, dependency-free markdown renderer for blog bodies. Escapes HTML, then
// handles headings (#, ##, ###), bullet lists, blockquotes, bold/italic, links,
// and paragraphs. Enough for written content without pulling in a library.
import React from "react";
import { GOLD, CINZEL } from "@/lib/ui";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(text: string): React.ReactNode {
  // links [text](url), **bold**, *italic* — applied on escaped text
  const html = esc(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color:${GOLD};text-decoration:underline">$1</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Markdown({ body }: { body: string }) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul${blocks.length}`} style={{ margin: "0 0 18px", paddingLeft: 22, color: "#C3BDB1", fontSize: 16, lineHeight: 1.75 }}>
          {list.map((li, i) => <li key={i} style={{ marginBottom: 6 }}>{inline(li)}</li>)}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); continue; }
    if (/^###\s+/.test(line)) { flush(); blocks.push(<h3 key={blocks.length} style={{ fontFamily: CINZEL, color: "#E8E2D5", fontSize: 19, margin: "22px 0 8px" }}>{inline(line.replace(/^###\s+/, ""))}</h3>); }
    else if (/^##\s+/.test(line)) { flush(); blocks.push(<h2 key={blocks.length} style={{ fontFamily: CINZEL, fontWeight: 700, color: "#E8E2D5", fontSize: 24, margin: "28px 0 10px" }}>{inline(line.replace(/^##\s+/, ""))}</h2>); }
    else if (/^#\s+/.test(line)) { flush(); blocks.push(<h2 key={blocks.length} style={{ fontFamily: CINZEL, fontWeight: 700, color: "#E8E2D5", fontSize: 26, margin: "28px 0 10px" }}>{inline(line.replace(/^#\s+/, ""))}</h2>); }
    else if (/^>\s+/.test(line)) { flush(); blocks.push(<blockquote key={blocks.length} style={{ borderLeft: `3px solid ${GOLD}`, margin: "0 0 18px", padding: "4px 0 4px 16px", color: "#E8E2D5", fontStyle: "italic", fontSize: 17 }}>{inline(line.replace(/^>\s+/, ""))}</blockquote>); }
    else if (/^[-*]\s+/.test(line)) { list.push(line.replace(/^[-*]\s+/, "")); }
    else { flush(); blocks.push(<p key={blocks.length} style={{ margin: "0 0 18px", color: "#C3BDB1", fontSize: 16, lineHeight: 1.8 }}>{inline(line)}</p>); }
  }
  flush();
  return <div>{blocks}</div>;
}
