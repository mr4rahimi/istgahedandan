import { prisma } from "@/lib/prisma";
import ServicesAdmin from "./ServicesAdmin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "خدمات | ادمین" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true, shortDesc: true, bgGradient: true, order: true, _count: { select: { dentists: true } } },
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>خدمات دندانپزشکی</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6c8b95" }}>مدیریت خدمات و انتساب به دندانپزشکان</p>
      </div>
      <ServicesAdmin initial={services} />
    </div>
  );
}
