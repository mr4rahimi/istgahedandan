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
    // Must stay on until the server's CPU changes: the VPS exposes a bare
    // "Common KVM processor" without SSE4.2/POPCNT (x86-64-v2), and sharp's
    // prebuilt binaries refuse to load on it. With the optimizer on, Next falls
    // back to piping the original files through Node — slower than nginx
    // serving them from disk. See docs/03-issues.md #12.
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
  // WordPress archive URLs that Google still requests and that have no
  // one-to-one counterpart here. Typo'd profile slugs are handled separately in
  // src/app/[slug]/page.tsx (normalizeLegacySlug).
  async redirects() {
    return [
      { source: "/blog", destination: "/mag/", permanent: true },
      { source: "/blog/:path*", destination: "/mag/", permanent: true },
      { source: "/author/:path*", destination: "/mag/", permanent: true },
      { source: "/feed", destination: "/mag/", permanent: true },
      { source: "/rahmani", destination: "/", permanent: true },
      { source: "/rahmani/:path*", destination: "/", permanent: true },
    ];
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
