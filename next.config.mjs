const nextConfig = {
  outputFileTracingRoot: process.cwd(),
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
