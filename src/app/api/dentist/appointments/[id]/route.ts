import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";

// PATCH — mark as read or cancel
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const appt = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
  if (!appt || appt.dentistId !== session.dentistId) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

  const updated = await prisma.appointment.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.isRead !== undefined && { isRead: body.isRead }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });

  return NextResponse.json(updated);
}
