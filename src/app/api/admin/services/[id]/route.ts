import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const faqs = await prisma.fAQ.findMany({ where: { serviceId: service.id }, orderBy: { order: "asc" } });
  return NextResponse.json({ ...service, faqs });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const fields = ["title", "slug", "shortDesc", "content", "featuredImage", "bgGradient", "iconSvgPath", "order", "metaTitle", "metaDescription"];
  for (const f of fields) if (f in body) data[f] = body[f] ?? null;
  if ("infoItems" in body) data.infoItems = body.infoItems ?? undefined;

  const service = await prisma.service.update({ where: { id: parseInt(id) }, data });
  return NextResponse.json(service);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sid = parseInt(id);
  await prisma.dentistService.deleteMany({ where: { serviceId: sid } });
  await prisma.fAQ.deleteMany({ where: { serviceId: sid } });
  await prisma.review.deleteMany({ where: { serviceId: sid } });
  await prisma.service.delete({ where: { id: sid } });
  return NextResponse.json({ ok: true });
}
