/** @type {import('next').NextConfig} */

// Security headers. CSP blocks the high-impact vectors (framing/clickjacking,
// base-uri hijack, plugin objects, cross-origin form posts) while allowing the
// inline styles the app uses and connections to Supabase (REST + realtime wss).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

// The private gated page at /w/<slug> is a self-contained static document served
// from a private bucket: no scripts, no third-party anything. It gets its own,
// tighter policy plus hard no-index headers. Declared here rather than in the
// route handlers so it also covers 401s, 404s and errors on that prefix.
const cvCsp = [
  "default-src 'none'",
  "style-src 'self' 'unsafe-inline'", // the document carries its own <style> block
  "img-src 'self' data:",
  "media-src 'self'",
  "font-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'", // the gateway injects <base> so relative asset paths resolve
].join("; ");

const privatePageHeaders = [
  { key: "Content-Security-Policy", value: cvCsp },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig = {
  reactStrictMode: true,
  // @tabor/shared ships as TypeScript source; let Next transpile it.
  transpilePackages: ["@tabor/shared"],
  async headers() {
    return [
      { source: "/w/:path*", headers: privatePageHeaders },
      // everything except the private page prefix
      { source: "/((?!w/).*)", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
