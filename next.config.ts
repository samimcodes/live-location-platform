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
  // Allow mapbox-gl to be bundled
  transpilePackages: ["mapbox-gl"],

  webpack: (config) => {
    // Fix for mapbox-gl Worker — needed for WebGL tile rendering
    config.resolve.alias = {
      ...config.resolve.alias,
      "./dist/mapbox-gl-csp-worker": false,
    };
    return config;
  },
};

export default nextConfig;
