import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { jwtSecret, ADMIN_ROLE } from "@/lib/jwt-secret";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));
    try {
      const { payload } = await jwtVerify(token, jwtSecret());
      // Dentist tokens are signed with the same key, so a valid signature is not
      // enough on its own — the role claim is what separates the two.
      if (payload.role !== ADMIN_ROLE) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
