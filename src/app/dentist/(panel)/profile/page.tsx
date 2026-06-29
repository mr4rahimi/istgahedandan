import { getDentistSession } from "@/lib/dentist-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DentistProfileForm from "@/components/dentist/DentistProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش پروفایل | پنل دندانپزشک" };

export default async function DentistProfilePage() {
  const session = await getDentistSession();
  if (!session) redirect("/dentist/login");
  if (!session.dentistId) {
    return (
      <div style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#133b48", margin: "0 0 16px" }}>ویرایش پروفایل</h1>
        <div style={{ background: "#fff9ed", border: "1px solid #fde68a", borderRadius: 16, padding: "24px", color: "#92400e", lineHeight: 1.8 }}>
          پروفایل کلینیک هنوز به حساب شما تخصیص نیافته است. پس از تأیید ادمین می‌توانید پروفایل خود را ویرایش کنید.
        </div>
      </div>
    );
  }

  const dentist = await prisma.dentist.findUnique({
    where: { id: session.dentistId },
    include: {
      faqs: { orderBy: { order: "asc" } },
      dentistVideos: { orderBy: { order: "asc" } },
    },
  });
  if (!dentist) redirect("/dentist/dashboard");

  return <DentistProfileForm dentist={dentist as Parameters<typeof DentistProfileForm>[0]["dentist"]} />;
}
