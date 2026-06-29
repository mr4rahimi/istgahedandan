import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug }, select: { id: true } });
  if (!service) return NextResponse.json([], { status: 200 });

  // Find all dentists offering this service
  const svcLinks = await prisma.dentistService.findMany({
    where: { serviceId: service.id },
    select: { dentistId: true },
  });
  const dentistIds = svcLinks.map(l => l.dentistId);
  if (!dentistIds.length) return NextResponse.json([]);

  // Find distinct locations those dentists are in
  const locLinks = await prisma.dentistLocation.findMany({
    where: { dentistId: { in: dentistIds } },
    select: { locationId: true },
  });
  const locationIds = [...new Set(locLinks.map(l => l.locationId))];

  const locations = await prisma.location.findMany({
    where: { id: { in: locationIds } },
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(locations);
}
