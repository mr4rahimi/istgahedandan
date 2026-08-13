import { getDentistSession } from "@/lib/dentist-auth";
import { redirect } from "next/navigation";
import DentistStoriesManager from "@/components/dentist/DentistStoriesManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "استوری‌ها | پنل دندانپزشک" };

export default async function DentistStoriesPage() {
  const session = await getDentistSession();
  if (!session) redirect("/dentist/login");
  if (!session.dentistId) {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#133b48", margin: "0 0 16px" }}>استوری‌ها</h1>
        <div style={{ background: "#fff9ed", border: "1px solid #fde68a", borderRadius: 16, padding: "24px", color: "#92400e" }}>
          برای مدیریت استوری‌ها نیاز به پروفایل تخصیص‌یافته دارید.
        </div>
      </div>
    );
  }
  return <DentistStoriesManager />;
}
