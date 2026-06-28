import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "دندانپزشکان | ادمین" };

export default async function AdminDentistsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const q = sp.q?.trim() || "";
  const PAGE_SIZE = 20;

  const where = q ? { title: { contains: q, mode: "insensitive" as const } } : {};

  const [total, dentists] = await Promise.all([
    prisma.dentist.count({ where }),
    prisma.dentist.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, title: true, status: true, address: true, createdAt: true },
    }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>دندانپزشکان</h1>
        <span style={{ fontSize: 14, color: "#6c8b95" }}>{total} مرکز</span>
      </div>

      {/* Search */}
      <form style={{ marginBottom: 22, display: "flex", gap: 10 }}>
        <input name="q" defaultValue={q} placeholder="جستجوی نام…" style={{ flex: 1, padding: "11px 14px", border: "1px solid #dceaef", borderRadius: 11, fontFamily: "inherit", fontSize: 14, outline: "none" }} />
        <button type="submit" style={{ background: "#0c8aa6", color: "#fff", border: "none", borderRadius: 11, padding: "0 20px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>جستجو</button>
      </form>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#f8fbfc", borderBottom: "1px solid #e7f0f3" }}>
                <th style={{ padding: "13px 18px", textAlign: "right", fontWeight: 700, color: "#6c8b95", whiteSpace: "nowrap" }}>نام</th>
                <th style={{ padding: "13px 18px", textAlign: "right", fontWeight: 700, color: "#6c8b95", whiteSpace: "nowrap" }}>آدرس</th>
                <th style={{ padding: "13px 18px", textAlign: "center", fontWeight: 700, color: "#6c8b95", whiteSpace: "nowrap" }}>وضعیت</th>
                <th style={{ padding: "13px 18px", textAlign: "center", fontWeight: 700, color: "#6c8b95", whiteSpace: "nowrap" }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {dentists.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: i < dentists.length - 1 ? "1px solid #f1f8fa" : "none" }}>
                  <td style={{ padding: "13px 18px", fontWeight: 600, color: "#143945" }}>{d.title}</td>
                  <td style={{ padding: "13px 18px", color: "#6c8b95" }}>{d.address?.slice(0, 30) || "-"}</td>
                  <td style={{ padding: "13px 18px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: d.status === "PUBLISHED" ? "#f0fdf4" : "#fef2f2", color: d.status === "PUBLISHED" ? "#16a34a" : "#dc2626" }}>
                      {d.status === "PUBLISHED" ? "منتشر" : "پنهان"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <Link href={`/${d.slug}`} target="_blank" style={{ fontSize: 13, color: "#0c8aa6", textDecoration: "none", fontWeight: 600 }}>مشاهده</Link>
                      <Link href={`/admin/dentists/${d.id}`} style={{ fontSize: 13, color: "#6c8b95", textDecoration: "none", fontWeight: 600 }}>ویرایش</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, page - 2) + i;
            if (p > totalPages) return null;
            return (
              <Link key={p} href={`/admin/dentists?page=${p}${q ? `&q=${q}` : ""}`} style={{ width: 38, height: 38, border: p === page ? "none" : "1px solid #d7e6ea", background: p === page ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: p === page ? "#fff" : "#2a4f5b", borderRadius: 10, display: "grid", placeItems: "center", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
