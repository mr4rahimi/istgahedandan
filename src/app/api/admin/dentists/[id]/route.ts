import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const dentistId = parseInt(id);
  const body = await req.json() as Record<string, unknown>;

  // Only update what's in the body
  const data: Record<string, unknown> = {};

  if ("title" in body) data.title = body.title;
  if ("slug" in body) data.slug = body.slug;
  if ("shortDesc" in body) data.shortDesc = (body.shortDesc as string) || null;
  if ("longDesc" in body) data.longDesc = (body.longDesc as string) || null;
  if ("address" in body) data.address = (body.address as string) || null;
  if ("phones" in body) data.phones = body.phones;
  if ("whatsapp" in body) data.whatsapp = (body.whatsapp as string) || null;
  if ("telegram" in body) data.telegram = (body.telegram as string) || null;
  if ("instagram" in body) data.instagram = (body.instagram as string) || null;
  if ("workingHours" in body) data.workingHours = (body.workingHours as string) || null;
  if ("mapLat" in body) data.mapLat = body.mapLat ? parseFloat(body.mapLat as string) : null;
  if ("mapLng" in body) data.mapLng = body.mapLng ? parseFloat(body.mapLng as string) : null;
  if ("centerCode" in body) data.centerCode = (body.centerCode as string) || null;
  if ("featuredImage" in body) data.featuredImage = (body.featuredImage as string) || null;
  if ("metaTitle" in body) data.metaTitle = (body.metaTitle as string) || null;
  if ("metaDescription" in body) data.metaDescription = (body.metaDescription as string) || null;
  if ("status" in body) data.status = body.status as "PUBLISHED" | "HIDDEN" | "PENDING";

  if (Object.keys(data).length > 0) {
    await prisma.dentist.update({ where: { id: dentistId }, data });
  }

  // Sync locations if provided
  if ("locationIds" in body) {
    const locationIds = body.locationIds as number[];
    await prisma.dentistLocation.deleteMany({ where: { dentistId } });
    if (locationIds.length > 0) {
      await prisma.dentistLocation.createMany({
        data: locationIds.map(locationId => ({ dentistId, locationId })),
        skipDuplicates: true,
      });
    }
  }

  // Sync services if provided
  if ("serviceIds" in body) {
    const serviceIds = body.serviceIds as number[];
    await prisma.dentistService.deleteMany({ where: { dentistId } });
    if (serviceIds.length > 0) {
      await prisma.dentistService.createMany({
        data: serviceIds.map(serviceId => ({ dentistId, serviceId })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
