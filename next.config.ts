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
