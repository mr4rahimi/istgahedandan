import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The WordPress site this was migrated from served every URL with a trailing
  // slash, and that is still the entire shape of Google's index: the top page
  // (/مرکز-دندانپزشکی-دکتر-تابش/) ranks at position ~4 with thousands of
  // impressions, while its slash-less twin is reported as "URL is unknown to
  // Google". Serving the URLs Google already knows avoids re-earning the index
  // for ~380 pages one 308 redirect at a time.
  // Canonical tags, sitemap entries and schema @id values follow from
  // canonicalUrl() in src/lib/seo.ts — keep them in step with this setting.
  trailingSlash: true,

  images: {
    unoptimized: true,
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
      { source: "/دندانپزشکان", destination: "/dentists-page" },
      { source: "/دندانپزشکان/:path*", destination: "/dentists-page/:path*" },
    ];
  },
};

export default nextConfig;
