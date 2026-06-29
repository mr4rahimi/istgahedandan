import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { getInitial, gradientFromId } from "@/lib/utils";

interface BreadcrumbItem { id: number; slug: string; label: string }

function buildBreadcrumb(
  locationId: number,
  locationMap: Map<number, { id: number; slug: string; shortTitle: string | null; title: string; parentId: number | null }>
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  let cur = locationMap.get(locationId);
  while (cur) {
    items.unshift({ id: cur.id, slug: cur.slug, label: cur.shortTitle || cur.title });
    cur = cur.parentId ? locationMap.get(cur.parentId) : undefined;
  }
  return items;
}

export default async function LocationPage({ slug }: { slug: string }) {
  const location = await prisma.location.findUnique({ where: { slug } });
  if (!location) notFound();

  // Fetch all locations to build breadcrumb and sub-region chips
  const allLocations = await prisma.location.findMany({
    select: { id: true, slug: true, title: true, shortTitle: true, parentId: true, order: true },
    orderBy: { order: "asc" },
  });
  const locationMap = new Map(allLocations.map(l => [l.id, l]));

  // Direct children = sub-regions shown in filter chips
  const children = allLocations
    .filter(l => l.parentId === location.id)
    .sort((a, b) => a.order - b.order);

  // Breadcrumb chain
  const breadcrumb = buildBreadcrumb(location.id, locationMap);

  // Dentists in this location
  const dentistLinks = await prisma.dentistLocation.findMany({
    where: { locationId: location.id },
    take: 24,
    select: { dentistId: true },
  });
  const dentistIds = dentistLinks.map(dl => dl.dentistId);

  const [dentists, faqs, featuredSetting] = await Promise.all([
    prisma.dentist.findMany({
      where: { id: { in: dentistIds }, status: "PUBLISHED" },
      select: { id: true, slug: true, title: true, shortDesc: true, address: true, featuredImage: true },
      orderBy: { order: "asc" },
    }),
    prisma.fAQ.findMany({ where: { locationId: location.id }, orderBy: { order: "asc" } }),
    prisma.setting.findUnique({ where: { key: `loc_${location.id}_featured_ids` } }),
  ]);

  // Reviews for rating
  const reviewData = await prisma.review.findMany({
    where: { dentistId: { in: dentistIds }, approved: true, parentId: null },
    select: { dentistId: true, rating: true },
  });
  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of reviewData) {
    if (!r.dentistId) continue;
    const cur = ratingMap.get(r.dentistId) ?? { sum: 0, count: 0 };
    cur.sum += (r.rating ?? 0); cur.count++;
    ratingMap.set(r.dentistId, cur);
  }

  // Featured dentists
  const featuredIds: number[] = featuredSetting ? JSON.parse(featuredSetting.value) : [];
  const featuredDentists = featuredIds
    .map(id => dentists.find(d => d.id === id))
    .filter(Boolean) as typeof dentists;

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -90, left: -60, width: 320, height: 320, background: "radial-gradient(circle, rgba(21,184,209,.28), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "50px 20px 42px", position: "relative" }}>
          {/* Breadcrumb with links */}
          <nav style={{ fontSize: 13, color: "#8fb6c0", marginBottom: 14, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#8fb6c0", textDecoration: "none" }}>خانه</Link>
            <span>›</span>
            <Link href="/dentists-list" style={{ color: "#8fb6c0", textDecoration: "none" }}>دندانپزشکان</Link>
            {breadcrumb.slice(0, -1).map(crumb => (
              <span key={crumb.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span>›</span>
                <Link href={`/${crumb.slug}`} style={{ color: "#8fb6c0", textDecoration: "none" }}>{crumb.label}</Link>
              </span>
            ))}
            {breadcrumb.length > 0 && (
              <>
                <span>›</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{breadcrumb[breadcrumb.length - 1].label}</span>
              </>
            )}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "clamp(26px,4vw,40px)", fontWeight: 800 }}>
              دندانپزشکی در {location.shortTitle || location.title}
            </h1>
            <span style={{ background: "rgba(255,255,255,.16)", padding: "6px 14px", borderRadius: 30, fontSize: 14, fontWeight: 600 }}>
              {dentists.length} مرکز
            </span>
          </div>
          {location.shortDesc && (
            <p style={{ margin: "14px 0 0", maxWidth: 640, fontSize: 15.5, lineHeight: 2, color: "#c4dde4" }}>{location.shortDesc}</p>
          )}
        </div>
      </section>

      {/* Sub-region filter chips — only direct children */}
      {children.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 6px" }}>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
            <span style={{ border: "none", background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "9px 18px", borderRadius: 30, whiteSpace: "nowrap", flexShrink: 0 }}>
              {location.shortTitle || location.title}
            </span>
            {children.map(loc => (
              <Link key={loc.slug} href={`/${loc.slug}`}
                style={{ border: "1px solid #d2e8ee", background: "#fff", color: "#2a4f5b", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "9px 18px", borderRadius: 30, whiteSpace: "nowrap", flexShrink: 0 }}>
                {loc.shortTitle || loc.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Dentists */}
      {featuredDentists.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 16px 8px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>
            دندانپزشکان نمونه {location.shortTitle || location.title}
          </h2>
          <div style={{ display: "flex", gap: 18, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
            {featuredDentists.map((d, i) => {
              const stats = ratingMap.get(d.id);
              const avgRating = stats ? stats.sum / stats.count : 0;
              const reviewCount = stats?.count ?? 0;
              return (
                <Link key={d.id} href={`/${d.slug}`}
                  style={{ minWidth: "clamp(250px,27vw,310px)", flexShrink: 0, textDecoration: "none", background: "#fff", border: "2px solid #b8e1ec", borderRadius: 20, padding: 18, boxShadow: "0 14px 34px -20px rgba(13,75,107,.6)", display: "block" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {d.featuredImage ? (
                      <Image src={d.featuredImage} alt={d.title} width={64} height={64} style={{ borderRadius: 16, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <span style={{ width: 64, height: 64, borderRadius: 16, flexShrink: 0, background: gradientFromId(i), display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 22 }}>{getInitial(d.title)}</span>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: 15.5, fontWeight: 700, color: "#143945" }}>{d.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {avgRating > 0 && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fff6e6", color: "#d98a00", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 7 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
                            {avgRating.toFixed(1)}
                          </span>
                        )}
                        {reviewCount > 0 && <span style={{ color: "#6c8b95", fontSize: 12 }}>{reviewCount} نظر</span>}
                      </div>
                    </div>
                  </div>
                  {d.shortDesc && <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.85, color: "#5e7c85" }}>{d.shortDesc.slice(0, 90)}{d.shortDesc.length > 90 ? "…" : ""}</p>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Dentists Grid */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px" }}>
        {dentists.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6c8b95", fontSize: 16, padding: "40px 0" }}>هنوز دندانپزشکی در این منطقه ثبت نشده است.</p>
        ) : (
          <>
            <h2 style={{ margin: "0 0 16px", fontSize: "clamp(18px,2.2vw,24px)", fontWeight: 800, color: "#133b48" }}>
              همه دندانپزشکان {location.shortTitle || location.title}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {dentists.map((d, i) => {
                const stats = ratingMap.get(d.id);
                const reviewCount = stats?.count ?? 0;
                const avgRating = stats ? stats.sum / stats.count : 0;
                return (
                  <Link key={d.slug} href={`/${d.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 20, padding: 18, boxShadow: "0 14px 34px -28px rgba(13,75,107,.5)", display: "block" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {d.featuredImage ? (
                        <Image src={d.featuredImage} alt={d.title} width={64} height={64} style={{ borderRadius: 18, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0, background: gradientFromId(i), display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>{getInitial(d.title)}</span>
                      )}
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
                    {d.shortDesc && <p style={{ margin: "12px 0 12px", fontSize: 13.5, lineHeight: 1.9, color: "#5e7c85" }}>{d.shortDesc.slice(0, 80)}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #eef4f6" }}>
                      {d.address && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#6c8b95", fontSize: 13 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          {d.address.slice(0, 25)}
                        </span>
                      )}
                      <span style={{ color: "#0c8aa6", fontWeight: 700, fontSize: 13.5, marginRight: "auto" }}>پروفایل ←</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Long Description */}
      {location.longDesc && (
        <section style={{ maxWidth: 1280, margin: "18px auto", padding: "0 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(24px,3vw,40px)", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#133b48" }}>
              دندانپزشکی خوب در {location.shortTitle || location.title}
            </h2>
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
