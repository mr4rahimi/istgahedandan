import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json() as {
      email: string; password: string; name: string; phone?: string;
    };

    if (!email || !password || !name) {
      return NextResponse.json({ error: "همه فیلدها الزامی هستند" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "رمز عبور باید حداقل ۸ کاراکتر باشد" }, { status: 400 });
    }

    const exists = await prisma.dentistUser.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.dentistUser.create({
      data: { email, password: hashed, name, phone: phone || null, status: "PENDING" },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
