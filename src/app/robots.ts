import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // `/api/upload/` used to be listed here but matches no route — the real
        // upload endpoints are namespaced under admin and dentist. The admin one
        // is already covered by `/api/admin/`; the dentist one was uncovered.
        disallow: ["/admin/", "/api/admin/", "/api/dentist/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
