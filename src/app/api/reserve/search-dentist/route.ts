import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ results: [] });

  const results = await prisma.dentist.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, slug: true, title: true, address: true, phones: true, featuredImage: true, workingHours: true },
    take: 8,
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ results });
}
