import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // Turbopack config (Next.js 16 default)
  turbopack: {},
  // maplibre-gl needs to be transpiled for SSR compatibility
  transpilePackages: ["maplibre-gl"],
};

export default nextConfig;
