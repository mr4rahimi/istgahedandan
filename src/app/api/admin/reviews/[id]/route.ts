import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const reviewId = parseInt(id);
  const body = await req.json() as { action?: "approve" | "reject" | "delete"; content?: string };

  if (body.action === "delete") {
    await prisma.review.delete({ where: { id: reviewId } });
  } else if (body.action === "approve") {
    await prisma.review.update({ where: { id: reviewId }, data: { approved: true } });
  } else if (body.action === "reject") {
    await prisma.review.update({ where: { id: reviewId }, data: { approved: false } });
  } else if (body.content !== undefined) {
    await prisma.review.update({ where: { id: reviewId }, data: { content: body.content.trim() } });
  }

  return NextResponse.json({ ok: true });
}
