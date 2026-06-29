import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const locationId = parseInt(id);

  const links = await prisma.dentistLocation.findMany({
    where: { locationId },
    select: { dentistId: true },
  });
  const dentistIds = links.map(l => l.dentistId);

  const dentists = await prisma.dentist.findMany({
    where: { id: { in: dentistIds }, status: "PUBLISHED" },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return NextResponse.json(dentists);
}
