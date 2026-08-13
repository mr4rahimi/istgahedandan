import { NextResponse } from "next/server";
import { getDentistSession } from "@/lib/dentist-auth";

// Lightweight session probe used by the public Header/Footer to decide whether
// the "dentist panel" link should point at the panel or at the login page.
export async function GET() {
  const session = await getDentistSession();
  if (!session) return NextResponse.json({ loggedIn: false });

  return NextResponse.json({
    loggedIn: true,
    name: session.name,
    dentistId: session.dentistId,
  });
}
