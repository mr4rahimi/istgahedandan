import { prisma } from "@/lib/prisma";
import LocationTree from "./LocationTree";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مناطق | ادمین" };

export default async function AdminLocationsPage() {
  const locations = await prisma.location.findMany({
    orderBy: [{ parentId: "asc" }, { order: "asc" }, { title: "asc" }],
    select: { id: true, slug: true, title: true, shortTitle: true, parentId: true, order: true, shortDesc: true, longDesc: true, metaTitle: true, metaDescription: true },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>مدیریت مناطق</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6c8b95" }}>ساختار درختی شهرها و مناطق — هر منطقه می‌تواند زیرمنطقه داشته باشد</p>
        </div>
      </div>
      <LocationTree initialLocations={locations} />
    </div>
  );
}
