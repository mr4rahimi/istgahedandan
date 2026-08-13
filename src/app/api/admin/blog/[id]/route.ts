import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugConflictMessage } from "@/lib/slug";
import { pingIndexNow } from "@/lib/indexnow";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if ("slug" in body) {
    const conflict = await slugConflictMessage(String(body.slug), { owner: "blog", id: parseInt(id) });
    if (conflict) return NextResponse.json({ error: conflict }, { status: 409 });
    data.slug = String(body.slug).trim();
  }
  if ("title" in body) data.title = body.title;
  if ("excerpt" in body) data.excerpt = (body.excerpt as string) || null;
  if ("content" in body) data.content = (body.content as string) || null;
  if ("featuredImage" in body) data.featuredImage = (body.featuredImage as string) || null;
  if ("categoryId" in body) data.categoryId = body.categoryId ? Number(body.categoryId) : null;
  if ("metaTitle" in body) data.metaTitle = (body.metaTitle as string) || null;
  if ("metaDescription" in body) data.metaDescription = (body.metaDescription as string) || null;
  if ("publishedAt" in body) data.publishedAt = body.publishedAt ? new Date(body.publishedAt as string) : null;
  if ("isFeatured" in body) data.isFeatured = Boolean(body.isFeatured);
  if ("authorName" in body) data.authorName = (body.authorName as string) || null;

  const updated = await prisma.blogPost.update({ where: { id: parseInt(id) }, data });
  await pingIndexNow([updated.slug]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
