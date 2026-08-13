import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`review:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "تعداد نظرهای ارسالی شما زیاد است. کمی بعد دوباره تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
      );
    }

    const { dentistId, serviceId, rating, name, body, parentId } = await req.json() as {
      dentistId?: number; serviceId?: number; rating?: number;
      name?: string; body?: string; parentId?: number;
    };

    if (!body?.trim()) {
      return NextResponse.json({ error: "متن نظر الزامی است" }, { status: 400 });
    }
    if (body.trim().length > 3000) {
      return NextResponse.json({ error: "متن نظر بیش از حد طولانی است" }, { status: 400 });
    }

    await prisma.review.create({
      data: {
        dentistId: dentistId || null,
        serviceId: serviceId || null,
        rating: rating && rating >= 1 && rating <= 5 ? Number(rating) : null,
        authorName: name?.trim().slice(0, 100) || "ناشناس",
        content: body.trim(),
        approved: false,
        parentId: parentId || null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
