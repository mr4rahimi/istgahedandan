import { getDentistSession } from "@/lib/dentist-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DentistSidebar from "@/components/dentist/DentistSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پنل دندانپزشک | ایستگاه دندان",
};

export default async function DentistLayout({ children }: { children: React.ReactNode }) {
  const session = await getDentistSession();
  if (!session) redirect("/dentist/login");

  let dentistSlug: string | null = null;
  if (session.dentistId) {
    const d = await prisma.dentist.findUnique({ where: { id: session.dentistId }, select: { slug: true } });
    dentistSlug = d?.slug ?? null;
  }

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", minHeight: "100vh", display: "flex" }}>
      <DentistSidebar user={{ name: session.name, email: session.email, dentistId: session.dentistId, dentistSlug }} />
      <main style={{ flex: 1, minWidth: 0, padding: "clamp(16px,3vw,32px)", overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
