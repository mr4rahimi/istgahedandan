import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/reserve/slots?dentistId=X&date=YYYY-MM-DD
// GET /api/reserve/slots?dentistId=X&from=YYYY-MM-DD&to=YYYY-MM-DD  ← Jalali month range (may span 2 Gregorian months)
// GET /api/reserve/slots?dentistId=X&month=YYYY-MM  ← legacy single-Gregorian-month
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dentistId = parseInt(searchParams.get("dentistId") || "0");
  const date = searchParams.get("date") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const month = searchParams.get("month") || "";

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

  const dateFilter = from && to
    ? { gte: from, lte: to }
    : month
      ? undefined // handled separately below
      : null;

  if (!dateFilter && !month) {
    return NextResponse.json({ error: "date, from+to, یا month لازم است" }, { status: 400 });
  }

  const whereDate = dateFilter ?? { startsWith: month };

  const [schedules, bookedAppts] = await Promise.all([
    prisma.dentistSchedule.findMany({
      where: { dentistId, date: whereDate },
      orderBy: { date: "asc" },
    }),
    prisma.appointment.findMany({
      where: { dentistId, date: whereDate, status: "CONFIRMED" },
      select: { date: true, time: true },
    }),
  ]);

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
