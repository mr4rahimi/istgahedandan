import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";

// GET /api/dentist/schedule?month=YYYY-MM  →  all schedules for that month
// GET /api/dentist/schedule?date=YYYY-MM-DD →  single day schedule
export async function GET(req: NextRequest) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const month = searchParams.get("month"); // YYYY-MM

  if (date) {
    const schedule = await prisma.dentistSchedule.findUnique({
      where: { dentistId_date: { dentistId: session.dentistId, date } },
    });
    return NextResponse.json(schedule ?? { dentistId: session.dentistId, date, slots: [], slotDuration: 30 });
  }

  if (month) {
    const schedules = await prisma.dentistSchedule.findMany({
      where: { dentistId: session.dentistId, date: { startsWith: month } },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(schedules);
  }

  return NextResponse.json({ error: "date یا month لازم است" }, { status: 400 });
}

// PUT /api/dentist/schedule  — upsert schedule for a date
export async function PUT(req: NextRequest) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { date, slots, slotDuration } = await req.json();
  if (!date) return NextResponse.json({ error: "date لازم است" }, { status: 400 });

  const schedule = await prisma.dentistSchedule.upsert({
    where: { dentistId_date: { dentistId: session.dentistId, date } },
    update: { slots: slots ?? [], slotDuration: slotDuration ?? 30 },
    create: { dentistId: session.dentistId, date, slots: slots ?? [], slotDuration: slotDuration ?? 30 },
  });

  return NextResponse.json(schedule);
}
