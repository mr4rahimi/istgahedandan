import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";
import { activeSlotForStatus, isUniqueViolation } from "@/lib/appointments";

// PATCH — mark as read or cancel
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const appt = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
  if (!appt || appt.dentistId !== session.dentistId) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

  const status = body.status as "CONFIRMED" | "CANCELLED" | undefined;
  if (status !== undefined && status !== "CONFIRMED" && status !== "CANCELLED") {
    return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.isRead !== undefined && { isRead: !!body.isRead }),
        // activeSlot mirrors the status — see src/lib/appointments.ts.
        ...(status !== undefined && {
          status,
          activeSlot: activeSlotForStatus(status, appt.date, appt.time),
        }),
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    // Re-confirming an appointment whose slot was taken in the meantime.
    if (isUniqueViolation(err)) {
      return NextResponse.json({ error: "این ساعت در حال حاضر رزرو دیگری دارد" }, { status: 409 });
    }
    throw err;
  }
}
