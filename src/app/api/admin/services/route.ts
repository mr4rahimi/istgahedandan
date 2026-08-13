import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { slugConflictMessage } from "@/lib/slug";
import { pingIndexNow } from "@/lib/indexnow";

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

  const conflict = await slugConflictMessage(String(body.slug ?? ""));
  if (conflict) return NextResponse.json({ error: conflict }, { status: 409 });

  const service = await prisma.service.create({
    data: {
      title: body.title as string,
      slug: String(body.slug).trim(),
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
  await pingIndexNow([service.slug]);
  return NextResponse.json(service);
}
