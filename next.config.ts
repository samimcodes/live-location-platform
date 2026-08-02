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
  // mapbox-gl needs to be transpiled
  transpilePackages: ["mapbox-gl"],
};

export default nextConfig;
