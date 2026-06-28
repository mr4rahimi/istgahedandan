import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import DentistMap from "@/components/DentistMap";
import DentistReviewForm from "@/components/DentistReviewForm";
import { toJalali, getInitial, gradientFromId } from "@/lib/utils";

export default async function DentistSinglePage({ slug }: { slug: string }) {
  const dentist = await prisma.dentist.findUnique({ where: { slug } });
  if (!dentist) notFound();

  const [reviews, faqs, locationLinks] = await Promise.all([
    prisma.review.findMany({ where: { dentistId: dentist.id, approved: true }, orderBy: { createdAt: "desc" } }),
    prisma.fAQ.findMany({ where: { dentistId: dentist.id }, orderBy: { order: "asc" } }),
    prisma.dentistLocation.findMany({ where: { dentistId: dentist.id }, include: { location: { select: { slug: true, title: true } } } }),
  ]);

  const initial = getInitial(dentist.title);
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviewCount : 0;

  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviewCount > 0 ? (reviews.filter(r => r.rating === star).length / reviewCount) * 100 : 0,
  }));

  const socialLinks = (dentist.socialLinks as Record<string, string> | null) ?? {};
  const phones: string[] = dentist.phones ?? [];
  const gallery: string[] = dentist.gallery ?? [];
  const videos: string[] = dentist.videos ?? [];

  const mapLink = dentist.mapLat && dentist.mapLng
    ? `https://www.openstreetmap.org/?mlat=${dentist.mapLat}&mlon=${dentist.mapLng}&zoom=15`
    : null;

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Cover */}
      <section style={{ position: "relative" }}>
        <div style={{ height: 230, position: "relative", background: dentist.featuredImage ? undefined : "linear-gradient(135deg,#0c5e7c,#0a3f54)", overflow: "hidden" }}>
          {dentist.featuredImage && <Image src={dentist.featuredImage} alt={dentist.title} fill style={{ objectFit: "cover" }} />}
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 16px,rgba(255,255,255,.03) 16px 32px)" }} />
        </div>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ marginTop: -64, position: "relative", display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
            <span style={{ width: 120, height: 120, borderRadius: 28, background: gradientFromId(dentist.id), border: "5px solid #f4f9fb", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 46, boxShadow: "0 14px 30px -12px rgba(13,120,168,.6)", flexShrink: 0 }}>{initial}</span>
            <div style={{ flex: 1, minWidth: 240, paddingBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 800, color: "#133b48" }}>{dentist.title}</h1>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#e7f7ee", color: "#16a34a", fontSize: 13, fontWeight: 700, padding: "5px 11px", borderRadius: 20 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  تأیید شده
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, flexWrap: "wrap", color: "#5e7c85", fontSize: 14 }}>
                {reviewCount > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff6e6", color: "#d98a00", fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.6l1.2-6.5L2.5 9.5l6.6-.9z" /></svg>
                    {avgRating.toFixed(1)} ({reviewCount} نظر)
                  </span>
                )}
                {dentist.address && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9bb6bf" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {dentist.address.slice(0, 30)}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
              <Link href="#reserve" style={{ background: "linear-gradient(135deg,#15b8d1,#0a6f9e)", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 13, boxShadow: "0 10px 22px -10px rgba(13,120,168,.7)" }}>رزرو نوبت</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info + Map */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>

          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: 26, boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 19, fontWeight: 800, color: "#133b48" }}>اطلاعات تماس</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {phones.map((phone, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderBottom: "1px solid #eef4f6" }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: "#eef7fa", display: "grid", placeItems: "center", color: "#0c8aa6", flexShrink: 0 }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, color: "#8aa6af" }}>شماره تماس</div>
                    <a href={`tel:${phone}`} style={{ fontSize: 15, fontWeight: 700, color: "#143945", textDecoration: "none", direction: "ltr", display: "block" }}>{phone}</a>
                  </div>
                </div>
              ))}
              {dentist.address && (
                <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderBottom: "1px solid #eef4f6" }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: "#eef7fa", display: "grid", placeItems: "center", color: "#0c8aa6", flexShrink: 0 }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, color: "#8aa6af" }}>آدرس</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: "#143945", lineHeight: 1.7 }}>{dentist.address}</div>
                  </div>
                </div>
              )}
              {locationLinks.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0" }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: "#eef7fa", display: "grid", placeItems: "center", color: "#0c8aa6", flexShrink: 0 }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 12.5, color: "#8aa6af" }}>منطقه</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {locationLinks.map(dl => (
                        <Link key={dl.locationId} href={`/${dl.location.slug}`} style={{ color: "#0c8aa6", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>{dl.location.title}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(socialLinks.whatsapp || socialLinks.telegram || socialLinks.instagram) && (
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                {socialLinks.whatsapp && (
                  <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#25d366", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: 11, borderRadius: 12 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z" /></svg>
                    واتساپ
                  </a>
                )}
                {socialLinks.telegram && (
                  <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#229ED9", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: 11, borderRadius: 12 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M21.95 4.6l-3.32 15.66c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15L17.4 6.9c.4-.36-.09-.56-.63-.2L6.18 13.4l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6L20.55 3.1c.9-.34 1.69.2 1.4 1.5z" /></svg>
                    تلگرام
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#E1306C", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: 11, borderRadius: 12 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5.5" /><circle cx="12" cy="12" r="4.2" /></svg>
                    اینستاگرام
                  </a>
                )}
              </div>
            )}
          </div>

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
              <a href={mapLink} target="_blank" rel="noopener noreferrer" style={{ margin: "0 16px 16px", textAlign: "center", background: "#eef7fa", color: "#0c8aa6", textDecoration: "none", fontWeight: 700, fontSize: 14, padding: 12, borderRadius: 12 }}>مسیریابی در نقشه</a>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      {(dentist.shortDesc || dentist.longDesc) && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(24px,3vw,40px)", boxShadow: "0 16px 40px -32px rgba(13,75,107,.5)" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>درباره {dentist.title}</h2>
            {dentist.shortDesc && <p style={{ margin: "0 0 16px", fontSize: 16, color: "#143945", fontWeight: 600, lineHeight: 2 }}>{dentist.shortDesc}</p>}
            {dentist.longDesc && <div dangerouslySetInnerHTML={{ __html: dentist.longDesc }} style={{ fontSize: 15, lineHeight: 2.15, color: "#41616b" }} />}
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>تصاویر مرکز</h2>
            <span style={{ color: "#8aa6af", fontSize: 14 }}>{gallery.length} عکس</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {gallery.map((img, i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 16, overflow: "hidden", position: "relative" }}>
                <Image src={img} alt={`تصویر ${i + 1}`} fill style={{ objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 16px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 800, color: "#133b48" }}>ویدئوهای مرکز</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
            {videos.map((vid, i) => (
              <a key={i} href={vid} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", borderRadius: 18, overflow: "hidden", position: "relative", aspectRatio: "16/10", background: "linear-gradient(135deg,#0c5e7c,#0a3f54)" }}>
                <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 14px,rgba(255,255,255,.03) 14px 28px)" }} />
                <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <span style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center", boxShadow: "0 8px 20px rgba(0,0,0,.3)" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#0b5e7a"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </span>
                <span style={{ position: "absolute", bottom: 12, right: 14, color: "#fff", fontWeight: 600, fontSize: 14, textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>ویدئو {i + 1}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section id="reserve" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px 40px" }}>
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
                {starCounts.map(({ star, count, pct }) => (
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
                {reviews.slice(0, 6).map((rv, i) => (
                  <div key={rv.id} style={{ background: "#f7fbfc", border: "1px solid #eef4f6", borderRadius: 16, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <span style={{ width: 44, height: 44, borderRadius: "50%", background: gradientFromId(i), display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>
                        {(rv.authorName || "ک")[0]}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#143945" }}>{rv.authorName || "کاربر"}</div>
                        <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= (rv.rating ?? 0) ? "#f5a623" : "#e5e7eb"}>
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
