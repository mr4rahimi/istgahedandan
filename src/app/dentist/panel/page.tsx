import { redirect } from "next/navigation";
import { getDentistSession } from "@/lib/dentist-auth";

/**
 * Entry point behind the "dentist panel" links in the site header and footer:
 * a signed-in dentist lands on their dashboard, everyone else on the login page.
 * Deciding here — rather than in the client — keeps the link correct on first
 * paint, with no session round-trip and no wrong-target race.
 *
 * This is a page rather than a route handler or a proxy branch on purpose. In
 * those two places Next builds the redirect Location against the origin that
 * reached the Node process, which behind nginx is 127.0.0.1:3004 — visitors were
 * sent to https://localhost:3004/… Only `redirect()` during a page render emits
 * a host-relative Location, which the browser resolves against the public URL.
 */
export default async function DentistPanelEntry() {
  const session = await getDentistSession();
  redirect(session ? "/dentist/dashboard" : "/dentist/login");
}
