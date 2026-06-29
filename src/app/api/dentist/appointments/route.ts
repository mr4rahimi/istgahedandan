import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";

// GET /api/dentist/appointments?month=YYYY-MM or ?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const month = searchParams.get("month");

  const where: Record<string, unknown> = { dentistId: session.dentistId };
  if (date) where.date = date;
  else if (month) where.date = { startsWith: month };

  const [appointments, unreadCount] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    }),
    prisma.appointment.count({ where: { dentistId: session.dentistId, isRead: false, status: "CONFIRMED" } }),
  ]);

  return NextResponse.json({ appointments, unreadCount });
}
