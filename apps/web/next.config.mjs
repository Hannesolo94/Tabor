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

const nextConfig = {
  reactStrictMode: true,
  // @tabor/shared ships as TypeScript source; let Next transpile it.
  transpilePackages: ["@tabor/shared"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
