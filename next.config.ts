import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localinks.onrender.com" },
      { protocol: "https", hostname: "**.onrender.com" },
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "**.railway.app" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "unsplash.com" },
      // Local uploads served by Express static middleware
      { protocol: "http",  hostname: "localhost", port: "3000" },
      { protocol: "http",  hostname: "127.0.0.1", port: "3000" },
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "localhost" },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
