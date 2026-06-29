import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const services = await prisma.service.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true, shortDesc: true, bgGradient: true, order: true, _count: { select: { dentists: true } } },
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const service = await prisma.service.create({
    data: {
      title: body.title as string,
      slug: body.slug as string,
      shortDesc: (body.shortDesc as string) || null,
      content: (body.content as string) || null,
      featuredImage: (body.featuredImage as string) || null,
      bgGradient: (body.bgGradient as string) || null,
      iconSvgPath: (body.iconSvgPath as string) || null,
      order: (body.order as number) || 0,
      infoItems: body.infoItems ?? undefined,
      metaTitle: (body.metaTitle as string) || null,
      metaDescription: (body.metaDescription as string) || null,
    },
  });
  return NextResponse.json(service);
}
