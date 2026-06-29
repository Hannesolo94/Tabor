import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Inter, JetBrains_Mono, Pirata_One } from "next/font/google";
import { getPublicBrandLogos } from "@/lib/brand";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cinzel" });
const pirata = Pirata_One({ subsets: ["latin"], weight: "400", variable: "--font-pirata" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], style: ["italic"], variable: "--font-cormorant" });

// Dynamic so the browser-tab favicon follows the uploaded brand icon (managed in
// /admin/branding) across the WHOLE app — storefront and admin. Falls back to the
// built-in seal in /public when no icon is uploaded.
export async function generateMetadata(): Promise<Metadata> {
  const { icon } = await getPublicBrandLogos();
  return {
    metadataBase: new URL("https://tabor.quest"),
    title: { default: "TABOR · Sons of Fire", template: "%s · TABOR" },
    description:
      "TABOR. Sacred-tactical apparel and gear for Christian men who train, game, and refuse to drift. Plus a free brotherhood app: scripture, fitness, and accountability as a daily quest.",
    applicationName: "TABOR",
    keywords: ["Christian apparel", "Christian streetwear", "faith gym wear", "Sons of Fire", "TABOR", "Christian men", "tactical Christian clothing"],
    icons: { icon: icon || "/brand-seal.svg" },
    openGraph: {
      type: "website",
      siteName: "TABOR",
      title: "TABOR · Sons of Fire",
      description: "Sacred-tactical apparel and gear for Christian men. Forged not bought.",
      url: "https://tabor.quest",
    },
    twitter: { card: "summary_large_image", title: "TABOR · Sons of Fire", description: "Sacred-tactical apparel and gear for Christian men. Forged not bought." },
  };
}

// Root layout: html/body + fonts only. The storefront chrome lives in the (site)
// group; the admin portal brings its own chrome.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${cinzel.variable} ${pirata.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
