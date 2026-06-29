import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dentistId = parseInt(id);
  if (isNaN(dentistId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const dentist = await prisma.dentist.findUnique({
    where: { id: dentistId, status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, address: true,
      phones: true, featuredImage: true, workingHours: true,
    },
  });
  if (!dentist) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(dentist);
}
