import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toJalali } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مقالات | ادمین" };

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const q = sp.q?.trim() || "";
  const PAGE_SIZE = 20;

  const where = q ? { title: { contains: q, mode: "insensitive" as const } } : {};

  const [total, posts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>مقالات</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "#6c8b95" }}>{total} مقاله</span>
          <Link href="/admin/blog/new" style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: "9px 18px", borderRadius: 11 }}>+ مقاله جدید</Link>
        </div>
      </div>

      <form style={{ marginBottom: 22, display: "flex", gap: 10 }}>
        <input name="q" defaultValue={q} placeholder="جستجوی عنوان…" style={{ flex: 1, padding: "11px 14px", border: "1px solid #dceaef", borderRadius: 11, fontFamily: "inherit", fontSize: 14, outline: "none" }} />
        <button type="submit" style={{ background: "#0c8aa6", color: "#fff", border: "none", borderRadius: 11, padding: "0 20px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>جستجو</button>
      </form>

      <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fbfc", borderBottom: "1px solid #e7f0f3" }}>
                <th style={{ padding: "13px 18px", textAlign: "right", fontWeight: 700, color: "#6c8b95" }}>عنوان</th>
                <th style={{ padding: "13px 18px", textAlign: "right", fontWeight: 700, color: "#6c8b95", whiteSpace: "nowrap" }}>دسته‌بندی</th>
                <th style={{ padding: "13px 18px", textAlign: "center", fontWeight: 700, color: "#6c8b95", whiteSpace: "nowrap" }}>تاریخ</th>
                <th style={{ padding: "13px 18px", textAlign: "center", fontWeight: 700, color: "#6c8b95", whiteSpace: "nowrap" }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < posts.length - 1 ? "1px solid #f1f8fa" : "none" }}>
                  <td style={{ padding: "13px 18px", fontWeight: 600, color: "#143945", lineHeight: 1.5 }}>{p.title}</td>
                  <td style={{ padding: "13px 18px", color: "#6c8b95" }}>{p.category?.name || "—"}</td>
                  <td style={{ padding: "13px 18px", textAlign: "center", color: "#9bb6bf", fontSize: 13, whiteSpace: "nowrap" }}>{p.publishedAt ? toJalali(p.publishedAt) : "—"}</td>
                  <td style={{ padding: "13px 18px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <Link href={`/${p.slug}`} target="_blank" style={{ fontSize: 13, color: "#0c8aa6", textDecoration: "none", fontWeight: 600 }}>مشاهده</Link>
                      <Link href={`/admin/blog/${p.id}`} style={{ fontSize: 13, color: "#6c8b95", textDecoration: "none", fontWeight: 600 }}>ویرایش</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, page - 2) + i;
            if (p > totalPages) return null;
            return (
              <Link key={p} href={`/admin/blog?page=${p}${q ? `&q=${q}` : ""}`} style={{ width: 38, height: 38, border: p === page ? "none" : "1px solid #d7e6ea", background: p === page ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: p === page ? "#fff" : "#2a4f5b", borderRadius: 10, display: "grid", placeItems: "center", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
