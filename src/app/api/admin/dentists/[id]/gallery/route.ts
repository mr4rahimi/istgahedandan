import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as { gallery: string[] };

  await prisma.dentist.update({
    where: { id: parseInt(id) },
    data: { gallery: body.gallery },
  });
  return NextResponse.json({ ok: true });
}
