import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";

export async function GET() {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const videos = await prisma.dentistVideo.findMany({
    where: { dentistId: session.dentistId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(videos);
}

export async function PUT(req: NextRequest) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const videos: { url: string; title: string }[] = await req.json();

  await prisma.dentistVideo.deleteMany({ where: { dentistId: session.dentistId } });
  if (videos.length > 0) {
    await prisma.dentistVideo.createMany({
      data: videos.map((v, i) => ({ dentistId: session.dentistId!, url: v.url, title: v.title, order: i })),
    });
  }

  return NextResponse.json({ ok: true });
}
