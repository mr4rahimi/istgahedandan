import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const locationId = parseInt(id);

  const [location, featuredSetting] = await Promise.all([
    prisma.location.findUnique({ where: { id: locationId } }),
    prisma.setting.findUnique({ where: { key: `loc_${locationId}_featured_ids` } }),
  ]);
  if (!location) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...location,
    featuredDentistIds: featuredSetting ? JSON.parse(featuredSetting.value) : [],
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const locationId = parseInt(id);
  const body = await req.json() as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if ("title" in body) data.title = body.title;
  if ("shortTitle" in body) data.shortTitle = body.shortTitle || null;
  if ("slug" in body) data.slug = body.slug;
  if ("parentId" in body) data.parentId = body.parentId ?? null;
  if ("order" in body) data.order = Number(body.order);
  if ("shortDesc" in body) data.shortDesc = body.shortDesc || null;
  if ("longDesc" in body) data.longDesc = body.longDesc || null;
  if ("metaTitle" in body) data.metaTitle = body.metaTitle || null;
  if ("metaDescription" in body) data.metaDescription = body.metaDescription || null;

  const [location] = await Promise.all([
    prisma.location.update({ where: { id: locationId }, data }),
    // Save featured dentist IDs to Settings if provided
    "featuredDentistIds" in body
      ? prisma.setting.upsert({
          where: { key: `loc_${locationId}_featured_ids` },
          create: { key: `loc_${locationId}_featured_ids`, value: JSON.stringify(body.featuredDentistIds) },
          update: { value: JSON.stringify(body.featuredDentistIds) },
        })
      : Promise.resolve(),
  ]);

  return NextResponse.json(location);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const locationId = parseInt(id);

  await prisma.location.updateMany({ where: { parentId: locationId }, data: { parentId: null } });
  await prisma.location.delete({ where: { id: locationId } });
  return NextResponse.json({ ok: true });
}
