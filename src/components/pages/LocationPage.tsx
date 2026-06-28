import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { getInitial, gradientFromId } from "@/lib/utils";

export default async function LocationPage({ slug }: { slug: string }) {
  const location = await prisma.location.findUnique({ where: { slug } });
  if (!location) notFound();

  const [dentistLinks, faqs, otherLocations] = await Promise.all([
    prisma.dentistLocation.findMany({
      where: { locationId: location.id },
      include: {
        dentist: {
          select: {
            id: true,
            slug: true,
            title: true,
            shortDesc: true,
            address: true,
          },
        },
      },
      take: 18,
    }),
    prisma.fAQ.findMany({ where: { locationId: location.id }, orderBy: { order: "asc" } }),
    prisma.location.findMany({
      where: { slug: { not: slug } },
      take: 8,
      select: { slug: true, title: true },
    }),
  ]);

  const dentistIds = dentistLinks.map(dl => dl.dentist.id);
  const reviewCounts = await prisma.review.groupBy({
    by: ["dentistId"],
    where: { dentistId: { in: dentistIds }, approved: true },
    _count: { id: true },
    _avg: { rating: true },
  });
  const reviewMap = new Map(reviewCounts.map(r => [r.dentistId, r]));

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, left: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(21,184,209,.28), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "50px 20px 42px", position: "relative" }}>
          <nav style={{ fontSize: 13, color: "#8fb6c0", marginBottom: 14 }}>
            <Link href="/" style={{ color: "#8fb6c0", textDecoration: "none" }}>خانه</Link>
            {" › دندانپزشکان › "}{location.title}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "clamp(26px,4vw,40px)", fontWeight: 800 }}>دندانپزشکی در {location.title}</h1>
            <span style={{ background: "rgba(255,255,255,.16)", padding: "6px 14px", borderRadius: 30, fontSize: 14, fontWeight: 600 }}>{dentistLinks.length} مرکز</span>
          </div>
          {location.shortDesc && <p style={{ margin: "14px 0 0", maxWidth: 640, fontSize: 15.5, lineHeight: 2, color: "#c4dde4" }}>{location.shortDesc}</p>}
        </div>
      </section>

      {/* Location Filter */}
      {otherLocations.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 6px" }}>
          <div className="ih-hide-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
            <Link href={`/${slug}`} style={{ border: "none", background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "9px 18px", borderRadius: 30, whiteSpace: "nowrap", flexShrink: 0 }}>{location.title}</Link>
            {otherLocations.map(loc => (
              <Link key={loc.slug} href={`/${loc.slug}`} style={{ border: "1px solid #d2e8ee", background: "#fff", color: "#2a4f5b", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "9px 18px", borderRadius: 30, whiteSpace: "nowrap", flexShrink: 0 }}>{loc.title}</Link>
            ))}
          </div>
        </section>
      )}

      {/* Dentist Grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 16px" }}>
        {dentistLinks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6c8b95", fontSize: 16, padding: "40px 0" }}>هنوز دندانپزشکی در این منطقه ثبت نشده است.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {dentistLinks.map(({ dentist: d }, i) => {
              const stats = reviewMap.get(d.id);
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

      {/* Long Description */}
      {location.longDesc && (
        <section style={{ maxWidth: 1280, margin: "18px auto", padding: "0 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(24px,3vw,40px)", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#133b48" }}>دندانپزشکی خوب در {location.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: location.longDesc }} style={{ fontSize: 15.5, lineHeight: 2.15, color: "#41616b" }} />
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "30px 16px 50px" }}>
          <h2 style={{ margin: "0 0 22px", fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: "#133b48", textAlign: "center" }}>سوالات متداول</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map(faq => (
              <details key={faq.id} style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 26px -24px rgba(13,75,107,.5)" }}>
                <summary style={{ padding: "19px 20px", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#143945", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {faq.question}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="6" x2="12" y2="18" /><line x1="6" y1="12" x2="18" y2="12" /></svg>
                </summary>
                <div style={{ padding: "0 20px 20px", fontSize: 14.5, lineHeight: 2.05, color: "#5e7c85" }}>{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
}
