import { prisma } from "@/lib/prisma";
import type { DentistFacts } from "@/lib/seo";

type LocationRow = { id: number; slug: string; title: string; shortTitle: string | null; parentId: number | null };

/**
 * A dentist is usually linked both to a broad region ("شمال تهران") and to the
 * neighbourhood inside it ("سعادت آباد"). The neighbourhood is what people
 * search for, so the most deeply nested location wins.
 */
export function pickPrimaryLocation<T extends LocationRow>(locs: T[], all: LocationRow[]): T | undefined {
  const byId = new Map(all.map(l => [l.id, l]));
  const depth = (l: LocationRow) => {
    let d = 0;
    let cur: LocationRow | undefined = l;
    while (cur?.parentId && d < 10) { d++; cur = byId.get(cur.parentId); }
    return d;
  };
  return [...locs].sort((a, b) => depth(b) - depth(a))[0];
}

/** The facts that the dentist's title, meta description and summary are built from. */
export async function getDentistFacts(dentist: {
  id: number; title: string; address: string | null; phones: unknown;
}): Promise<DentistFacts> {
  const [links, allLocations, ratings, svcLinks] = await Promise.all([
    prisma.dentistLocation.findMany({ where: { dentistId: dentist.id }, select: { locationId: true } }),
    prisma.location.findMany({ select: { id: true, slug: true, title: true, shortTitle: true, parentId: true } }),
    prisma.review.findMany({
      where: { dentistId: dentist.id, approved: true, parentId: null, rating: { not: null } },
      select: { rating: true },
    }),
    prisma.dentistService.findMany({ where: { dentistId: dentist.id }, select: { serviceId: true } }),
  ]);

  const linked = allLocations.filter(l => links.some(x => x.locationId === l.id));
  const primary = pickPrimaryLocation(linked, allLocations);
  const services = svcLinks.length
    ? await prisma.service.findMany({ where: { id: { in: svcLinks.map(s => s.serviceId) } }, select: { title: true } })
    : [];
  const phones = Array.isArray(dentist.phones) ? (dentist.phones as string[]) : [];

  return {
    title: dentist.title,
    locationTitle: primary ? primary.shortTitle || primary.title : null,
    address: dentist.address,
    phone: phones[0] ?? null,
    avgRating: ratings.length ? ratings.reduce((s, r) => s + (r.rating ?? 0), 0) / ratings.length : null,
    ratingCount: ratings.length,
    services: services.map(s => s.title),
  };
}

export interface NearbyDentist {
  id: number; slug: string; title: string; address: string | null; distanceKm: number;
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/**
 * The closest published practices by straight-line distance. Besides being
 * useful to a visitor comparing options, this is the main source of internal
 * links between profiles: location pages only render their first 12 cards in
 * HTML, so without it dozens of profiles had no crawlable link at all.
 */
export async function getNearbyDentists(
  dentist: { id: number; mapLat: number | null; mapLng: number | null },
  limit = 8,
): Promise<NearbyDentist[]> {
  if (dentist.mapLat == null || dentist.mapLng == null) return [];
  const { mapLat: lat, mapLng: lng } = dentist;
  const others = await prisma.dentist.findMany({
    where: { status: "PUBLISHED", id: { not: dentist.id }, mapLat: { not: null }, mapLng: { not: null } },
    select: { id: true, slug: true, title: true, address: true, mapLat: true, mapLng: true },
  });
  return others
    // Slugs containing "/" cannot be served by the single-segment [slug] route.
    .filter(d => !d.slug.includes("/"))
    .map(d => ({ id: d.id, slug: d.slug, title: d.title, address: d.address, distanceKm: haversineKm(lat, lng, d.mapLat!, d.mapLng!) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
