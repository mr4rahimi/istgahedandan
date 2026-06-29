import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";

export async function GET() {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const dentist = await prisma.dentist.findUnique({
    where: { id: session.dentistId },
    include: { faqs: { orderBy: { order: "asc" } }, services: { include: { service: true } } },
  });
  if (!dentist) return NextResponse.json({ error: "پروفایل یافت نشد" }, { status: 404 });

  return NextResponse.json(dentist);
}

export async function PUT(req: NextRequest) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const body = await req.json();

  // Strip fields dentist cannot change
  const { slug: _slug, status: _status, order: _order, wpPostId: _wp, id: _id, ...safe } = body;
  void _slug; void _status; void _order; void _wp; void _id;

  const updated = await prisma.dentist.update({
    where: { id: session.dentistId },
    data: {
      title: safe.title,
      shortDesc: safe.shortDesc ?? null,
      longDesc: safe.longDesc ?? null,
      address: safe.address ?? null,
      phones: safe.phones ?? [],
      whatsapp: safe.whatsapp ?? null,
      telegram: safe.telegram ?? null,
      instagram: safe.instagram ?? null,
      workingHours: safe.workingHours ?? null,
      mapLat: safe.mapLat ?? null,
      mapLng: safe.mapLng ?? null,
      centerCode: safe.centerCode ?? null,
      featuredImage: safe.featuredImage ?? null,
      gallery: safe.gallery ?? [],
      metaTitle: safe.metaTitle ?? null,
      metaDescription: safe.metaDescription ?? null,
    },
  });

  return NextResponse.json(updated);
}
