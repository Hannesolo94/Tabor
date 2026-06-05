/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @tabor/shared ships as TypeScript source; let Next transpile it.
  transpilePackages: ["@tabor/shared"],
};

export default nextConfig;
