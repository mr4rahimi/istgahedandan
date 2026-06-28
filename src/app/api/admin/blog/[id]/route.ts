import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    title: string; slug: string; excerpt: string; content: string;
    featuredImage: string; categoryId: number | null; metaTitle: string;
    metaDescription: string; publishedAt: string | null;
  };

  await prisma.blogPost.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt || null,
      content: body.content || null,
      featuredImage: body.featuredImage || null,
      categoryId: body.categoryId || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
