import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const reviewId = parseInt(id);
  const { action } = await req.json() as { action: "approve" | "reject" | "delete" };

  if (action === "delete") {
    await prisma.review.delete({ where: { id: reviewId } });
  } else {
    await prisma.review.update({ where: { id: reviewId }, data: { approved: action === "approve" } });
  }

  return NextResponse.json({ ok: true });
}
