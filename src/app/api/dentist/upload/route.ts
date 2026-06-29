import { NextRequest, NextResponse } from "next/server";
import { getDentistSession } from "@/lib/dentist-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getDentistSession();
  if (!session?.dentistId) return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "فایلی انتخاب نشده" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "نوع فایل مجاز نیست" }, { status: 400 });

  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "حجم فایل بیشتر از ۵۰ مگابایت است" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${name}` });
}
