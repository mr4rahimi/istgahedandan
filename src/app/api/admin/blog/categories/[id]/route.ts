import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { name?: string; slug?: string; parentId?: number | null };
  const data: Record<string, unknown> = {};
  if ("name" in body) data.name = body.name;
  if ("slug" in body) data.slug = body.slug;
  if ("parentId" in body) data.parentId = body.parentId ?? null;

  const cat = await prisma.category.update({ where: { id: parseInt(id) }, data });
  return NextResponse.json(cat);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const catId = parseInt(id);
  // Move posts to uncategorized before deleting
  await prisma.blogPost.updateMany({ where: { categoryId: catId }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id: catId } });
  return NextResponse.json({ ok: true });
}
