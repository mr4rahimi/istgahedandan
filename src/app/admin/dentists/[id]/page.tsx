import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DentistEditForm from "./DentistEditForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش دندانپزشک | ادمین" };

export default async function DentistEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dentist = await prisma.dentist.findUnique({ where: { id: parseInt(id) } });
  if (!dentist) notFound();

  const locations = await prisma.location.findMany({ select: { id: true, title: true } });
  const linked = await prisma.dentistLocation.findMany({ where: { dentistId: dentist.id }, select: { locationId: true } });
  const linkedIds = linked.map(l => l.locationId);

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ margin: "0 0 28px", fontSize: 22, fontWeight: 800, color: "#133b48" }}>ویرایش: {dentist.title}</h1>
      <DentistEditForm dentist={{
        ...dentist,
        socialLinks: dentist.socialLinks as Record<string, string> | null,
      }} locations={locations} linkedIds={linkedIds} />
    </div>
  );
}
