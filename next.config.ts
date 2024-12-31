import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable Next.js internal ESLint
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/dashboard",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      // Add PWA related headers
      {
        source: "/service-worker.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/api/dashboard",
      },
    ];
  },
};

export default nextConfig;
