import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistSession } from "@/lib/dentist-auth";
import { SITE_URL } from "@/lib/seo";

function hasExternalLinks(html: string): boolean {
  const matches = html.matchAll(/href=["']([^"']+)["']/gi);
  for (const m of matches) {
    const href = m[1];
    if (href.startsWith("http://") || href.startsWith("https://")) {
      if (!href.startsWith(SITE_URL)) return true;
    }
  }
  return false;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDentistSession();
  if (!session) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } });
  if (!post || post.authorId !== session.id) {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }

  const { title, content, excerpt, categoryId, featuredImage, metaTitle, metaDescription } =
    await req.json() as {
      title: string; content: string; excerpt?: string; categoryId?: number;
      featuredImage?: string; metaTitle?: string; metaDescription?: string;
    };

  if (!title || !content) return NextResponse.json({ error: "عنوان و محتوا الزامی است" }, { status: 400 });

  // Only check external links if not already approved
  if (!post.externalLinksApproved && hasExternalLinks(content)) {
    return NextResponse.json({ error: "لینک‌های خارج از سایت مجاز نیستند." }, { status: 400 });
  }

  const updated = await prisma.blogPost.update({
    where: { id: parseInt(id) },
    data: {
      title, content,
      excerpt: excerpt || null,
      categoryId: categoryId || null,
      featuredImage: featuredImage || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      authorName: session.name,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDentistSession();
  if (!session) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } });
  if (!post || post.authorId !== session.id) {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }

  await prisma.blogPost.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
