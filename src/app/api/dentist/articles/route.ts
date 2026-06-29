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

export async function GET() {
  const session = await getDentistSession();
  if (!session) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({
    where: { authorId: session.id },
    select: { id: true, slug: true, title: true, publishedAt: true, categoryId: true, category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getDentistSession();
  if (!session) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const { title, content, excerpt, categoryId, featuredImage, metaTitle, metaDescription } =
    await req.json() as {
      title: string; content: string; excerpt?: string; categoryId?: number;
      featuredImage?: string; metaTitle?: string; metaDescription?: string;
    };

  if (!title || !content) return NextResponse.json({ error: "عنوان و محتوا الزامی است" }, { status: 400 });

  if (hasExternalLinks(content)) {
    return NextResponse.json({ error: "لینک‌های خارج از سایت مجاز نیستند. فقط لینک‌های داخلی مجاز است." }, { status: 400 });
  }

  // Build unique slug from title
  const base = title
    .replace(/[^a-zA-Z0-9؀-ۿ\s-]/g, "")
    .trim().replace(/\s+/g, "-").slice(0, 80);
  let slug = base;
  let suffix = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix++}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      slug, title, content,
      excerpt: excerpt || null,
      categoryId: categoryId || null,
      featuredImage: featuredImage || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      authorId: session.id,
      authorName: session.name,
      publishedAt: new Date(),
    },
  });

  return NextResponse.json(post);
}
