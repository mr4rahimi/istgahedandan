import { prisma } from "@/lib/prisma";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مدیریت کاربران دندانپزشک | ادمین" };

export default async function AdminUsersPage() {
  const [users, dentists] = await Promise.all([
    prisma.dentistUser.findMany({
      include: { dentist: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dentist.findMany({ where: { user: null }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  return <AdminUsersManager initialUsers={users as Parameters<typeof AdminUsersManager>[0]["initialUsers"]} unassignedDentists={dentists} />;
}
