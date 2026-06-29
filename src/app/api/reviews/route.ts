import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { dentistId, serviceId, rating, name, body, parentId } = await req.json() as {
      dentistId?: number; serviceId?: number; rating?: number;
      name?: string; body?: string; parentId?: number;
    };

    if (!body?.trim()) {
      return NextResponse.json({ error: "متن نظر الزامی است" }, { status: 400 });
    }

    await prisma.review.create({
      data: {
        dentistId: dentistId || null,
        serviceId: serviceId || null,
        rating: rating && rating >= 1 && rating <= 5 ? Number(rating) : null,
        authorName: name?.trim() || "ناشناس",
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
