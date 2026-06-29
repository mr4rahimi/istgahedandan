import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signDentistToken, DENTIST_COOKIE } from "@/lib/dentist-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };
    if (!email || !password) {
      return NextResponse.json({ error: "اطلاعات ناقص" }, { status: 400 });
    }

    const user = await prisma.dentistUser.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });
    }

    if (user.status === "PENDING") {
      return NextResponse.json({ error: "حساب شما هنوز توسط ادمین تأیید نشده است. لطفاً صبر کنید." }, { status: 403 });
    }
    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "حساب شما معلق شده است. با پشتیبانی تماس بگیرید." }, { status: 403 });
    }

    const token = await signDentistToken({
      id: user.id,
      email: user.email,
      name: user.name,
      dentistId: user.dentistId,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(DENTIST_COOKIE, token, {
      httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
