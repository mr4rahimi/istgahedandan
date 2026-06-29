import { getDentistSession } from "@/lib/dentist-auth";
import { redirect } from "next/navigation";
import ScheduleManager from "@/components/dentist/ScheduleManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مدیریت برنامه | پنل دندانپزشک" };

export default async function SchedulePage() {
  const session = await getDentistSession();
  if (!session) redirect("/dentist/login");
  if (!session.dentistId) {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#133b48", margin: "0 0 16px" }}>مدیریت برنامه</h1>
        <div style={{ background: "#fff9ed", border: "1px solid #fde68a", borderRadius: 16, padding: 24, color: "#92400e" }}>
          برای تنظیم برنامه نیاز به پروفایل تخصیص‌یافته دارید.
        </div>
      </div>
    );
  }
  return <ScheduleManager dentistId={session.dentistId} />;
}
