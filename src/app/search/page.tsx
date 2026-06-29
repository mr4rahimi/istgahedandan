import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import LiveSearch from "@/components/LiveSearch";
import { toJalali, estimateReadTime } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  return { title: q ? `جستجوی "${q}" | ایستگاه دندان` : "جستجو | ایستگاه دندان" };
}

const GRADIENTS = [
  "linear-gradient(135deg,#0c8aa6,#0a4f63)",
  "linear-gradient(135deg,#0a6f9e,#5b2171)",
  "linear-gradient(135deg,#0a8f86,#0a3f54)",
  "linear-gradient(135deg,#8b5cf6,#0c5e7c)",
  "linear-gradient(135deg,#0ea5e9,#0a3f54)",
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";

  if (!q) {
    return (
      <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", minHeight: "100vh", paddingBottom: 80 }}>
        <Header />
        <section style={{ maxWidth: 720, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#133b48", margin: "0 0 12px" }}>جستجو</h1>
          <p style={{ color: "#6c8b95", fontSize: 16, marginBottom: 32 }}>نام دندانپزشک، کلینیک، خدمت یا منطقه را وارد کنید</p>
          <LiveSearch placeholder="مثلاً: ایمپلنت، دکتر احمدی، نیاوران…" autoFocus />
        </section>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  const [dentistsRaw, services, articles] = await Promise.all([
    prisma.dentist.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortDesc: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, slug: true, title: true, shortDesc: true, featuredImage: true, address: true },
      take: 48,
      orderBy: { order: "asc" },
    }),
    prisma.service.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortDesc: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 12,
    }),
    prisma.blogPost.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 12,
      include: { category: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  // Compute ratings for matched dentists
  const dentistIds = dentistsRaw.map(d => d.id);
  const reviews = dentistIds.length
    ? await prisma.review.findMany({
        where: { dentistId: { in: dentistIds }, approved: true, rating: { not: null }, parentId: null },
        select: { dentistId: true, rating: true },
      })
    : [];

  const rMap = new Map<number, { sum: number; count: number }>();
  for (const r of reviews) {
    if (!r.dentistId || !r.rating) continue;
    const cur = rMap.get(r.dentistId) ?? { sum: 0, count: 0 };
    cur.sum += r.rating; cur.count++;
    rMap.set(r.dentistId, cur);
  }

  const dentists = dentistsRaw.map(d => {
    const rd = rMap.get(d.id);
    return { ...d, avgRating: rd ? rd.sum / rd.count : null, reviewCount: rd?.count ?? 0 };
  });

  const total = dentists.length + services.length + articles.length;

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: -50, width: 280, height: 280, background: "radial-gradient(circle,rgba(21,184,209,.25),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 20px 28px", position: "relative" }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#7ab8c5" }}>
            <Link href="/" style={{ color: "#7ab8c5", textDecoration: "none" }}>خانه</Link> › جستجو
          </p>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 800 }}>
            نتایج جستجو برای «{q}»
          </h1>
          <p style={{ margin: "0 0 20px", color: "#9fc2cc", fontSize: 14.5 }}>
            {total} نتیجه پیدا شد
          </p>
          {/* Re-search bar */}
          <div style={{ maxWidth: 560 }}>
            <LiveSearch placeholder={q} />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 16px" }}>

        {/* Dentists */}
        {dentists.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M12 2c-1.5 0-2.7 1-3.3 2.4C8 6 7.5 8 7.5 10.5c0 3 .8 7 2 9 .5.8 1.3 1.2 2 .6.4-.4.6-1.3.7-2.4.2-1.6.3-2.7 1.8-2.7s1.6 1.1 1.8 2.7c.1 1.1.3 2 .7 2.4.7.6 1.5.2 2-.6 1.2-2 2-6 2-9 0-2.5-.5-4.5-1.2-6.1C14.7 3 13.5 2 12 2z" /></svg>
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(18px,2.4vw,24px)", fontWeight: 800, color: "#133b48" }}>
                دندانپزشکان
                <span style={{ marginRight: 8, fontSize: 14, fontWeight: 600, color: "#9bb6bf", background: "#eef4f6", borderRadius: 20, padding: "2px 10px" }}>{dentists.length} نتیجه</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {dentists.map((d, i) => (
                <div key={d.slug} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px -8px rgba(13,75,107,.15)", display: "flex", flexDirection: "column" }}>
                  {/* Image header */}
                  <div style={{ position: "relative", height: 130, background: GRADIENTS[i % GRADIENTS.length], flexShrink: 0 }}>
                    {d.featuredImage ? (
                      <Image src={d.featuredImage} alt={d.title} fill style={{ objectFit: "cover" }} sizes="(max-width:640px) 100vw, 320px" />
                    ) : (
                      <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
                        <span style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>{d.title[0]}</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 40%,rgba(8,40,55,.6))" }} />
                    {d.avgRating && d.avgRating > 0 && (
                      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 3, background: "rgba(0,0,0,.45)", backdropFilter: "blur(6px)", color: "#fbbf24", fontSize: 12.5, fontWeight: 800, padding: "3px 9px", borderRadius: 20 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
                        {d.avgRating.toFixed(1)}
                        <span style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 500 }}>({d.reviewCount})</span>
                      </div>
                    )}
                  </div>
                  {/* Body */}
                  <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1, gap: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: "#133b48", lineHeight: 1.5 }}>{d.title}</h3>
                    {d.address && (
                      <p style={{ margin: 0, fontSize: 12.5, color: "#8aabb5", display: "flex", gap: 4, alignItems: "flex-start", lineHeight: 1.6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {d.address.slice(0, 55)}{d.address.length > 55 ? "…" : ""}
                      </p>
                    )}
                    {d.shortDesc && (
                      <p style={{ margin: 0, fontSize: 13, color: "#6c8b95", lineHeight: 1.8, flex: 1 }}>
                        {d.shortDesc.slice(0, 80)}{d.shortDesc.length > 80 ? "…" : ""}
                      </p>
                    )}
                    <Link href={`/${d.slug}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 4, padding: "10px", background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
                      مشاهده پروفایل
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#0a8f86,#0a3f54)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(18px,2.4vw,24px)", fontWeight: 800, color: "#133b48" }}>
                خدمات
                <span style={{ marginRight: 8, fontSize: 14, fontWeight: 600, color: "#9bb6bf", background: "#eef4f6", borderRadius: 20, padding: "2px 10px" }}>{services.length} نتیجه</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {services.map((s) => (
                <Link key={s.slug} href={`/${s.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: "18px 20px", boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)", display: "flex", alignItems: "center", gap: 14, transition: "box-shadow .2s" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0a8f86,#0a3f54)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#133b48", fontSize: 15, marginBottom: 4 }}>{s.title}</div>
                    {s.shortDesc && <div style={{ fontSize: 12.5, color: "#6c8b95", lineHeight: 1.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.shortDesc}</div>}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c5d8df" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#8b5cf6,#0c5e7c)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(18px,2.4vw,24px)", fontWeight: 800, color: "#133b48" }}>
                مقالات
                <span style={{ marginRight: 8, fontSize: 14, fontWeight: 600, color: "#9bb6bf", background: "#eef4f6", borderRadius: 20, padding: "2px 10px" }}>{articles.length} نتیجه</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {articles.map(a => (
                <Link key={a.slug} href={`/${a.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, padding: "18px 20px", boxShadow: "0 4px 20px -8px rgba(13,75,107,.12)", display: "block" }}>
                  {a.category && (
                    <span style={{ display: "inline-block", background: "#f0ecff", color: "#7c4fcf", fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, marginBottom: 10 }}>{a.category.name}</span>
                  )}
                  <div style={{ fontWeight: 700, color: "#133b48", fontSize: 15, marginBottom: 8, lineHeight: 1.6 }}>{a.title}</div>
                  <div style={{ display: "flex", gap: 14, color: "#9bb6bf", fontSize: 12.5, alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="6" x2="12" y2="12" /><line x1="12" y1="12" x2="16" y2="14" /></svg>
                      {estimateReadTime(a.content || "")} دقیقه مطالعه
                    </span>
                    {a.publishedAt && <span>{toJalali(a.publishedAt)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {total === 0 && (
          <div style={{ textAlign: "center", padding: "70px 0" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eef4f6", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c5d8df" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#133b48", margin: "0 0 10px" }}>نتیجه‌ای یافت نشد</h2>
            <p style={{ color: "#6c8b95", fontSize: 15, margin: "0 0 28px" }}>عبارت دیگری را امتحان کنید یا از لیست کامل استفاده کنید.</p>
            <Link href="/dentists-list" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#0c8aa6,#0a4f63)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 13 }}>
              لیست کامل دندانپزشکان
            </Link>
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
