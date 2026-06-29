import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";

export async function GET() {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  // Get TTL from settings
  const ttlSetting = await prisma.setting.findUnique({ where: { key: "story_ttl_days" } });
  const ttlDays = parseInt(ttlSetting?.value || "7");
  const since = new Date(Date.now() - ttlDays * 24 * 60 * 60 * 1000);

  const stories = await prisma.dentistStory.findMany({
    where: { dentistId: session.dentistId, createdAt: { gte: since } },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ stories, ttlDays });
}

export async function POST(req: NextRequest) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { imageUrl, title } = await req.json() as { imageUrl: string; title: string };
  if (!imageUrl || !title) return NextResponse.json({ error: "تصویر و عنوان الزامی است" }, { status: 400 });

  const count = await prisma.dentistStory.count({ where: { dentistId: session.dentistId } });
  const story = await prisma.dentistStory.create({
    data: { dentistId: session.dentistId, imageUrl, title, order: count },
  });

  return NextResponse.json(story);
}
