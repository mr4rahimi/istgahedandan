import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const dentists = await prisma.dentist.findMany({
    where: { status: "PUBLISHED", mapLat: { not: null }, mapLng: { not: null } },
    select: { id: true, slug: true, title: true, address: true, featuredImage: true, mapLat: true, mapLng: true, phones: true },
    orderBy: { id: "asc" },
  });

  const reviews = await prisma.review.findMany({
    where: { dentistId: { in: dentists.map(d => d.id) }, approved: true, parentId: null },
    select: { dentistId: true, rating: true },
  });
  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of reviews) {
    if (!r.dentistId) continue;
    const cur = ratingMap.get(r.dentistId) ?? { sum: 0, count: 0 };
    cur.sum += r.rating ?? 0; cur.count++;
    ratingMap.set(r.dentistId, cur);
  }

  const result = dentists.map(d => {
    const stats = ratingMap.get(d.id);
    return {
      id: d.id,
      slug: d.slug,
      title: d.title,
      address: d.address,
      featuredImage: d.featuredImage,
      phone: (d.phones as string[])?.[0] ?? null,
      lat: d.mapLat!,
      lng: d.mapLng!,
      avgRating: stats ? Math.round((stats.sum / stats.count) * 10) / 10 : null,
      reviewCount: stats?.count ?? 0,
    };
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
