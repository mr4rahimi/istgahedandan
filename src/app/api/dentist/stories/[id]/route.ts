import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { id } = await params;
  const story = await prisma.dentistStory.findUnique({ where: { id: parseInt(id) } });
  if (!story || story.dentistId !== session.dentistId) {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }

  await prisma.dentistStory.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
