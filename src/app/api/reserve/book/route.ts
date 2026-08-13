import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activeSlotFor, isUniqueViolation } from "@/lib/appointments";
import { rateLimit, clientIp } from "@/lib/rate-limit";

function genTrackCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "DN" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
// Iranian mobile numbers, with or without the leading 0 / +98.
const PHONE_RE = /^(?:\+?98|0)?9\d{9}$/;

function normalizePhone(raw: string): string {
  // Fold Persian/Arabic digits to ASCII, then drop separators.
  const ascii = raw.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  return ascii.replace(/[\s\-()]/g, "");
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(`book:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "تعداد درخواست‌های شما زیاد است. چند دقیقه بعد دوباره تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });

  const { dentistId: rawDentistId, date, time, patientName, patientPhone, notes } = body;

  if (!rawDentistId || !date || !time || !patientName || !patientPhone) {
    return NextResponse.json({ error: "اطلاعات ناقص است" }, { status: 400 });
  }

  const dentistId = parseInt(String(rawDentistId), 10);
  if (!Number.isInteger(dentistId) || dentistId <= 0) {
    return NextResponse.json({ error: "دندانپزشک نامعتبر است" }, { status: 400 });
  }
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) {
    return NextResponse.json({ error: "تاریخ یا ساعت نامعتبر است" }, { status: 400 });
  }

  const name = String(patientName).trim();
  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "نام باید بین ۲ تا ۱۰۰ کاراکتر باشد" }, { status: 400 });
  }

  const phone = normalizePhone(String(patientPhone));
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست" }, { status: 400 });
  }

  const trimmedNotes = notes ? String(notes).trim().slice(0, 500) : null;

  // Slot must exist in the dentist's published schedule.
  const schedule = await prisma.dentistSchedule.findUnique({
    where: { dentistId_date: { dentistId, date } },
  });
  if (!schedule || !(schedule.slots as string[]).includes(time)) {
    return NextResponse.json({ error: "این ساعت در برنامه وجود ندارد" }, { status: 400 });
  }

  // The unique index on (dentistId, activeSlot) is what actually prevents a
  // double booking; a SELECT-then-INSERT check cannot, because two concurrent
  // requests can both pass it. Retry only on a trackCode collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const trackCode = genTrackCode();
    try {
      const appointment = await prisma.appointment.create({
        data: {
          dentistId,
          date, time,
          patientName: name,
          patientPhone: phone,
          notes: trimmedNotes,
          trackCode,
          activeSlot: activeSlotFor(date, time),
        },
      });
      return NextResponse.json({ ok: true, trackCode, appointment });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      const target = String((err as { meta?: { target?: unknown } }).meta?.target ?? "");
      if (target.includes("trackCode")) continue; // astronomically rare — try another code
      return NextResponse.json({ error: "این ساعت قبلاً رزرو شده است" }, { status: 409 });
    }
  }

  return NextResponse.json({ error: "خطا در ثبت نوبت. دوباره تلاش کنید." }, { status: 500 });
}
