import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dentist = await prisma.dentist.findUnique({
    where: { slug: decodeURIComponent(slug), status: "PUBLISHED" },
    select: { id: true, slug: true, title: true, address: true, phones: true, featuredImage: true, workingHours: true },
  });
  if (!dentist) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(dentist);
}
