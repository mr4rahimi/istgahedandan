import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

const gradients = [
  "linear-gradient(135deg,#0c5e7c,#0a3f54)",
  "linear-gradient(135deg,#0a6f9e,#5b2171)",
  "linear-gradient(135deg,#8b5cf6,#16b8d1)",
  "linear-gradient(135deg,#0a8f86,#0a3f54)",
  "linear-gradient(135deg,#f43f5e,#a21caf)",
  "linear-gradient(135deg,#0ea5e9,#22c55e)",
  "linear-gradient(135deg,#f59e0b,#ec4899)",
  "linear-gradient(135deg,#6366f1,#0a6f9e)",
];

export default async function ServiceSinglePage({ slug }: { slug: string }) {
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) notFound();

  const [faqs, otherServices, contact] = await Promise.all([
    prisma.fAQ.findMany({ where: { serviceId: service.id }, orderBy: { order: "asc" } }),
    prisma.service.findMany({ where: { slug: { not: slug } }, take: 4, select: { slug: true, title: true, id: true } }),
    prisma.setting.findMany({ where: { key: { in: ["contact_phone"] } } }),
  ]);
  const phone = contact.find(c => c.key === "contact_phone")?.value;

  return (
    <div style={{ direction: "rtl", fontFamily: "inherit", background: "#f4f9fb", color: "#16313b", minHeight: "100vh", paddingBottom: 80 }}>
      <Header />

      {/* Hero */}
      <section style={{ position: "relative", height: 360, background: service.featuredImage ? undefined : "linear-gradient(135deg,#0c5e7c,#0a3f54)", overflow: "hidden" }}>
        {service.featuredImage && (
          <img src={service.featuredImage} alt={service.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.1) 0 16px,rgba(255,255,255,.03) 16px 32px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(8,47,62,.2),rgba(8,47,62,.85))" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, maxWidth: 1280, margin: "0 auto", padding: "0 20px 36px" }}>
          <nav style={{ fontSize: 13, color: "#b9d4dc", marginBottom: 14 }}>
            <Link href="/" style={{ color: "#b9d4dc", textDecoration: "none" }}>خانه</Link>
            {" › "}
            <Link href="/خدمات" style={{ color: "#b9d4dc", textDecoration: "none" }}>خدمات</Link>
            {" › "}{service.title}
          </nav>
          <span style={{ display: "inline-block", background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)", color: "#fff", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 30, marginBottom: 14 }}>خدمات تخصصی</span>
          <h1 style={{ margin: 0, color: "#fff", fontSize: "clamp(28px,4.4vw,46px)", fontWeight: 800 }}>{service.title}</h1>
        </div>
      </section>

      {/* Body */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 16px" }}>
        <div style={{ display: "flex", gap: 30, flexWrap: "wrap", alignItems: "flex-start" }}>

          <article style={{ flex: "1 1 460px", minWidth: 280, background: "#fff", border: "1px solid #e7f0f3", borderRadius: 22, padding: "clamp(22px,3vw,40px)", boxShadow: "0 16px 40px -30px rgba(13,75,107,.5)", lineHeight: 2.15, color: "#355560", fontSize: 15.5 }}>
            {service.shortDesc && (
              <p style={{ margin: "0 0 20px", fontSize: 17, color: "#143945", fontWeight: 600, lineHeight: 2 }}>{service.shortDesc}</p>
            )}
            {service.content ? (
              <div dangerouslySetInnerHTML={{ __html: service.content }} style={{ lineHeight: 2.1 }} />
            ) : (
              <p style={{ margin: 0, color: "#6c8b95" }}>محتوای این خدمت به زودی اضافه می‌شود.</p>
            )}

            {faqs.length > 0 && (
              <div style={{ marginTop: 36 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#133b48", margin: "0 0 18px" }}>سوالات متداول</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {faqs.map(faq => (
                    <details key={faq.id} style={{ background: "#f8fbfc", border: "1px solid #e2edf1", borderRadius: 14, overflow: "hidden" }}>
                      <summary style={{ padding: "16px 18px", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#133b48", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {faq.question}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0c8aa6" strokeWidth="2.2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </summary>
                      <div style={{ padding: "0 18px 16px", fontSize: 14.5, lineHeight: 2, color: "#4a6570" }}>{faq.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside style={{ flex: "0 1 290px", minWidth: 260, display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 88 }}>
            <div style={{ background: "linear-gradient(135deg,#0e4d63,#0a2f3e)", color: "#fff", borderRadius: 20, padding: 26 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 19, fontWeight: 800 }}>مشاوره و رزرو نوبت</h3>
              <p style={{ margin: "0 0 18px", fontSize: 14, color: "#b9d4dc", lineHeight: 1.9 }}>برای دریافت مشاوره تخصصی با ما در تماس باشید.</p>
              <Link href="#reserve" style={{ display: "block", textAlign: "center", background: "#fff", color: "#0b5e7a", textDecoration: "none", fontWeight: 700, fontSize: 15, padding: 13, borderRadius: 12, marginBottom: 10 }}>رزرو نوبت آنلاین</Link>
              {phone && (
                <a href={`tel:${phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,.12)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: 13, borderRadius: 12 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  تماس تلفنی
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Other Services */}
      {otherServices.length > 0 && (
        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 16px 50px" }}>
          <h2 style={{ margin: "0 0 22px", fontSize: "clamp(20px,2.6vw,28px)", fontWeight: 800, color: "#133b48" }}>سایر خدمات</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
            {otherServices.map((s, i) => (
              <Link key={s.slug} href={`/${s.slug}`} style={{ textDecoration: "none", background: "#fff", border: "1px solid #e7f0f3", borderRadius: 18, overflow: "hidden", boxShadow: "0 12px 30px -26px rgba(13,75,107,.5)", display: "block" }}>
                <div style={{ height: 100, background: gradients[(s.id + i) % gradients.length], position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.14) 0 11px,rgba(255,255,255,.04) 11px 22px)" }} />
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#143945" }}>{s.title}</h3>
                  <span style={{ color: "#0c8aa6", fontSize: 13, fontWeight: 600 }}>مشاهده ←</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
}
