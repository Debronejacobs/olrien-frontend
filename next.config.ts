import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile above the project makes Next infer the wrong workspace root.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Fully static export: the site is deployed as plain HTML/CSS/JS
  // (GitHub Pages + custom domain). No Node server, no API routes.
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
