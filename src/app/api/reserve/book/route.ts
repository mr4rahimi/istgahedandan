import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function genTrackCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "DN" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { dentistId, date, time, patientName, patientPhone, notes } = body;

  if (!dentistId || !date || !time || !patientName || !patientPhone) {
    return NextResponse.json({ error: "اطلاعات ناقص است" }, { status: 400 });
  }

  // Verify slot exists in schedule
  const schedule = await prisma.dentistSchedule.findUnique({
    where: { dentistId_date: { dentistId: parseInt(dentistId), date } },
  });
  if (!schedule || !(schedule.slots as string[]).includes(time)) {
    return NextResponse.json({ error: "این ساعت در برنامه وجود ندارد" }, { status: 400 });
  }

  // Check not already booked
  const existing = await prisma.appointment.findFirst({
    where: { dentistId: parseInt(dentistId), date, time, status: "CONFIRMED" },
  });
  if (existing) {
    return NextResponse.json({ error: "این ساعت قبلاً رزرو شده است" }, { status: 409 });
  }

  const trackCode = genTrackCode();

  const appointment = await prisma.appointment.create({
    data: {
      dentistId: parseInt(dentistId),
      date, time, patientName, patientPhone,
      notes: notes || null,
      trackCode,
    },
  });

  return NextResponse.json({ ok: true, trackCode, appointment });
}
