import { getDentistSession } from "@/lib/dentist-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "داشبورد | پنل دندانپزشک" };

export default async function DentistDashboardPage() {
  const session = await getDentistSession();
  if (!session) return null;

  const ttlSetting = await prisma.setting.findUnique({ where: { key: "story_ttl_days" } });
  const ttlDays = parseInt(ttlSetting?.value || "7");
  const since = new Date(Date.now() - ttlDays * 24 * 60 * 60 * 1000);

  const [articlesCount, storiesCount, dentist] = await Promise.all([
    prisma.blogPost.count({ where: { authorId: session.id } }),
    session.dentistId ? prisma.dentistStory.count({ where: { dentistId: session.dentistId, createdAt: { gte: since } } }) : Promise.resolve(0),
    session.dentistId ? prisma.dentist.findUnique({ where: { id: session.dentistId }, select: { title: true, slug: true, featuredImage: true, status: true } }) : null,
  ]);

  const stats = [
    { label: "مقالات منتشرشده", value: articlesCount, href: "/dentist/articles", color: "#8b5cf6", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "استوری‌های فعال", value: storiesCount, href: "/dentist/stories", color: "#0c8aa6", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  ];

  const actions = [
    { label: "ویرایش پروفایل", href: "/dentist/profile", desc: "اطلاعات، تصاویر و ساعات کاری", color: "linear-gradient(135deg,#0c8aa6,#0a4f63)" },
    { label: "مدیریت استوری‌ها", href: "/dentist/stories", desc: "آپلود و حذف استوری", color: "linear-gradient(135deg,#0a8f86,#0a3f54)" },
    { label: "نوشتن مقاله جدید", href: "/dentist/articles/new", desc: "انتشار مقاله تخصصی", color: "linear-gradient(135deg,#8b5cf6,#0c5e7c)" },
    { label: "لیست مقالات", href: "/dentist/articles", desc: "مدیریت مقالات منتشرشده", color: "linear-gradient(135deg,#0a6f9e,#5b2171)" },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#133b48" }}>
          سلام، {session.name} 👋
        </h1>
        <p style={{ margin: 0, color: "#6c8b95", fontSize: 15 }}>به پنل مدیریت خوش آمدید</p>
      </div>

      {!session.dentistId && (
        <div style={{ background: "#fff9ed", border: "1px solid #fde68a", borderRadius: 16, padding: "18px 20px", marginBottom: 24, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          <div>
            <div style={{ fontWeight: 700, color: "#92400e", fontSize: 15, marginBottom: 4 }}>پروفایل تخصیص نیافته</div>
            <div style={{ color: "#b45309", fontSize: 13.5, lineHeight: 1.7 }}>
              ادمین هنوز پروفایل کلینیکی به حساب شما اختصاص نداده. لطفاً صبر کنید یا با پشتیبانی تماس بگیرید.
            </div>
          </div>
        </div>
      )}

      {dentist && (
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 18, boxShadow: "0 4px 20px -8px rgba(13,75,107,.15)" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
            {dentist.featuredImage
              ? <img src={dentist.featuredImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>{dentist.title[0]}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#133b48", marginBottom: 4 }}>{dentist.title}</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: dentist.status === "PUBLISHED" ? "#e8f8f0" : "#fef9c3", color: dentist.status === "PUBLISHED" ? "#16a34a" : "#a16207" }}>
              {dentist.status === "PUBLISHED" ? "منتشر" : dentist.status === "HIDDEN" ? "پنهان" : "در انتظار"}
            </span>
          </div>
          <Link href={`/${dentist.slug}`} target="_blank" style={{ color: "#0c8aa6", fontSize: 13.5, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            مشاهده
          </Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, padding: "22px 20px", boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: s.color + "18", display: "grid", placeItems: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.8" strokeLinecap="round"><path d={s.icon} /></svg>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#133b48", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#7a9faa", marginTop: 4 }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "#133b48" }}>دسترسی سریع</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14 }}>
        {actions.map(a => (
          <Link key={a.label} href={a.href} style={{ textDecoration: "none", background: a.color, borderRadius: 18, padding: "22px 20px", color: "#fff", display: "block", transition: "opacity .15s" }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{a.label}</div>
            <div style={{ fontSize: 13, opacity: .8 }}>{a.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
