import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cats = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, parentId: true, _count: { select: { posts: true } } },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, parentId } = await req.json() as { name: string; slug: string; parentId?: number | null };
  if (!name || !slug) return NextResponse.json({ error: "name and slug required" }, { status: 400 });

  const cat = await prisma.category.create({ data: { name, slug, parentId: parentId || null } });
  return NextResponse.json(cat);
}
