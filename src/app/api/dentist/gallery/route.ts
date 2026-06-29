import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";

export async function PUT(req: NextRequest) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { gallery } = await req.json();
  const updated = await prisma.dentist.update({
    where: { id: session.dentistId },
    data: { gallery: gallery ?? [] },
    select: { gallery: true },
  });

  return NextResponse.json(updated);
}
