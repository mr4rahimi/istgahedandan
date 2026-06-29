import { prisma } from "@/lib/prisma";
import { toJalali } from "@/lib/utils";
import ReviewActions from "./ReviewActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "نظرات | ادمین" };

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = sp.status || "pending";
  const page = Math.max(1, parseInt(sp.page || "1"));
  const PAGE_SIZE = 20;

  const approved = status === "approved";
  const [total, reviews] = await Promise.all([
    prisma.review.count({ where: { approved, parentId: null } }),
    prisma.review.findMany({
      where: { approved, parentId: null },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const reviewIds = reviews.map(r => r.id);
  const dentists = reviews.filter(r => r.dentistId).map(r => r.dentistId!);
  const [dentistData, replies] = await Promise.all([
    dentists.length > 0 ? prisma.dentist.findMany({ where: { id: { in: dentists } }, select: { id: true, title: true, slug: true } }) : [],
    reviewIds.length > 0 ? prisma.review.findMany({ where: { parentId: { in: reviewIds } }, orderBy: { createdAt: "asc" } }) : [],
  ]);
  const dentistMap = new Map(dentistData.map(d => [d.id, d]));
  type ReviewRow = (typeof replies)[number];
  const repliesMap = new Map<number, ReviewRow[]>();
  for (const rep of replies) {
    if (!rep.parentId) continue;
    if (!repliesMap.has(rep.parentId)) repliesMap.set(rep.parentId, []);
    repliesMap.get(rep.parentId)!.push(rep);
  }
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>نظرات کاربران</h1>
        <span style={{ fontSize: 14, color: "#6c8b95" }}>{total} نظر</span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["pending", "در انتظار تأیید"], ["approved", "تأیید شده"]].map(([s, label]) => (
          <a key={s} href={`/admin/reviews?status=${s}`} style={{ padding: "9px 18px", borderRadius: 11, fontWeight: 600, fontSize: 14, textDecoration: "none", background: status === s ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: status === s ? "#fff" : "#6c8b95", border: status === s ? "none" : "1px solid #e7f0f3" }}>
            {label}
          </a>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {reviews.map(r => {
          const dentist = r.dentistId ? dentistMap.get(r.dentistId) : null;
          const reviewReplies = repliesMap.get(r.id) ?? [];
          return (
          <div key={r.id} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px -16px rgba(13,75,107,.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#143945" }}>{r.authorName}</span>
                {r.authorEmail && <span style={{ fontSize: 13, color: "#9bb6bf", marginRight: 10 }}>{r.authorEmail}</span>}
                {dentist && <a href={`/${dentist.slug}`} target="_blank" style={{ fontSize: 13, color: "#0c8aa6", textDecoration: "none", marginRight: 10 }}>— {dentist.title}</a>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {r.rating && (
                  <span style={{ fontSize: 14, color: "#f59e0b", fontWeight: 700 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                )}
                <span style={{ fontSize: 12, color: "#9bb6bf" }}>{toJalali(r.createdAt)}</span>
              </div>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: "#4a6e7a", lineHeight: 1.8, whiteSpace: "pre-line" }}>{r.content}</p>
            <ReviewActions reviewId={r.id} approved={r.approved} content={r.content} />
            {reviewReplies.length > 0 && (
              <div style={{ marginTop: 14, borderTop: "1px solid #eef4f6", paddingTop: 12 }}>
                <div style={{ fontSize: 12.5, color: "#8aa6af", marginBottom: 8 }}>پاسخ‌ها ({reviewReplies.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {reviewReplies.map(rep => (
                    <div key={rep.id} style={{ background: "#f7fbfc", border: "1px solid #eef4f6", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#143945" }}>{rep.authorName}</span>
                        <span style={{ fontSize: 12, color: "#9bb6bf" }}>{toJalali(rep.createdAt)}</span>
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: 13.5, color: "#4a6e7a", lineHeight: 1.7, whiteSpace: "pre-line" }}>{rep.content}</p>
                      <ReviewActions reviewId={rep.id} approved={rep.approved} content={rep.content} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          );
        })}
        {reviews.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9bb6bf", fontSize: 16 }}>نظری وجود ندارد.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, page - 2) + i;
            if (p > totalPages) return null;
            return (
              <a key={p} href={`/admin/reviews?status=${status}&page=${p}`} style={{ width: 38, height: 38, border: p === page ? "none" : "1px solid #d7e6ea", background: p === page ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: p === page ? "#fff" : "#2a4f5b", borderRadius: 10, display: "grid", placeItems: "center", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                {p}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
