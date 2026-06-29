import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reserve/slots?dentistId=X&month=YYYY-MM
// Returns available schedule + booked appointments for that month
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dentistId = parseInt(searchParams.get("dentistId") || "0");
  const month = searchParams.get("month") || "";
  const date = searchParams.get("date") || "";

  if (!dentistId) return NextResponse.json({ error: "dentistId لازم است" }, { status: 400 });

  if (date) {
    const [schedule, bookedAppts] = await Promise.all([
      prisma.dentistSchedule.findUnique({ where: { dentistId_date: { dentistId, date } } }),
      prisma.appointment.findMany({ where: { dentistId, date, status: "CONFIRMED" }, select: { time: true } }),
    ]);

    const bookedTimes = new Set(bookedAppts.map(a => a.time));
    const slots = (schedule?.slots as string[] ?? []).map(time => ({ time, booked: bookedTimes.has(time) }));
    return NextResponse.json({ date, slots, slotDuration: schedule?.slotDuration ?? 30 });
  }

  if (month) {
    const [schedules, bookedAppts] = await Promise.all([
      prisma.dentistSchedule.findMany({ where: { dentistId, date: { startsWith: month } } }),
      prisma.appointment.findMany({ where: { dentistId, date: { startsWith: month }, status: "CONFIRMED" }, select: { date: true, time: true } }),
    ]);

    // Map booked appointments by date
    const bookedMap: Record<string, Set<string>> = {};
    bookedAppts.forEach(a => {
      if (!bookedMap[a.date]) bookedMap[a.date] = new Set();
      bookedMap[a.date].add(a.time);
    });

    const result = schedules.map(s => ({
      date: s.date,
      slotDuration: s.slotDuration,
      slots: (s.slots as string[]).map(time => ({ time, booked: (bookedMap[s.date] ?? new Set()).has(time) })),
    }));

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "month یا date لازم است" }, { status: 400 });
}
