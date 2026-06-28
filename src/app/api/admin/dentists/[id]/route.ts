import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const dentistId = parseInt(id);
  const body = await req.json() as {
    title: string; slug: string; shortDesc: string; longDesc: string;
    address: string; phones: string[]; featuredImage: string;
    mapLat: string; mapLng: string; metaTitle: string; metaDescription: string;
    status: "PUBLISHED" | "HIDDEN" | "PENDING"; locationIds: number[];
  };

  const { locationIds, ...rest } = body;

  await prisma.dentist.update({
    where: { id: dentistId },
    data: {
      title: rest.title,
      slug: rest.slug,
      shortDesc: rest.shortDesc || null,
      longDesc: rest.longDesc || null,
      address: rest.address || null,
      phones: rest.phones,
      featuredImage: rest.featuredImage || null,
      mapLat: rest.mapLat ? parseFloat(rest.mapLat) : null,
      mapLng: rest.mapLng ? parseFloat(rest.mapLng) : null,
      metaTitle: rest.metaTitle || null,
      metaDescription: rest.metaDescription || null,
      status: rest.status,
    },
  });

  // Sync locations
  await prisma.dentistLocation.deleteMany({ where: { dentistId } });
  if (locationIds.length > 0) {
    await prisma.dentistLocation.createMany({
      data: locationIds.map(locationId => ({ dentistId, locationId })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ ok: true });
}
