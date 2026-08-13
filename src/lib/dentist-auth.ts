import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { jwtSecret, DENTIST_ROLE } from "@/lib/jwt-secret";

export const DENTIST_COOKIE = "dentist_token";
export { DENTIST_ROLE };

export interface DentistPayload {
  id: number;
  email: string;
  name: string;
  dentistId: number | null;
}

export async function signDentistToken(payload: DentistPayload): Promise<string> {
  return new SignJWT({ ...payload, role: DENTIST_ROLE })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(jwtSecret());
}

export async function verifyDentistToken(token: string): Promise<DentistPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    // The admin tokens are signed with the same key — see verifyToken().
    if (payload.role !== DENTIST_ROLE) return null;
    return payload as unknown as DentistPayload;
  } catch {
    return null;
  }
}

export async function getDentistSession(): Promise<DentistPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DENTIST_COOKIE)?.value;
  if (!token) return null;
  return verifyDentistToken(token);
}
