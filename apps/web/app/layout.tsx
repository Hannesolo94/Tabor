import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Inter, JetBrains_Mono, Pirata_One } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cinzel" });
const pirata = Pirata_One({ subsets: ["latin"], weight: "400", variable: "--font-pirata" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], style: ["italic"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: "TABOR · Sons of Fire",
  description:
    "TABOR. The free brotherhood app for Christian men who game. Scripture, fitness, and accountability as a daily quest.",
};

// Root layout: html/body + fonts only. The storefront chrome lives in the (site)
// group; the admin portal brings its own chrome.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${cinzel.variable} ${pirata.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
