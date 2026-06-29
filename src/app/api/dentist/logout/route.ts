import { NextResponse } from "next/server";
import { DENTIST_COOKIE } from "@/lib/dentist-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DENTIST_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
