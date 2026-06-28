import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const stories = await prisma.dentistStory.findMany({
    where: { dentistId: parseInt(id) },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(stories);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const dentistId = parseInt(id);
  const body = await req.json() as { imageUrl: string; title: string; order: number; storyId?: number }[];

  await prisma.dentistStory.deleteMany({ where: { dentistId } });
  if (body.length > 0) {
    await prisma.dentistStory.createMany({
      data: body.map((s, i) => ({ dentistId, imageUrl: s.imageUrl, title: s.title, order: i })),
    });
  }
  return NextResponse.json({ ok: true });
}
