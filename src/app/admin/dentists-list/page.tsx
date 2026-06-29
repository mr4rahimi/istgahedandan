import { prisma } from "@/lib/prisma";
import DentistsListAdmin from "./DentistsListAdmin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "لیست دندانپزشکان | ادمین" };

const KEYS = [
  "dl_short_desc", "dl_long_desc", "dl_popular_count",
  "dl_main_city_ids", "dl_region_ids", "dl_featured_ids",
  "dl_banner_image", "dl_banner_title", "dl_banner_link",
  "dl_faqs", "dl_meta_title", "dl_meta_desc",
];

export default async function AdminDentistsListPage() {
  const [settingRows, locations, dentists] = await Promise.all([
    prisma.setting.findMany({ where: { key: { in: KEYS } } }),
    prisma.location.findMany({ orderBy: [{ parentId: "asc" }, { order: "asc" }], select: { id: true, title: true, shortTitle: true, parentId: true } }),
    prisma.dentist.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  const settings: Record<string, string> = {};
  for (const row of settingRows) settings[row.key] = row.value;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>مدیریت صفحه لیست دندانپزشکان</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6c8b95" }}>تنظیمات صفحه /dentists-list</p>
      </div>
      <DentistsListAdmin settings={settings} locations={locations} dentists={dentists} />
    </div>
  );
}
