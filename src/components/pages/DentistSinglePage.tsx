import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import DentistMap from "@/components/DentistMap";
import DentistReviewForm from "@/components/DentistReviewForm";
import DentistStories from "@/components/DentistStories";
import DentistGallery from "@/components/DentistGallery";
import DentistVideoSection from "@/components/DentistVideoSection";
import { toJalali, getInitial, gradientFromId } from "@/lib/utils";

export default async function DentistSinglePage({ slug }: { slug: string }) {
  const dentist = await prisma.dentist.findUnique({ where: { slug } });
  if (!dentist) notFound();

  const [reviews, faqs, dentistLocs, stories, dentistVideos, dentistSvcs] = await Promise.all([
    prisma.review.findMany({ where: { dentistId: dentist.id, approved: true }, orderBy: { createdAt: "desc" } }),
    prisma.fAQ.findMany({ where: { dentistId: dentist.id }, orderBy: { order: "asc" } }),
    prisma.dentistLocation.findMany({ where: { dentistId: dentist.id }, select: { locationId: true } }),
    prisma.dentistStory.findMany({ where: { dentistId: dentist.id }, orderBy: { order: "asc" } }),
    prisma.dentistVideo.findMany({ where: { dentistId: dentist.id }, orderBy: { order: "asc" } }),
    prisma.dentistService.findMany({ where: { dentistId: dentist.id }, select: { serviceId: true } }),
  ]);

  // Fetch related records separately (Prisma v7 adapter: no include)
  const locationIds = dentistLocs.map(l => l.locationId);
  const serviceIds = dentistSvcs.map(s => s.serviceId);
  const [locationsData, servicesData] = await Promise.all([
    locationIds.length > 0 ? prisma.location.findMany({ where: { id: { in: locationIds } }, select: { id: true, slug: true, title: true } }) : [],
    serviceIds.length > 0 ? prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, slug: true, title: true } }) : [],
  ]);

  const locationLinks = dentistLocs.map(dl => ({
    locationId: dl.locationId,
    location: locationsData.find(l => l.id === dl.locationId) ?? { slug: "", title: "" },
  }));
  const serviceLinks = dentistSvcs.map(ds => ({
    serviceId: ds.serviceId,
    service: servicesData.find(s => s.id === ds.serviceId) ?? { slug: "", title: "" },
  }));

  const initial = getInitial(dentist.title);
  const reviewCount = reviews.length;
  const ratedReviews = reviews.filter(r => r.rating != null);
  const avgRating = ratedReviews.length > 0 ? ratedReviews.reduce((s, r) => s + (r.rating ?? 0), 0) / ratedReviews.length : 4;
  const displayRating = ratedReviews.length > 0 ? avgRating : null;

  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviewCount > 0 ? (reviews.filter(r => r.rating === star).length / reviewCount) * 100 : 0,
  }));

  const gallery: string[] = dentist.gallery ?? [];
  const mapLink = dentist.mapLat && dentist.mapLng
    ? `https://www.openstreetmap.org/?mlat=${dentist.mapLat}&mlon=${dentist.mapLng}&zoom=15`
    : null;

  const phoneList: string[] = Array.isArray(dentist.phones) ? dentist.phones as string[] : [];

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* COVER + PROFILE HEADER */}
      <section style={{ position: "relative" }}>
        {/* Cover image */}
        <div style={{ height: 230, position: "relative", background: "linear-gradient(135deg,#0c5e7c,#0a3f54)", overflow: "hidden" }}>
          {dentist.featuredImage && (
            <Image src={dentist.featuredImage} alt={dentist.title} fill style={{ objectFit: "cover" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 16px,rgba(255,255,255,.03) 16px 32px)" }} />
        </div>

        {/* Info band below cover */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>

          {/* Avatar + buttons row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ width: 150, height: 150, borderRadius: 32, background: gradientFromId(dentist.id), border: "5px solid #f4f9fb", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 56, boxShadow: "0 14px 30px -12px rgba(13,120,168,.6)", flexShrink: 0, marginTop: -75, position: "relative", zIndex: 10 }}>
              {initial}
            </span>
            <div style={{ display: "flex", gap: 10, paddingTop: 20 }}>
              <Link href="#reviews" style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 13, boxShadow: "0 10px 22px -10px rgba(13,120,168,.7)" }}>رزرو نوبت</Link>
              <button style={{ width: 48, height: 48, border: "1px solid #d7e6ea", background: "#fff", borderRadius: 13, display: "grid", placeItems: "center", cursor: "pointer", color: "#0c8aa6" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.5-1.5 3-3.5 3-5.5A4.5 4.5 0 0 0 12 6 4.5 4.5 0 0 0 2 8.5c0 2 1.5 4 3 5.5l7 7z" /></svg>
              </button>
            </div>
          </div>

          {/* Title + breadcrumbs below avatar */}
          <div style={{ marginTop: 16, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "clamp(22px,3.2vw,32px)", fontWeight: 800, color: "#133b48" }}>{dentist.title}</h1>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#e7f7ee", color: "#16a34a", fontSize: 13, fontWeight: 700, padding: "5px 11px", borderRadius: 20 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                تأیید شده
              </span>
            </div>

            {/* Breadcrumbs + rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              {/* Breadcrumbs */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, flexWrap: "wrap" }}>
                <Link href="/دندانپزشکان" style={{ color: "#0c8aa6", textDecoration: "none", fontWeight: 600 }}>دندانپزشکان</Link>
                {locationLinks.map(dl => (
                  <span key={dl.locationId} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    <Link href={`/${dl.location.slug}`} style={{ color: "#0c8aa6", textDecoration: "none", fontWeight: 600 }}>{dl.location.title}</Link>
                  </span>
                ))}
              </div>

              {/* Rating */}
              {displayRating !== null && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff6e6", color: "#d98a00", fontWeight: 700, padding: "4px 12px", borderRadius: 10, fontSize: 13.5 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
                  {displayRating.toFixed(1)}
                  <span style={{ color: "#b8966a", fontWeight: 500 }}>({reviewCount} نظر)</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STORIES */}
      <DentistStories stories={stories} initial={initial} />

      {/* INFO + MAP */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>

          {/* Contact */}
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: 26, boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 19, fontWeight: 800, color: "#133b48" }}>اطلاعات و راه‌های ارتباطی</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>

              {phoneList.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderBottom: "1px solid #eef4f6" }}>
                  <ContactIcon><PhoneIcon /></ContactIcon>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: "#8aa6af" }}>شماره تماس</div>
                    {phoneList.map((p, i) => <a key={i} href={`tel:${p}`} style={{ fontSize: 15, fontWeight: 700, color: "#143945", textDecoration: "none", direction: "ltr", display: "block" }}>{p}</a>)}
                  </div>
                </div>
              )}

              {dentist.centerCode && (
                <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderBottom: "1px solid #eef4f6" }}>
                  <ContactIcon><CodeIcon /></ContactIcon>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: "#8aa6af" }}>کد مرکز</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#143945" }}>{dentist.centerCode}</div>
                  </div>
                </div>
              )}

              {dentist.address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 13, padding: "13px 0", borderBottom: "1px solid #eef4f6" }}>
                  <ContactIcon><MapPinIcon /></ContactIcon>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: "#8aa6af" }}>آدرس</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: "#143945", lineHeight: 1.7 }}>{dentist.address}</div>
                  </div>
                </div>
              )}

              {dentist.workingHours && (
                <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderBottom: locationLinks.length > 0 ? "1px solid #eef4f6" : undefined }}>
                  <ContactIcon><ClockIcon /></ContactIcon>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: "#8aa6af" }}>ساعت کاری</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: "#143945" }}>{String(dentist.workingHours)}</div>
                  </div>
                </div>
              )}

              {locationLinks.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0" }}>
                  <ContactIcon>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  </ContactIcon>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: "#8aa6af" }}>منطقه</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {locationLinks.map(dl => (
                        <Link key={dl.locationId} href={`/${dl.location.slug}`} style={{ color: "#0c8aa6", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>{dl.location.title}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social */}
            {(dentist.whatsapp || dentist.telegram || dentist.instagram) && (
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                {dentist.whatsapp && (
                  <a href={dentist.whatsapp} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#25d366", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: 11, borderRadius: 12 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z" /></svg>
                    واتساپ
                  </a>
                )}
                {dentist.telegram && (
                  <a href={dentist.telegram} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#229ED9", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: 11, borderRadius: 12 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21.95 4.6l-3.32 15.66c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15L17.4 6.9c.4-.36-.09-.56-.63-.2L6.18 13.4l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6L20.55 3.1c.9-.34 1.69.2 1.4 1.5z" /></svg>
                    تلگرام
                  </a>
                )}
                {dentist.instagram && (
                  <a href={dentist.instagram} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#E1306C", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: 11, borderRadius: 12 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5.5" /><circle cx="12" cy="12" r="4.2" /></svg>
                    اینستاگرام
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 26px 0" }}><h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#133b48" }}>موقعیت روی نقشه</h2></div>
            <div style={{ flex: 1, margin: 16, borderRadius: 16, overflow: "hidden", minHeight: 280 }}>
              {dentist.mapLat && dentist.mapLng ? (
                <DentistMap lat={dentist.mapLat} lng={dentist.mapLng} title={dentist.title} />
              ) : (
                <div style={{ height: 280, background: "repeating-linear-gradient(135deg,#e6f0f3 0 22px,#edf5f8 22px 44px)", display: "grid", placeItems: "center", borderRadius: 16 }}>
                  <span style={{ color: "#8aa6af", fontSize: 14 }}>موقعیت جغرافیایی ثبت نشده</span>
                </div>
              )}
            </div>
            {mapLink && (
              <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{ margin: "0 16px 16px", textAlign: "center", background: "#eef7fa", color: "#0c8aa6", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: 12, borderRadius: 12, display: "block" }}>مسیریابی در نقشه</a>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT (shortDesc) */}
      {dentist.shortDesc && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(24px,3vw,40px)", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>درباره {dentist.title}</h2>
            <p style={{ margin: 0, fontSize: 16, color: "#143945", fontWeight: 600, lineHeight: 2 }}>{dentist.shortDesc}</p>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {serviceLinks.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(22px,3vw,34px)", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>خدمات این مرکز</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {serviceLinks.map(sl => (
                <Link key={sl.serviceId} href={`/${sl.service.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f1f8fa", border: "1px solid #e2eef2", color: "#2a4f5b", fontWeight: 600, fontSize: 14.5, padding: "11px 18px", borderRadius: 13, textDecoration: "none" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {sl.service.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY */}
      <DentistGallery images={gallery} />

      {/* VIDEOS */}
      <DentistVideoSection videos={dentistVideos} />

      {/* LONG DESC (after videos, before reviews) */}
      {dentist.longDesc && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(24px,3vw,40px)", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>اطلاعات تکمیلی</h2>
            <div dangerouslySetInnerHTML={{ __html: dentist.longDesc }} style={{ fontSize: 15, lineHeight: 2.15, color: "#41616b" }} />
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section id="reviews" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 40px" }}>
        <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(22px,3vw,36px)", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>

          {reviewCount > 0 && (
            <div style={{ display: "flex", gap: 30, flexWrap: "wrap", alignItems: "center", marginBottom: 26, paddingBottom: 24, borderBottom: "1px solid #eef4f6" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 54, fontWeight: 800, color: "#133b48", lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                <div style={{ display: "flex", gap: 3, justifyContent: "center", margin: "8px 0 6px" }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill={s <= Math.round(avgRating) ? "#f5a623" : "#e5e7eb"}>
                      <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" />
                    </svg>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "#8aa6af" }}>{reviewCount} نظر</div>
              </div>
              <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
                {starCounts.map(({ star, pct, count }) => (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "#6c8b95", width: 28 }}>{star}★</span>
                    <div style={{ flex: 1, height: 8, background: "#eef4f6", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#15b8d1,#0a6f9e)", borderRadius: 5 }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#8aa6af", width: 36 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <>
              <h3 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 700, color: "#133b48" }}>نظرات کاربران</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                {reviews.slice(0, 10).map((rv, i) => (
                  <div key={rv.id} style={{ background: "#f7fbfc", border: "1px solid #eef4f6", borderRadius: 16, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <span style={{ width: 44, height: 44, borderRadius: "50%", background: gradientFromId(i), display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>
                        {(rv.authorName || "ک")[0]}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#143945" }}>{rv.authorName || "کاربر"}</div>
                        <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= (rv.rating ?? Math.round(avgRating)) ? "#f5a623" : "#e5e7eb"}>
                              <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: 12.5, color: "#9bb6bf" }}>{toJalali(rv.createdAt)}</span>
                    </div>
                    {rv.content && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.95, color: "#5e7c85" }}>{rv.content}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          <DentistReviewForm dentistId={dentist.id} />
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 50px" }}>
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

function ContactIcon({ children }: { children: React.ReactNode }) {
  return <span style={{ width: 42, height: 42, borderRadius: 12, background: "#eef7fa", display: "grid", placeItems: "center", color: "#0c8aa6", flexShrink: 0 }}>{children}</span>;
}
function PhoneIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>; }
function CodeIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" strokeLinecap="round" /></svg>; }
function MapPinIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function ClockIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" strokeLinecap="round" /></svg>; }
