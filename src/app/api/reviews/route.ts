import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { dentistId, serviceId, rating, name, body } = await req.json() as { dentistId?: number; serviceId?: number; rating?: number; name?: string; body?: string };
    if (!rating || rating < 1 || rating > 5 || !body?.trim()) {
      return NextResponse.json({ error: "اطلاعات ناقص" }, { status: 400 });
    }
    await prisma.review.create({
      data: {
        dentistId: dentistId || null,
        serviceId: serviceId || null,
        rating: Number(rating),
        authorName: name?.trim() || "ناشناس",
        content: body.trim(),
        approved: false,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
