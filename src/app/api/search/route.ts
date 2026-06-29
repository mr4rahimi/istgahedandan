import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return Response.json({ dentists: [], services: [], articles: [] });
  }

  const [dentistsRaw, services, articlesRaw] = await Promise.all([
    prisma.dentist.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
          { shortDesc: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, slug: true, title: true, address: true, featuredImage: true },
      take: 6,
      orderBy: { order: "asc" },
    }),
    prisma.service.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { slug: true, title: true },
      take: 4,
    }),
    prisma.blogPost.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { slug: true, title: true, category: { select: { name: true } } },
      take: 4,
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  // Compute ratings for matched dentists
  const dentistIds = dentistsRaw.map(d => d.id);
  const reviews = dentistIds.length
    ? await prisma.review.findMany({
        where: { dentistId: { in: dentistIds }, approved: true, rating: { not: null }, parentId: null },
        select: { dentistId: true, rating: true },
      })
    : [];

  const rMap = new Map<number, { sum: number; count: number }>();
  for (const r of reviews) {
    if (!r.dentistId || !r.rating) continue;
    const cur = rMap.get(r.dentistId) ?? { sum: 0, count: 0 };
    cur.sum += r.rating; cur.count++;
    rMap.set(r.dentistId, cur);
  }

  const dentists = dentistsRaw.map(d => {
    const rd = rMap.get(d.id);
    return {
      slug: d.slug,
      title: d.title,
      address: d.address,
      featuredImage: d.featuredImage,
      avgRating: rd ? rd.sum / rd.count : null,
      reviewCount: rd?.count ?? 0,
    };
  });

  const articles = articlesRaw.map(a => ({
    slug: a.slug,
    title: a.title,
    categoryName: a.category?.name ?? null,
  }));

  return Response.json({ dentists, services, articles }, {
    headers: { "Cache-Control": "no-store" },
  });
}
