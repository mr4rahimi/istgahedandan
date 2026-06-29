import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const today = new Date().toISOString().split("T")[0];

  const where = {
    status: "PUBLISHED" as const,
    // only clinics with at least one future schedule
    schedules: { some: { date: { gte: today } } },
    ...(q.trim().length >= 2 && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { address: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const results = await prisma.dentist.findMany({
    where,
    select: { id: true, slug: true, title: true, address: true, phones: true, featuredImage: true, workingHours: true },
    take: 8,
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ results });
}
