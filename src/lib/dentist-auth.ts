import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "istgah-dandan-admin-secret-2024");
export const DENTIST_COOKIE = "dentist_token";

export interface DentistPayload {
  id: number;
  email: string;
  name: string;
  dentistId: number | null;
}

export async function signDentistToken(payload: DentistPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyDentistToken(token: string): Promise<DentistPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
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
