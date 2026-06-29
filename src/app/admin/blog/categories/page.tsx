import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CategoriesManager from "./CategoriesManager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "دسته‌بندی مقالات | ادمین" };

export default async function AdminBlogCategoriesPage() {
  const cats = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, parentId: true, _count: { select: { posts: true } } },
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>دسته‌بندی مقالات</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#6c8b95" }}>مدیریت دسته‌بندی‌های بلاگ دندانپزشکی</p>
        </div>
        <Link href="/admin/blog" style={{ color: "#6c8b95", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "9px 18px", border: "1px solid #d7eef5", borderRadius: 11 }}>
          ← بازگشت به مقالات
        </Link>
      </div>
      <CategoriesManager initialCats={cats} />
    </div>
  );
}
