import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { jwtSecret, ADMIN_ROLE } from "@/lib/jwt-secret";

export const COOKIE_NAME = "admin_token";
export { ADMIN_ROLE };

export interface AdminPayload {
  id: number;
  email: string;
  name: string;
}

export async function signToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload, role: ADMIN_ROLE })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(jwtSecret());
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    // The dentist tokens are signed with the same key, so a valid signature is
    // not enough — the role claim is what separates the two.
    if (payload.role !== ADMIN_ROLE) return null;
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
