import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugConflictMessage } from "@/lib/slug";
import { pingIndexNow } from "@/lib/indexnow";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    title: string; slug: string; excerpt: string; content: string;
    featuredImage: string; categoryId: number | null; metaTitle: string;
    metaDescription: string; publishedAt: string | null;
  };

  const conflict = await slugConflictMessage(body.slug ?? "");
  if (conflict) return NextResponse.json({ error: conflict }, { status: 409 });

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug: body.slug.trim(),
      excerpt: body.excerpt || null,
      content: body.content || null,
      featuredImage: body.featuredImage || null,
      categoryId: body.categoryId || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    },
  });

  await pingIndexNow([post.slug]);
  return NextResponse.json({ ok: true, id: post.id });
}
