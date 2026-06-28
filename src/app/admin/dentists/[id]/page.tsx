import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DentistAdminTabs from "./DentistAdminTabs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش دندانپزشک | ادمین" };

export default async function DentistEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dentist = await prisma.dentist.findUnique({ where: { id: parseInt(id) } });
  if (!dentist) notFound();

  const [allLocations, allServices, stories, videos, linkedLocationIds, linkedServiceIds] = await Promise.all([
    prisma.location.findMany({ select: { id: true, title: true } }),
    prisma.service.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    prisma.dentistStory.findMany({ where: { dentistId: dentist.id }, orderBy: { order: "asc" } }),
    prisma.dentistVideo.findMany({ where: { dentistId: dentist.id }, orderBy: { order: "asc" } }),
    prisma.dentistLocation.findMany({ where: { dentistId: dentist.id }, select: { locationId: true } }),
    prisma.dentistService.findMany({ where: { dentistId: dentist.id }, select: { serviceId: true } }),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#133b48" }}>ویرایش: {dentist.title}</h1>
        <a href={`/${dentist.slug}`} target="_blank" style={{ fontSize: 13, color: "#0c8aa6", textDecoration: "none" }}>مشاهده در سایت ↗</a>
      </div>
      <DentistAdminTabs
        dentist={{
          id: dentist.id,
          slug: dentist.slug,
          title: dentist.title,
          shortDesc: dentist.shortDesc || "",
          longDesc: dentist.longDesc || "",
          address: dentist.address || "",
          phones: (dentist.phones as string[]) || [],
          whatsapp: dentist.whatsapp || "",
          telegram: dentist.telegram || "",
          instagram: dentist.instagram || "",
          workingHours: String(dentist.workingHours || ""),
          mapLat: dentist.mapLat?.toString() || "",
          mapLng: dentist.mapLng?.toString() || "",
          centerCode: dentist.centerCode || "",
          featuredImage: dentist.featuredImage || "",
          gallery: (dentist.gallery as string[]) || [],
          metaTitle: dentist.metaTitle || "",
          metaDescription: dentist.metaDescription || "",
          status: dentist.status,
        }}
        stories={stories}
        videos={videos}
        allLocations={allLocations}
        allServices={allServices}
        linkedLocationIds={linkedLocationIds.map(l => l.locationId)}
        linkedServiceIds={linkedServiceIds.map(s => s.serviceId)}
      />
    </div>
  );
}
