import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

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
  if ("metaTitle" in body) data.metaTitle = body.metaTitle || null;
  if ("metaDescription" in body) data.metaDescription = body.metaDescription || null;

  const location = await prisma.location.update({ where: { id: locationId }, data });
  return NextResponse.json(location);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const locationId = parseInt(id);

  // Unset parentId of children before deleting
  await prisma.location.updateMany({ where: { parentId: locationId }, data: { parentId: null } });
  await prisma.location.delete({ where: { id: locationId } });
  return NextResponse.json({ ok: true });
}
