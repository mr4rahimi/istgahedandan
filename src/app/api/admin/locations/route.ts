import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const locations = await prisma.location.findMany({
    orderBy: [{ parentId: "asc" }, { order: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true, shortTitle: true, parentId: true, order: true, shortDesc: true, metaTitle: true, metaDescription: true },
  });
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { slug: string; title: string; shortTitle?: string; parentId?: number | null; order?: number; shortDesc?: string };
  if (!body.slug || !body.title) return NextResponse.json({ error: "slug and title required" }, { status: 400 });

  const location = await prisma.location.create({
    data: {
      slug: body.slug,
      title: body.title,
      shortTitle: body.shortTitle || null,
      parentId: body.parentId || null,
      order: body.order ?? 0,
      shortDesc: body.shortDesc || null,
    },
  });
  return NextResponse.json(location);
}
