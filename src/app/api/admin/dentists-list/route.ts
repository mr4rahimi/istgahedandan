import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const KEYS = [
  "dl_short_desc", "dl_long_desc", "dl_popular_count",
  "dl_main_city_ids", "dl_region_ids", "dl_featured_ids",
  "dl_banner_image", "dl_banner_title", "dl_banner_link",
  "dl_faqs", "dl_meta_title", "dl_meta_desc",
];

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.setting.findMany({ where: { key: { in: KEYS } } });
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, string>;
  const updates = Object.entries(body).filter(([k]) => KEYS.includes(k));

  for (const [key, value] of updates) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  return NextResponse.json({ ok: true });
}
