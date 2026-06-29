import { getDentistSession } from "@/lib/dentist-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toJalali } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مقالات | پنل دندانپزشک" };

export default async function DentistArticlesPage() {
  const session = await getDentistSession();
  if (!session) redirect("/dentist/login");

  const posts = await prisma.blogPost.findMany({
    where: { authorId: session.id },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#133b48" }}>مقالات من</h1>
        <Link href="/dentist/articles/new" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14.5, padding: "11px 20px", borderRadius: 13, boxShadow: "0 6px 16px -4px rgba(12,138,166,.5)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          مقاله جدید
        </Link>
      </div>

      {posts.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: "60px 24px", textAlign: "center", boxShadow: "0 4px 20px -8px rgba(13,75,107,.1)" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c5d8df" strokeWidth="1.4" strokeLinecap="round" style={{ display: "block", margin: "0 auto 16px" }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          <p style={{ color: "#9bb6bf", fontSize: 15, margin: 0 }}>هنوز مقاله‌ای ننوشته‌اید</p>
          <Link href="/dentist/articles/new" style={{ display: "inline-block", marginTop: 16, color: "#0c8aa6", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>اولین مقاله را بنویسید ←</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map(p => (
            <div key={p.id} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 12px -4px rgba(13,75,107,.1)", display: "flex", alignItems: "center", gap: 16 }}>
              {p.featuredImage && <img src={p.featuredImage} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: "#133b48", marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  {p.category && <span style={{ fontSize: 12, background: "#eef7fa", color: "#0c8aa6", fontWeight: 600, padding: "2px 9px", borderRadius: 20 }}>{p.category.name}</span>}
                  <span style={{ fontSize: 12.5, color: "#9bb6bf" }}>{p.publishedAt ? toJalali(p.publishedAt) : "پیش‌نویس"}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link href={`/dentist/articles/${p.id}/edit`} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 14px", border: "1px solid #dceaef", borderRadius: 10, color: "#2a4f5b", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  ویرایش
                </Link>
                <Link href={`/${p.slug}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 14px", border: "1px solid #dceaef", borderRadius: 10, color: "#0c8aa6", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                  مشاهده
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
