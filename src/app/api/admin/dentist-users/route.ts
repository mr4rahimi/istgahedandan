import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const users = await prisma.dentistUser.findMany({
    orderBy: { createdAt: "desc" },
    include: { dentist: { select: { id: true, title: true, slug: true } } },
  });

  return NextResponse.json(users.map(u => ({
    id: u.id, email: u.email, name: u.name, phone: u.phone,
    status: u.status, dentistId: u.dentistId, dentist: u.dentist,
    createdAt: u.createdAt,
  })));
}
