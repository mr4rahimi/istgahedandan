import { NextResponse } from "next/server";
import { indexNowKey } from "@/lib/indexnow";

/**
 * IndexNow ownership proof. The protocol wants the key readable somewhere on the
 * host; the location is passed as `keyLocation` in every ping, so it does not
 * have to sit at `/<key>.txt` — a fixed path avoids adding a second dynamic
 * segment alongside `app/[slug]`.
 */
export async function GET() {
  const key = indexNowKey();
  if (!key) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
