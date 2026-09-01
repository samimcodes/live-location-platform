import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
    ],
  },

  // Turbopack is the default bundler in Next.js 16.
  // maplibre-gl SSR safety is handled via:
  //  - dynamic(() => import('…'), { ssr: false }) on all map components
  //  - typeof window === 'undefined' guard in useMapLibre + MiniMap
  // No webpack alias needed.
  turbopack: {},
};

export default nextConfig;
