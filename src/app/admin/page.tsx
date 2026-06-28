import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "داشبورد | ایستگاه دندان" };

export default async function AdminDashboard() {
  const [dentistCount, blogCount, pendingReviews, approvedReviews] = await Promise.all([
    prisma.dentist.count(),
    prisma.blogPost.count(),
    prisma.review.count({ where: { approved: false } }),
    prisma.review.count({ where: { approved: true } }),
  ]);

  const recentDentists = await prisma.dentist.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, status: true, createdAt: true },
  });

  const recentReviews = await prisma.review.findMany({
    take: 5,
    where: { approved: false },
    orderBy: { createdAt: "desc" },
    include: { dentist: { select: { title: true } } },
  });

  const cards = [
    { label: "دندانپزشک", value: dentistCount, href: "/admin/dentists", color: "#0c8aa6", bg: "#eef7fa" },
    { label: "مقاله", value: blogCount, href: "/admin/blog", color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "نظر تأیید شده", value: approvedReviews, href: "/admin/reviews", color: "#16a34a", bg: "#f0fdf4" },
    { label: "نظر در انتظار", value: pendingReviews, href: "/admin/reviews", color: "#d97706", bg: "#fffbeb" },
  ];

  return (
    <div>
      <h1 style={{ margin: "0 0 28px", fontSize: 26, fontWeight: 800, color: "#133b48" }}>داشبورد</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18, marginBottom: 36 }}>
        {cards.map(c => (
          <Link key={c.label} href={c.href} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: 22, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)", display: "block" }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6c8b95", marginTop: 8 }}>{c.label}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>

        {/* Recent Dentists */}
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: 24, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#133b48" }}>آخرین دندانپزشکان</h2>
            <Link href="/admin/dentists" style={{ color: "#0c8aa6", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>همه</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentDentists.map(d => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f8fa" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#143945" }}>{d.title}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 8, background: d.status === "PUBLISHED" ? "#f0fdf4" : "#fef2f2", color: d.status === "PUBLISHED" ? "#16a34a" : "#dc2626" }}>
                  {d.status === "PUBLISHED" ? "منتشر" : "پنهان"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reviews */}
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: 24, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#133b48" }}>نظرات در انتظار تأیید</h2>
            <Link href="/admin/reviews" style={{ color: "#0c8aa6", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>همه</Link>
          </div>
          {recentReviews.length === 0 ? (
            <p style={{ margin: 0, color: "#6c8b95", fontSize: 14 }}>نظر در انتظار تأیید وجود ندارد.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentReviews.map(r => (
                <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid #f1f8fa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#143945" }}>{r.authorName}</span>
                    <span style={{ fontSize: 12, color: "#9bb6bf" }}>{r.dentist?.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#6c8b95", lineHeight: 1.7 }}>{r.content.slice(0, 80)}…</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
