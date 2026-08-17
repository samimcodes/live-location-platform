import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Local uploads served by Express static middleware
      { protocol: "http",  hostname: "localhost" },
    ],
  },

  // ── Webpack config for maplibre-gl ──────────────────────────────────────
  // maplibre-gl uses `new URL(worker, import.meta.url)` for web workers.
  // Turbopack cannot resolve this pattern, so we alias the package to a
  // no-op stub on the server side. The real library is only ever imported
  // in the browser via dynamic import inside useMapLibre / MiniMap.
  webpack(config, { isServer }) {
    if (isServer) {
      // Replace maplibre-gl with an empty module on the server so the
      // `new URL(…, import.meta.url)` worker syntax never runs in Node.
      config.resolve.alias = {
        ...config.resolve.alias,
        "maplibre-gl": false,
      };
    }

    return config;
  },
};

export default nextConfig;
