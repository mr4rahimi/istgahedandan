import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };
    if (!email || !password) return NextResponse.json({ error: "اطلاعات ناقص" }, { status: 400 });

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });

    const token = await signToken({ id: user.id, email: user.email, name: user.name || "ادمین" });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
    return res;
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
