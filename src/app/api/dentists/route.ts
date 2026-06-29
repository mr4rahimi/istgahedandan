import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDescendantIds(locationId: number, allLocations: { id: number; parentId: number | null }[]): number[] {
  const result: number[] = [locationId];
  for (const loc of allLocations) {
    if (loc.parentId === locationId) {
      result.push(...getDescendantIds(loc.id, allLocations));
    }
  }
  return result;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const locationId = parseInt(searchParams.get("locationId") ?? "0");
  const skip = parseInt(searchParams.get("skip") ?? "0");
  const take = parseInt(searchParams.get("take") ?? "12");

  if (!locationId) return NextResponse.json({ error: "locationId required" }, { status: 400 });

  // Get all locations to find descendants
  const allLocations = await prisma.location.findMany({ select: { id: true, parentId: true } });
  const descendantIds = getDescendantIds(locationId, allLocations);

  // Unique dentist IDs across all descendant locations
  const links = await prisma.dentistLocation.findMany({
    where: { locationId: { in: descendantIds } },
    select: { dentistId: true },
  });
  const uniqueIds = [...new Set(links.map(l => l.dentistId))];
  const total = uniqueIds.length;
  const pageIds = uniqueIds.slice(skip, skip + take);

  if (pageIds.length === 0) {
    return NextResponse.json({ dentists: [], total, hasMore: false });
  }

  const dentists = await prisma.dentist.findMany({
    where: { id: { in: pageIds }, status: "PUBLISHED" },
    select: { id: true, slug: true, title: true, shortDesc: true, address: true, featuredImage: true },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });

  // Ratings
  const reviews = await prisma.review.findMany({
    where: { dentistId: { in: pageIds }, approved: true, parentId: null },
    select: { dentistId: true, rating: true },
  });
  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of reviews) {
    if (!r.dentistId) continue;
    const cur = ratingMap.get(r.dentistId) ?? { sum: 0, count: 0 };
    cur.sum += (r.rating ?? 0); cur.count++;
    ratingMap.set(r.dentistId, cur);
  }

  const result = dentists.map(d => {
    const stats = ratingMap.get(d.id);
    return {
      ...d,
      avgRating: stats ? stats.sum / stats.count : null,
      reviewCount: stats?.count ?? 0,
    };
  });

  return NextResponse.json({ dentists: result, total, hasMore: skip + take < total });
}
