import { redirect } from "next/navigation";
import { getDentistSession } from "@/lib/dentist-auth";
import LoginForm from "./LoginForm";

// The header and footer link here without knowing whether the visitor is signed
// in — the client-side session probe only refines the label. Sending an already
// signed-in dentist straight to their dashboard is what makes that safe.
export default async function DentistLoginPage() {
  const session = await getDentistSession();
  if (session) redirect("/dentist/dashboard");

  return <LoginForm />;
}
