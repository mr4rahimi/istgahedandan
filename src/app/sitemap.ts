import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

import { canonicalUrl } from "@/lib/seo";

// Without this the sitemap is generated once at build time and frozen: profiles,
// articles and areas added from the admin panel never reached Google until the
// next deploy, and every static entry claimed the build time as its lastmod.
export const revalidate = 3600;

/**
 * Sitemap entries must be URI-escaped (sitemaps.org) and should match the
 * canonical tag byte for byte. canonicalUrl() returns the readable Persian form,
 * which the canonical <link> gets escaped on output — do the same here.
 */
const loc = (slug?: string) => encodeURI(canonicalUrl(slug));

/** A slug containing "/" cannot be served by the single-segment [slug] route — it only 404s. */
const routable = (r: { slug: string }) => !r.slug.includes("/");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dentists, services, posts, locations] = await Promise.all([
    prisma.dentist.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
    prisma.service.findMany({ select: { slug: true, updatedAt: true }, orderBy: { order: "asc" } }),
    prisma.blogPost.findMany({ select: { slug: true, updatedAt: true, publishedAt: true }, orderBy: { publishedAt: "desc" } }),
    prisma.location.findMany({ select: { slug: true, updatedAt: true }, take: 200 }),
  ]);

  // Hub pages change when what they list changes; a lastmod that moves on every
  // build without the page changing teaches Google to ignore the field.
  const latest = (rows: { updatedAt: Date }[]) =>
    rows.reduce<Date | undefined>((max, r) => (!max || r.updatedAt > max ? r.updatedAt : max), undefined);
  const dentistsUpdated = latest(dentists);
  const postsUpdated = latest(posts);
  const siteUpdated = latest([...dentists, ...posts, ...services, ...locations]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: loc(), lastModified: siteUpdated, changeFrequency: "daily", priority: 1 },
    { url: loc("dentists-list"), lastModified: dentistsUpdated, changeFrequency: "daily", priority: 0.9 },
    { url: loc("services"), lastModified: latest(services), changeFrequency: "weekly", priority: 0.8 },
    { url: loc("map"), lastModified: dentistsUpdated, changeFrequency: "weekly", priority: 0.8 },
    { url: loc("mag"), lastModified: postsUpdated, changeFrequency: "daily", priority: 0.7 },
    { url: loc("about"), changeFrequency: "monthly", priority: 0.5 },
    { url: loc("contact"), changeFrequency: "monthly", priority: 0.5 },
  ];

  const dentistPages: MetadataRoute.Sitemap = dentists.filter(routable).map(d => ({
    url: loc(d.slug),
    lastModified: d.updatedAt,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const servicePages: MetadataRoute.Sitemap = services.filter(routable).map(s => ({
    url: loc(s.slug),
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.filter(routable).map(p => ({
    url: loc(p.slug),
    lastModified: p.updatedAt ?? p.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const locationPages: MetadataRoute.Sitemap = locations.filter(routable).map(l => ({
    url: loc(l.slug),
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...dentistPages, ...servicePages, ...blogPages, ...locationPages];
}
