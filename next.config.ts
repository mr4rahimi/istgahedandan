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
      {
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/wp-content/uploads/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
