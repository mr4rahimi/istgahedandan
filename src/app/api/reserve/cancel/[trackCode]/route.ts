import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ trackCode: string }> }) {
  const { trackCode } = await params;

  const appt = await prisma.appointment.findUnique({ where: { trackCode } });
  if (!appt) return NextResponse.json({ error: "نوبت یافت نشد" }, { status: 404 });
  if (appt.status === "CANCELLED") return NextResponse.json({ error: "این نوبت قبلاً لغو شده" }, { status: 400 });

  await prisma.appointment.update({ where: { trackCode }, data: { status: "CANCELLED" } });

  return NextResponse.json({ ok: true });
}
