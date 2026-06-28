import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const videos = await prisma.dentistVideo.findMany({
    where: { dentistId: parseInt(id) },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(videos);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const dentistId = parseInt(id);
  const body = await req.json() as { url: string; title: string }[];

  await prisma.dentistVideo.deleteMany({ where: { dentistId } });
  if (body.length > 0) {
    await prisma.dentistVideo.createMany({
      data: body.map((v, i) => ({ dentistId, url: v.url, title: v.title, order: i })),
    });
  }
  return NextResponse.json({ ok: true });
}
