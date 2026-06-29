import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://istgahedandan.ir";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [dentists, services, posts, locations] = await Promise.all([
    prisma.dentist.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
    prisma.service.findMany({ select: { slug: true, updatedAt: true }, orderBy: { order: "asc" } }),
    prisma.blogPost.findMany({ select: { slug: true, updatedAt: true, publishedAt: true }, orderBy: { publishedAt: "desc" } }),
    prisma.location.findMany({ select: { slug: true, updatedAt: true }, take: 200 }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/dentists-list`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/mag`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const dentistPages: MetadataRoute.Sitemap = dentists.map(d => ({
    url: `${SITE_URL}/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const servicePages: MetadataRoute.Sitemap = services.map(s => ({
    url: `${SITE_URL}/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${SITE_URL}/${p.slug}`,
    lastModified: p.updatedAt ?? p.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const locationPages: MetadataRoute.Sitemap = locations.map(l => ({
    url: `${SITE_URL}/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...dentistPages, ...servicePages, ...blogPages, ...locationPages];
}
