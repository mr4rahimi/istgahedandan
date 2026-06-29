import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { id } = await params;
  const { status, dentistId } = await req.json() as {
    status?: "PENDING" | "ACTIVE" | "SUSPENDED";
    dentistId?: number | null;
  };

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (dentistId !== undefined) updateData.dentistId = dentistId;

  const updated = await prisma.dentistUser.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: { dentist: { select: { id: true, title: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { id } = await params;
  await prisma.dentistUser.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
