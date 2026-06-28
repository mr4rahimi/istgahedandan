import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { getInitial, gradientFromId } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لیست دندانپزشکان | ایستگاه دندان",
  description: "لیست کامل بهترین کلینیک‌ها و دندانپزشکان ایران همراه با امتیاز و نظرات کاربران.",
};

const PAGE_SIZE = 12;

export default async function DentistsPage({ searchParams }: { searchParams: Promise<{ page?: string; location?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1"));
  const locationFilter = sp.location;

  let locationId: number | undefined;
  if (locationFilter) {
    const loc = await prisma.location.findUnique({ where: { slug: locationFilter }, select: { id: true } });
    locationId = loc?.id;
  }

  const [locations, total, dentists] = await Promise.all([
    prisma.location.findMany({ take: 12, select: { slug: true, title: true } }),
    locationId
      ? prisma.dentistLocation.count({ where: { locationId } })
      : prisma.dentist.count({ where: { status: "PUBLISHED" } }),
    locationId
      ? prisma.dentistLocation.findMany({
          where: { locationId },
          include: { dentist: true },
          take: PAGE_SIZE,
          skip: (page - 1) * PAGE_SIZE,
        }).then(links => links.map(l => l.dentist))
      : prisma.dentist.findMany({
          where: { status: "PUBLISHED" },
          take: PAGE_SIZE,
          skip: (page - 1) * PAGE_SIZE,
          orderBy: { order: "desc" },
        }),
  ]);

  const dentistIds = dentists.map(d => d.id);
  const reviewStats = await prisma.review.groupBy({
    by: ["dentistId"],
    where: { dentistId: { in: dentistIds }, approved: true },
    _count: { id: true },
    _avg: { rating: true },
  });
  const statsMap = new Map(reviewStats.map(r => [r.dentistId, r]));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, left: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(21,184,209,.28), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "50px 20px 42px", position: "relative" }}>
          <nav style={{ fontSize: 13, color: "#8fb6c0", marginBottom: 14 }}>
            <Link href="/" style={{ color: "#8fb6c0", textDecoration: "none" }}>خانه</Link>
            {" › "}دندانپزشکان
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "clamp(26px,4vw,40px)", fontWeight: 800 }}>لیست دندانپزشکان ایران</h1>
            <span style={{ background: "rgba(255,255,255,.16)", padding: "6px 14px", borderRadius: 30, fontSize: 14, fontWeight: 600 }}>{total} مرکز</span>
          </div>
          <p style={{ margin: "14px 0 0", maxWidth: 640, fontSize: 15.5, lineHeight: 2, color: "#c4dde4" }}>لیست کامل بهترین کلینیک‌ها و دندانپزشکان سراسر ایران همراه با امتیاز و نظرات کاربران.</p>
        </div>
      </section>

      {/* Location Filter */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 6px" }}>
        <div className="ih-hide-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          <Link href="/دندانپزشکان" style={{ border: !locationFilter ? "none" : "1px solid #d2e8ee", background: !locationFilter ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: !locationFilter ? "#fff" : "#2a4f5b", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "9px 18px", borderRadius: 30, whiteSpace: "nowrap", flexShrink: 0 }}>همه مناطق</Link>
          {locations.map(loc => (
            <Link key={loc.slug} href={`/دندانپزشکان?location=${loc.slug}`} style={{ border: locationFilter === loc.slug ? "none" : "1px solid #d2e8ee", background: locationFilter === loc.slug ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: locationFilter === loc.slug ? "#fff" : "#2a4f5b", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "9px 18px", borderRadius: 30, whiteSpace: "nowrap", flexShrink: 0 }}>{loc.title}</Link>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 16px" }}>
        {dentists.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6c8b95", fontSize: 16, padding: "40px 0" }}>دندانپزشکی پیدا نشد.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {dentists.map((d, i) => {
              const stats = statsMap.get(d.id);
              const reviewCount = stats?._count.id ?? 0;
              const avgRating = stats?._avg.rating ?? 0;
              const initial = getInitial(d.title);
              return (
                <Link key={d.slug} href={`/${d.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: 18, boxShadow: "0 14px 34px -28px rgba(13,75,107,.5)", display: "block" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0, background: gradientFromId(i), display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>{initial}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: "#143945" }}>{d.title}</h3>
                      <p style={{ margin: "3px 0 8px", fontSize: 13, color: "#6c8b95" }}>{d.shortDesc?.slice(0, 40) || "دندانپزشکی"}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        {avgRating > 0 && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff6e6", color: "#d98a00", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 7 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
                            {avgRating.toFixed(1)}
                          </span>
                        )}
                        {reviewCount > 0 && <span style={{ color: "#6c8b95", fontSize: 12.5 }}>{reviewCount} نظر</span>}
                      </div>
                    </div>
                  </div>
                  {d.shortDesc && <p style={{ margin: "14px 0 14px", fontSize: 13.5, lineHeight: 1.9, color: "#5e7c85" }}>{d.shortDesc.slice(0, 80)}</p>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid #eef4f6" }}>
                    {d.address && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#6c8b95", fontSize: 13 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {d.address.slice(0, 25)}
                      </span>
                    )}
                    <span style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 13.5, marginRight: "auto" }}>پروفایل ←</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 16px 46px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {page > 1 && (
              <Link href={`/دندانپزشکان?page=${page - 1}${locationFilter ? `&location=${locationFilter}` : ""}`} style={{ width: 42, height: 42, border: "1px solid #d7e6ea", background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", textDecoration: "none", color: "#2a4f5b" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 6 15 12 9 18" /></svg>
              </Link>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              const p = Math.max(1, page - 2) + idx;
              if (p > totalPages) return null;
              return (
                <Link key={p} href={`/دندانپزشکان?page=${p}${locationFilter ? `&location=${locationFilter}` : ""}`} style={{ width: 42, height: 42, border: p === page ? "none" : "1px solid #d7e6ea", background: p === page ? "linear-gradient(135deg,#15b8d1,#0a6f9e)" : "#fff", color: p === page ? "#fff" : "#2a4f5b", borderRadius: 12, display: "grid", placeItems: "center", textDecoration: "none", fontWeight: 700 }}>
                  {p}
                </Link>
              );
            })}
            {page < totalPages && (
              <Link href={`/دندانپزشکان?page=${page + 1}${locationFilter ? `&location=${locationFilter}` : ""}`} style={{ width: 42, height: 42, border: "1px solid #d7e6ea", background: "#fff", borderRadius: 12, display: "grid", placeItems: "center", textDecoration: "none", color: "#2a4f5b" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="15 6 9 12 15 18" /></svg>
              </Link>
            )}
          </div>
        </section>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
}
