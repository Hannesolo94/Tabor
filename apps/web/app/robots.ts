import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // "/w" is the parent prefix of the private gated page. The full path is not
    // published here on purpose; robots.txt is world-readable.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/w"] }],
    sitemap: "https://tabor.quest/sitemap.xml",
  };
}
