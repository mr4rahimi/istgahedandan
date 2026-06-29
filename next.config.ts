import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "istgahedandan.ir",
      },
    ],
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/assets/**" },
    ],
  },
  async rewrites() {
    return [
      { source: "/wp-content/uploads/:path*", destination: "/uploads/:path*" },
      // Persian-named routes — Next.js 16 doesn't reliably match Unicode directory names
      { source: "/جستجو", destination: "/search" },
      { source: "/جستجو/:path*", destination: "/search/:path*" },
      { source: "/خدمات", destination: "/services-list" },
      { source: "/خدمات/:path*", destination: "/services-list/:path*" },
      { source: "/دندانپزشکان", destination: "/dentists-page" },
      { source: "/دندانپزشکان/:path*", destination: "/dentists-page/:path*" },
    ];
  },
};

export default nextConfig;
