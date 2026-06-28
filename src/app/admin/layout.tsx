import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "پنل مدیریت | ایستگاه دندان",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", minHeight: "100vh", display: "flex" }}>
      <AdminSidebar user={{ name: session.name, email: session.email }} />
      <main style={{ flex: 1, minWidth: 0, padding: "clamp(16px,3vw,32px)", overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
